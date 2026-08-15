from rest_framework import serializers
from .models import AOI, AnalysisJob
from apps.incidents.serializers import IncidentSummarySerializer

class AOISerializer(serializers.ModelSerializer):
    class Meta:
        model = AOI
        fields = ['id', 'name', 'geometry', 'area_sqkm', 'created_at']

class AnalysisRequestSerializer(serializers.Serializer):
    aoi = serializers.JSONField(required=True, help_text="GeoJSON Polygon/MultiPolygon or AOI Object")
    aoi_name = serializers.CharField(required=False, allow_blank=True, default="Selected AOI")
    historical_start = serializers.CharField(required=True)
    historical_end = serializers.CharField(required=True)
    current_start = serializers.CharField(required=True)
    current_end = serializers.CharField(required=True)
    threshold = serializers.FloatField(required=False, default=-0.3)
    min_area_ha = serializers.FloatField(required=False, default=0.5)

class AnalysisJobSerializer(serializers.ModelSerializer):
    incidents = IncidentSummarySerializer(many=True, read_only=True)
    aoi = AOISerializer(read_only=True)

    class Meta:
        model = AnalysisJob
        fields = [
            'id',
            'aoi',
            'historical_start',
            'historical_end',
            'current_start',
            'current_end',
            'threshold',
            'min_area_ha',
            'algorithm_version',
            'status',
            'tile_url_template',
            'created_at',
            'incidents'
        ]
