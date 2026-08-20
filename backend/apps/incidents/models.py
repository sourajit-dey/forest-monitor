from django.db import models
from apps.analysis.models import AnalysisJob

class Incident(models.Model):
    """
    Identified area of potential vegetation loss detected via NDVI differencing.
    Stores explainable telemetry and simplified vector geometry.
    """
    STATUS_CHOICES = [
        ('requires_verification', 'Requires Field Verification'),
        ('verified_loss', 'Field Verified Loss'),
        ('false_positive', 'False Positive / Permitted Activity'),
        ('resolved', 'Inspection Completed'),
    ]

    analysis_job = models.ForeignKey(AnalysisJob, on_delete=models.CASCADE, related_name='incidents')
    geometry = models.JSONField(help_text="Simplified GeoJSON polygon of the loss zone")
    area_hectares = models.FloatField(help_text="Surface area in hectares")
    ndvi_before = models.FloatField(help_text="Mean baseline NDVI")
    ndvi_after = models.FloatField(help_text="Mean monitoring NDVI")
    ndvi_change = models.FloatField(help_text="Mean delta NDVI (negative)")
    centroid_lat = models.FloatField()
    centroid_lng = models.FloatField()
    detected_date = models.CharField(max_length=20)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='requires_verification')
    predicted_class = models.CharField(max_length=100, null=True, blank=True, help_text="Predicted risk class from ML model")
    confidence = models.FloatField(null=True, blank=True, help_text="Confidence score of the prediction")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-area_hectares']

    def __str__(self):
        return f"Incident #{self.id} - {self.area_hectares:.2f} ha (Δ {self.ndvi_change:.3f})"


class Report(models.Model):
    """
    Officer Verification Report generated via Gemini based strictly on deterministic telemetry.
    """
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='reports')
    generated_text = models.TextField()
    model_name = models.CharField(max_length=100, default="gemini-1.5-flash")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for Incident #{self.incident_id} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
