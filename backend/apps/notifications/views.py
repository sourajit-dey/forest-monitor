from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.incidents.models import Incident
from .serializers import NotificationRequestSerializer, NotificationLogSerializer
from .services import dispatch_incident_email

class NotificationView(APIView):
    """
    POST /api/notifications/
    Dispatches email advisory for an identified vegetation loss incident.
    """
    def post(self, request):
        serializer = NotificationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            incident = Incident.objects.select_related('analysis_job', 'analysis_job__aoi').get(pk=data['incident_id'])
        except Incident.DoesNotExist:
            return Response({"error": "Incident not found."}, status=status.HTTP_404_NOT_FOUND)

        log = dispatch_incident_email(
            incident=incident,
            recipient_email=data['recipient_email'],
            custom_notes=data.get('custom_notes', '')
        )

        return Response(NotificationLogSerializer(log).data, status=status.HTTP_201_CREATED)
