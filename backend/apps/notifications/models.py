from django.db import models
from apps.incidents.models import Incident

class NotificationLog(models.Model):
    """
    Log of email notifications dispatched for flagged incidents.
    """
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='notifications')
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=255)
    body_text = models.TextField()
    status = models.CharField(max_length=50, default='sent')
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification to {self.recipient_email} for Incident #{self.incident_id}"
