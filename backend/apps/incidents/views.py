import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from .models import Incident, Report
from .serializers import (
    IncidentSummarySerializer,
    IncidentGeoJSONSerializer,
    ReportSerializer
)
from gemini.report_prompt import generate_incident_report

logger = logging.getLogger(__name__)

class IncidentListView(generics.ListAPIView):
    """
    GET /api/incidents/
    Returns list of incident summaries. Can filter by ?job_id=<id>.
    """
    serializer_class = IncidentSummarySerializer

    def get_queryset(self):
        queryset = Incident.objects.all().select_related('analysis_job', 'analysis_job__aoi')
        job_id = self.request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(analysis_job_id=job_id)
        return queryset


class IncidentDetailView(generics.RetrieveAPIView):
    """
    GET /api/incidents/{id}/
    Returns detailed summary for one incident.
    """
    queryset = Incident.objects.all()
    serializer_class = IncidentSummarySerializer


class IncidentGeoJSONView(APIView):
    """
    GET /api/incidents/{id}/geojson/
    Returns full GeoJSON Feature geometry for a single incident on-demand when clicked on map.
    Does not transmit all incident polygons in bulk.
    """
    def get(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({"error": "Incident not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = IncidentGeoJSONSerializer(incident)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GenerateReportView(APIView):
    """
    POST /api/incidents/{id}/generate-report/
    Generates a deterministic-grounded Forest Officer Verification Report using Gemini.
    Enforces strict guardrails and stores generated text in the database.
    """
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def post(self, request, pk):
        try:
            incident = Incident.objects.select_related('analysis_job', 'analysis_job__aoi').get(pk=pk)
        except Incident.DoesNotExist:
            return Response({"error": "Incident not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if recent report already exists
        existing_report = incident.reports.order_by('-created_at').first()
        if existing_report and not request.data.get('force_regenerate', False):
            return Response(ReportSerializer(existing_report).data, status=status.HTTP_200_OK)

        aoi_name = incident.analysis_job.aoi.name if incident.analysis_job.aoi else "Forest Area"

        incident_dict = {
            "id": incident.id,
            "area_hectares": incident.area_hectares,
            "ndvi_before": incident.ndvi_before,
            "ndvi_after": incident.ndvi_after,
            "ndvi_change": incident.ndvi_change,
            "centroid_lat": incident.centroid_lat,
            "centroid_lng": incident.centroid_lng,
            "detected_date": incident.detected_date,
            "status": incident.get_status_display()
        }

        try:
            report_text = generate_incident_report(incident_dict, aoi_name=aoi_name)
            report_obj = Report.objects.create(
                incident=incident,
                generated_text=report_text,
                model_name="gemini-1.5-flash"
            )
            return Response(ReportSerializer(report_obj).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error generating officer report: {e}")
            return Response({
                "error": "Report generation failed.",
                "details": str(e)
            }, status=status.HTTP_502_BAD_GATEWAY)
