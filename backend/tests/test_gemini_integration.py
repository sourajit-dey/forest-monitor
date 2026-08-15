from django.test import TestCase
from gemini.report_prompt import generate_incident_report

class GeminiIntegrationTests(TestCase):
    def test_guardrails_enforced_in_report(self):
        incident_data = {
            "id": 42,
            "area_hectares": 3.85,
            "ndvi_before": 0.745,
            "ndvi_after": 0.312,
            "ndvi_change": -0.433,
            "centroid_lat": 21.948210,
            "centroid_lng": 88.882100,
            "detected_date": "2024-03-31",
            "status": "Requires Field Verification"
        }
        report = generate_incident_report(incident_data, aoi_name="Sundarbans Core Zone")

        # AGENT.md Guardrail checks:
        # Never say "illegal deforestation" or "confirmed deforestation"
        self.assertNotIn("illegal deforestation", report.lower())
        self.assertNotIn("confirmed deforestation", report.lower())

        # Must mention coordinates and deterministic figures
        self.assertIn("3.85", report)
        self.assertIn("-0.433", report)
        self.assertIn("21.948210", report)
        self.assertIn("88.882100", report)

        # Must mention verification required
        self.assertIn("verification", report.lower())
