from rest_framework import serializers
from .models import NotificationLog

class NotificationRequestSerializer(serializers.Serializer):
    incident_id = serializers.IntegerField(required=True)
    recipient_email = serializers.EmailField(required=True)
    custom_notes = serializers.CharField(required=False, allow_blank=True, default="")

class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = ['id', 'incident_id', 'recipient_email', 'subject', 'status', 'sent_at']
