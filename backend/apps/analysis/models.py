from django.db import models

class AOI(models.Model):
    """
    Area of Interest (AOI) boundary definition.
    Can represent predefined forest reserves or user-drawn polygons.
    """
    name = models.CharField(max_length=255, blank=True, null=True)
    geometry = models.JSONField(help_text="GeoJSON Polygon/MultiPolygon coordinates")
    area_sqkm = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or f"AOI #{self.id} ({self.area_sqkm:.1f} km²)"


class AnalysisJob(models.Model):
    """
    Represents an NDVI change detection job run over an AOI for specific date windows.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('complete', 'Complete'),
        ('failed', 'Failed'),
    ]

    aoi = models.ForeignKey(AOI, on_delete=models.CASCADE, related_name='analysis_jobs')
    historical_start = models.CharField(max_length=20)
    historical_end = models.CharField(max_length=20)
    current_start = models.CharField(max_length=20)
    current_end = models.CharField(max_length=20)
    threshold = models.FloatField(default=-0.3)
    min_area_ha = models.FloatField(default=0.5)
    algorithm_version = models.CharField(max_length=50, default="v1.0-ndvi-delta")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    tile_url_template = models.TextField(blank=True, default='')
    cache_key = models.CharField(max_length=255, db_index=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Job #{self.id} - {self.aoi} [{self.status}]"
