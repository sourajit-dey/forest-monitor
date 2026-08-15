import logging
from typing import Any, Dict
from .client import get_gemini_model

logger = logging.getLogger(__name__)

def generate_incident_report(
    incident_data: Dict[str, Any],
    aoi_name: str = "Specified Forest AOI"
) -> str:
    """
    Generates an explainable Forest Officer Verification Report grounded strictly
    on deterministic Sentinel-2 NDVI metrics.
    Enforces AGENT.md section 10 guardrails:
    - Never say 'illegal deforestation' or 'confirmed'
    - Always say 'potential vegetation loss', 'detected vegetation-loss area', or 'requires field verification'
    - Never invent coordinates or numbers
    - Provide 2-3 concrete field verification recommendations
    """
    area_ha = incident_data.get("area_hectares", 0.0)
    ndvi_before = incident_data.get("ndvi_before", 0.0)
    ndvi_after = incident_data.get("ndvi_after", 0.0)
    ndvi_change = incident_data.get("ndvi_change", 0.0)
    lat = incident_data.get("centroid_lat", 0.0)
    lng = incident_data.get("centroid_lng", 0.0)
    date = incident_data.get("detected_date", "Recent Sentinel-2 composite")
    status = incident_data.get("status", "requires_verification")
    incident_id = incident_data.get("id", "N/A")

    system_instruction = (
        "You are an AI assistant for State Forest Department Officers and Environmental Stakeholders.\n"
        "Generate a structured, professional Forest Verification Report based ONLY on the provided deterministic telemetry.\n\n"
        "STRICT MANDATORY RULES:\n"
        "1. Never use the terms 'illegal deforestation', 'illegal encroachment', or 'confirmed deforestation'.\n"
        "2. ALWAYS use 'potential vegetation loss', 'detected canopy reduction', or 'area requiring field verification'.\n"
        "3. NEVER invent or extrapolate any coordinates, dates, or NDVI figures beyond the exact numbers supplied.\n"
        "4. Explicitly state that remote sensing flags are preliminary indicators and require on-ground field inspection.\n"
        "5. Include 2 to 3 concrete, actionable verification steps for range officers (e.g. cadastral cross-check with Forest Rights Act records, drone reconnaissance, beat guard ground patrol).\n"
        "6. Format with clear Markdown headings, a telemetry summary table, risk assessment note, and recommended action checklist."
    )

    prompt = (
        f"{system_instruction}\n\n"
        f"INCIDENT TELEMETRY DATA:\n"
        f"- Incident ID: #{incident_id}\n"
        f"- Target AOI: {aoi_name}\n"
        f"- Centroid Coordinates: {lat:.6f}° N, {lng:.6f}° E\n"
        f"- Detected Date Window: {date}\n"
        f"- Estimated Canopy Loss Area: {area_ha} hectares\n"
        f"- Baseline NDVI (Historical Composite): {ndvi_before:.3f}\n"
        f"- Monitoring NDVI (Current Composite): {ndvi_after:.3f}\n"
        f"- Delta NDVI (Net Change): {ndvi_change:.3f}\n"
        f"- Current Verification Status: {status}\n\n"
        f"Generate the official Verification Advisory Report."
    )

    model = get_gemini_model()
    if model:
        try:
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API request failed: {e}. Utilizing deterministic template fallback.")

    # High quality deterministic fallback matching the same structure
    return _build_fallback_report(incident_data, aoi_name)


def _build_fallback_report(incident_data: Dict[str, Any], aoi_name: str) -> str:
    """Deterministic fallback report when Gemini API key is not present or offline."""
    area_ha = incident_data.get("area_hectares", 0.0)
    ndvi_before = incident_data.get("ndvi_before", 0.0)
    ndvi_after = incident_data.get("ndvi_after", 0.0)
    ndvi_change = incident_data.get("ndvi_change", 0.0)
    lat = incident_data.get("centroid_lat", 0.0)
    lng = incident_data.get("centroid_lng", 0.0)
    date = incident_data.get("detected_date", "Recent Observation")
    incident_id = incident_data.get("id", "N/A")

    severity = "High Canopy Depletion" if abs(ndvi_change) >= 0.4 else "Moderate Canopy Depletion"

    return rf"""# Forest Officer Verification Advisory Report
**Incident Reference:** #{incident_id} | **Target Area:** {aoi_name}  
**Classification:** Potential Vegetation Loss — Requires Field Verification

---

## 1. Remote Sensing Telemetry Summary
| Parameter | Value | Reference Standard |
| :--- | :--- | :--- |
| **Centroid Coordinates** | `{lat:.6f}° N, {lng:.6f}° E` | WGS84 Geodetic Datum |
| **Affected Surface Area** | **{area_ha} hectares** | Sentinel-2 10m Ground Resolution |
| **Baseline NDVI (Pre-event)** | `{ndvi_before:.3f}` | Healthy Dense Canopy Threshold (> 0.60) |
| **Current NDVI (Post-event)** | `{ndvi_after:.3f}` | Exposed Ground / Degraded Canopy |
| **Delta NDVI ($\Delta$)** | **`{ndvi_change:.3f}`** | Deterministic Negative Shift ({severity}) |
| **Detection Timestamp** | `{date}` | Harmonized S2 Surface Reflectance |

---

## 2. Technical Interpretation
Sentinel-2 dual-window median composite analysis indicates a statistically significant drop of **{abs(ndvi_change):.3f} NDVI units** across **{area_ha} hectares**. This spectral signature corresponds to acute green-canopy reflectance decline, characteristic of potential timber felling, agricultural clearing, or seasonal biomass reduction.

> **Notice:** This automated finding constitutes a preliminary alert and does not represent a confirmed or legal determination of unauthorized activity. On-ground verification by local forest staff is required.

---

## 3. Recommended Field Verification Protocol
1. **Cadastral & FRA Cross-Verification:** Cross-reference coordinate pair `({lat:.6f}, {lng:.6f})` with state cadastre and Forest Rights Act (FRA) community concession maps to confirm boundary designations.
2. **Beat Guard Inspection:** Dispatch beat guards to conduct geo-tagged photographic inspection of the flagged {area_ha} hectare perimeter.
3. **Drone Reconnaissance:** If terrain accessibility is constrained, deploy UAV/drone survey to document tree felling count and machinery presence.
"""
