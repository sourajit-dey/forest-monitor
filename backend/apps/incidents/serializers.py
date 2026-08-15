from rest_framework import serializers
from .models import Incident, Report

class IncidentSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for incident list and analyze response.
    Omits heavy GeoJSON polygon geometry to ensure fast payload size.
    """
    class Meta:
        model = Incident
        fields = [
            'id',
            'area_hectares',
            'ndvi_before',
            'ndvi_after',
            'ndvi_change',
            'centroid_lat',
            'centroid_lng',
            'detected_date',
            'status',
            'created_at'
        ]

class IncidentGeoJSONSerializer(serializers.ModelSerializer):
    """
    Full GeoJSON Feature serializer for a single incident on-demand.
    """
    type = serializers.CharField(default="Feature", read_only=True)
    properties = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = ['type', 'id', 'geometry', 'properties']

    def get_properties(self, obj):
        return {
            'id': obj.id,
            'area_hectares': obj.area_hectares,
            'ndvi_before': obj.ndvi_before,
            'ndvi_after': obj.ndvi_after,
            'ndvi_change': obj.ndvi_change,
            'centroid_lat': obj.centroid_lat,
            'centroid_lng': obj.centroid_lng,
            'detected_date': obj.detected_date,
            'status': obj.status,
            'status_display': obj.get_status_display()
        }

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'incident_id', 'generated_text', 'model_name', 'created_at']
