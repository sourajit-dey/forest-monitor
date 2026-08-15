import math
import os
from datetime import datetime
from typing import Any, Dict, Tuple
from shapely.geometry import shape
from rest_framework.exceptions import ValidationError

# 900 km² default so all 5 curated preset AOIs pass validation (Sundarbans ~687,
# Similipal ~826, Kaziranga ~601, Satpura ~822 km²). Overridable via MAX_AOI_SQKM.
DEFAULT_MAX_AOI_SQKM = float(os.environ.get("MAX_AOI_SQKM", 900.0))

def estimate_polygon_sqkm(geojson_geom: Dict[str, Any]) -> float:
    """
    Computes approximate geodesic surface area in square kilometers for GeoJSON geometry.
    Uses latitude-adjusted spherical projection approximation.
    """
    poly = shape(geojson_geom)
    minx, miny, maxx, maxy = poly.bounds
    centroid_lat = (miny + maxy) / 2.0

    # 1 deg lat ~ 111.139 km, 1 deg lng ~ 111.139 * cos(lat) km
    lat_km = 111.139
    lng_km = 111.139 * math.cos(math.radians(centroid_lat))

    # Area in degree space * scale factor
    area_sqkm = poly.area * lat_km * lng_km
    return max(0.01, round(area_sqkm, 2))

def validate_aoi_geojson(aoi_data: Any) -> Tuple[Dict[str, Any], float]:
    """
    Validates AOI geometry:
    - Must be a valid GeoJSON object with Polygon or MultiPolygon type
    - Must not exceed maximum allowed area (safety cap)
    """
    if not isinstance(aoi_data, dict):
        raise ValidationError({"aoi": "AOI must be a valid GeoJSON object."})

    # If FeatureCollection or Feature is passed, extract geometry
    if aoi_data.get("type") == "Feature":
        aoi_geom = aoi_data.get("geometry", {})
    elif aoi_data.get("type") == "FeatureCollection":
        features = aoi_data.get("features", [])
        if not features:
            raise ValidationError({"aoi": "FeatureCollection contains no features."})
        aoi_geom = features[0].get("geometry", {})
    else:
        aoi_geom = aoi_data

    geom_type = aoi_geom.get("type")
    if geom_type not in ["Polygon", "MultiPolygon"]:
        raise ValidationError({"aoi": f"Invalid geometry type '{geom_type}'. Must be Polygon or MultiPolygon."})

    coordinates = aoi_geom.get("coordinates")
    if not coordinates or not isinstance(coordinates, list):
        raise ValidationError({"aoi": "Geometry must contain coordinates array."})

    try:
        area_sqkm = estimate_polygon_sqkm(aoi_geom)
    except Exception as e:
        raise ValidationError({"aoi": f"Unable to parse polygon coordinates: {e}"})

    if area_sqkm > DEFAULT_MAX_AOI_SQKM:
        raise ValidationError({
            "aoi": f"Selected AOI area ({area_sqkm:.1f} km²) exceeds the maximum quota limit of {DEFAULT_MAX_AOI_SQKM:.1f} km²."
        })

    return aoi_geom, area_sqkm

def validate_date_ranges(hist_start: str, hist_end: str, curr_start: str, curr_end: str) -> None:
    """Validates date format (YYYY-MM-DD) and logical sequence."""
    fmt = "%Y-%m-%d"
    try:
        d_hs = datetime.strptime(hist_start, fmt)
        d_he = datetime.strptime(hist_end, fmt)
        d_cs = datetime.strptime(curr_start, fmt)
        d_ce = datetime.strptime(curr_end, fmt)
    except ValueError:
        raise ValidationError({"dates": "Dates must be in valid YYYY-MM-DD format."})

    if d_hs >= d_he:
        raise ValidationError({"historical_dates": "Historical start date must be before historical end date."})
    if d_cs >= d_ce:
        raise ValidationError({"current_dates": "Monitoring start date must be before monitoring end date."})
    if d_hs >= d_ce:
        raise ValidationError({"date_sequence": "Historical window must precede monitoring window."})

def validate_threshold(threshold: float) -> float:
    """Threshold must be within valid numeric range (-1.0 to 0.0)."""
    try:
        t = float(threshold)
    except (ValueError, TypeError):
        raise ValidationError({"threshold": "Threshold must be a float."})

    if not (-1.0 <= t <= 0.0):
        raise ValidationError({"threshold": "NDVI delta threshold must be between -1.0 and 0.0."})
    return t
