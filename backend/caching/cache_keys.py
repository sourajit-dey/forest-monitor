import hashlib
import json

ALGORITHM_VERSION = "v1.0-ndvi-delta"

def compute_aoi_hash(aoi_geojson: dict) -> str:
    """
    Compute a deterministic SHA-256 hash of the AOI GeoJSON geometry.
    Normalizes coordinates and keys to ensure consistent hash.
    """
    normalized_json = json.dumps(aoi_geojson, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(normalized_json.encode('utf-8')).hexdigest()[:16]

def build_analysis_cache_key(
    aoi_geojson: dict,
    historical_start: str,
    historical_end: str,
    current_start: str,
    current_end: str,
    threshold: float,
    algorithm_version: str = ALGORITHM_VERSION
) -> str:
    """
    Build the canonical cache key specified in AGENT.md section 8:
    f"{aoi_hash}:{historical_start}:{historical_end}:{current_start}:{current_end}:{threshold}:{algorithm_version}"
    """
    aoi_hash = compute_aoi_hash(aoi_geojson)
    formatted_threshold = f"{float(threshold):.3f}"
    return f"{aoi_hash}:{historical_start}:{historical_end}:{current_start}:{current_end}:{formatted_threshold}:{algorithm_version}"
