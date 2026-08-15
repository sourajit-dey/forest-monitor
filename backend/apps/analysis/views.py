import logging
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from .models import AOI, AnalysisJob
from .serializers import AnalysisRequestSerializer
from .validators import validate_aoi_geojson, validate_date_ranges, validate_threshold
from caching.cache_keys import build_analysis_cache_key
from gee.change_detection import run_gee_change_detection
from apps.incidents.models import Incident
from apps.incidents.serializers import IncidentSummarySerializer

logger = logging.getLogger(__name__)

# Completed AnalysisJob rows are the analysis cache. Rows older than this TTL
# are treated as expired and pruned so the free-tier DB only retains ~1h of
# analyses during the hackathon demo (configurable via CACHE_TTL_SECONDS).
CACHE_TTL = timedelta(seconds=getattr(settings, 'CACHE_TTL_SECONDS', 3600))

class AnalyzeView(APIView):
    """
    POST /api/analyze/
    Primary endpoint for executing Sentinel-2 NDVI change detection.
    Synchronous execution with database-backed caching and strict payload validation.
    """
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def post(self, request):
        serializer = AnalysisRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        raw_aoi = data['aoi']
        aoi_name = data.get('aoi_name') or 'Custom Forest AOI'
        hist_start = data['historical_start']
        hist_end = data['historical_end']
        curr_start = data['current_start']
        curr_end = data['current_end']
        threshold = validate_threshold(data.get('threshold', -0.3))
        min_area_ha = float(data.get('min_area_ha', 0.5))

        # 1. Validation of geometry and date logic
        aoi_geom, aoi_sqkm = validate_aoi_geojson(raw_aoi)
        validate_date_ranges(hist_start, hist_end, curr_start, curr_end)

        # 2. Caching check (1-hour TTL: expired cache rows are pruned)
        cache_key = build_analysis_cache_key(
            aoi_geojson=aoi_geom,
            historical_start=hist_start,
            historical_end=hist_end,
            current_start=curr_start,
            current_end=curr_end,
            threshold=threshold
        )

        cutoff = timezone.now() - CACHE_TTL
        AnalysisJob.objects.filter(created_at__lt=cutoff, status='complete').delete()

        existing_job = AnalysisJob.objects.filter(
            cache_key=cache_key,
            status='complete',
            created_at__gte=cutoff
        ).first()
        if existing_job:
            logger.info(f"Cache hit for analysis key {cache_key}. Returning stored incidents.")
            incidents = existing_job.incidents.all()
            return Response({
                'job_id': existing_job.id,
                'status': existing_job.status,
                'cached': True,
                'tile_url_template': existing_job.tile_url_template,
                'aoi': {
                    'id': existing_job.aoi.id,
                    'name': existing_job.aoi.name,
                    'area_sqkm': existing_job.aoi.area_sqkm,
                    'geometry': existing_job.aoi.geometry
                },
                'incidents': IncidentSummarySerializer(incidents, many=True).data,
                'summary': {
                    'total_incidents': incidents.count(),
                    'total_loss_hectares': round(sum(inc.area_hectares for inc in incidents), 2),
                    'mean_ndvi_loss': round(sum(inc.ndvi_change for inc in incidents) / max(1, incidents.count()), 3) if incidents.exists() else 0.0
                }
            }, status=status.HTTP_200_OK)

        # 3. Create AOI & Pending Job
        try:
            with transaction.atomic():
                aoi_obj = AOI.objects.create(
                    name=aoi_name,
                    geometry=aoi_geom,
                    area_sqkm=aoi_sqkm
                )
                job = AnalysisJob.objects.create(
                    aoi=aoi_obj,
                    historical_start=hist_start,
                    historical_end=hist_end,
                    current_start=curr_start,
                    current_end=curr_end,
                    threshold=threshold,
                    min_area_ha=min_area_ha,
                    cache_key=cache_key,
                    status='pending'
                )

            # 4. Run GEE Pipeline
            tile_url, detected_incidents = run_gee_change_detection(
                aoi_geojson=aoi_geom,
                historical_start=hist_start,
                historical_end=hist_end,
                current_start=curr_start,
                current_end=curr_end,
                threshold=threshold,
                min_area_ha=min_area_ha
            )

            # 5. Persist Incidents
            incident_objs = []
            for inc in detected_incidents:
                incident_objs.append(Incident(
                    analysis_job=job,
                    geometry=inc['geometry'],
                    area_hectares=inc['area_hectares'],
                    ndvi_before=inc['ndvi_before'],
                    ndvi_after=inc['ndvi_after'],
                    ndvi_change=inc['ndvi_change'],
                    centroid_lat=inc['centroid_lat'],
                    centroid_lng=inc['centroid_lng'],
                    detected_date=inc['detected_date'],
                    status=inc.get('status', 'requires_verification')
                ))

            Incident.objects.bulk_create(incident_objs)

            # 6. Mark Job Complete
            job.status = 'complete'
            job.tile_url_template = tile_url
            job.save(update_fields=['status', 'tile_url_template'])

            persisted_incidents = job.incidents.all()
            return Response({
                'job_id': job.id,
                'status': 'complete',
                'cached': False,
                'tile_url_template': tile_url,
                'aoi': {
                    'id': aoi_obj.id,
                    'name': aoi_obj.name,
                    'area_sqkm': aoi_obj.area_sqkm,
                    'geometry': aoi_obj.geometry
                },
                'incidents': IncidentSummarySerializer(persisted_incidents, many=True).data,
                'summary': {
                    'total_incidents': persisted_incidents.count(),
                    'total_loss_hectares': round(sum(inc.area_hectares for inc in persisted_incidents), 2),
                    'mean_ndvi_loss': round(sum(inc.ndvi_change for inc in persisted_incidents) / max(1, persisted_incidents.count()), 3) if persisted_incidents.exists() else 0.0
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Analysis pipeline error: {e}", exc_info=True)
            if 'job' in locals():
                job.status = 'failed'
                job.save(update_fields=['status'])
            return Response({
                'error': 'Remote sensing change detection failed.',
                'details': str(e)
            }, status=status.HTTP_502_BAD_GATEWAY)
