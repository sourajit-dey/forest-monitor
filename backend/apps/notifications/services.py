import logging
from django.core.mail import send_mail
from django.conf import settings
from .models import NotificationLog
from apps.incidents.models import Incident

logger = logging.getLogger(__name__)

def dispatch_incident_email(
    incident: Incident,
    recipient_email: str,
    custom_notes: str = ""
) -> NotificationLog:
    """
    Dispatches an email alert regarding an area of potential vegetation loss.
    In development/demo mode, logs to console without incurring any third-party fees.
    """
    subject = f"[FOREST MONITOR ALERT] Potential Vegetation Loss Detected - Incident #{incident.id}"
    body = (
        f"FOREST MONITORING & VERIFICATION ALERT\n\n"
        f"Incident ID: #{incident.id}\n"
        f"Target Area: {incident.analysis_job.aoi.name if incident.analysis_job.aoi else 'Forest Reserve'}\n"
        f"Centroid Coordinates: {incident.centroid_lat:.6f}° N, {incident.centroid_lng:.6f}° E\n"
        f"Estimated Affected Area: {incident.area_hectares} hectares\n"
        f"Baseline NDVI: {incident.ndvi_before:.3f}\n"
        f"Current NDVI: {incident.ndvi_after:.3f}\n"
        f"Delta NDVI: {incident.ndvi_change:.3f}\n"
        f"Current Status: {incident.get_status_display()}\n\n"
        f"Officer Field Notes:\n{custom_notes or 'Please schedule on-ground field inspection to verify canopy status.'}\n\n"
        f"Notice: This is an automated advisory based on Sentinel-2 satellite change detection."
    )

    try:
        if getattr(settings, 'EMAIL_HOST_USER', None):
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False
            )
        else:
            logger.info(f"[SIMULATED EMAIL DISPATCH] To: {recipient_email}\nSubject: {subject}\nBody:\n{body}")

        log = NotificationLog.objects.create(
            incident=incident,
            recipient_email=recipient_email,
            subject=subject,
            body_text=body,
            status='sent'
        )
        return log
    except Exception as e:
        logger.error(f"Failed to dispatch email: {e}")
        log = NotificationLog.objects.create(
            incident=incident,
            recipient_email=recipient_email,
            subject=subject,
            body_text=body,
            status=f'failed: {str(e)[:40]}'
        )
        return log
