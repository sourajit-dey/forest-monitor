from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint for checking service status and warming Render cold-starts.
    """
    return Response({
        'status': 'healthy',
        'service': 'forest-monitoring-webgis',
        'engine': 'Sentinel-2 Harmonized NDVI Delta',
        'version': '1.0.0'
    })

urlpatterns = [
    path('api/health/', health_check, name='health-check'),
    path('api/', include('apps.analysis.urls')),
    path('api/', include('apps.incidents.urls')),
    path('api/', include('apps.notifications.urls')),
]
