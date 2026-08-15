from typing import Any

def compute_ndvi(image: Any) -> Any:
    """
    Computes Normalized Difference Vegetation Index (NDVI) on a Sentinel-2 image.
    Uses normalizedDifference on NIR (B8) and RED (B4) bands.
    NDVI = (B8 - B4) / (B8 + B4)
    """
    return image.normalizedDifference(['B8', 'B4']).rename('ndvi')

def compute_delta_ndvi(historical_composite: Any, current_composite: Any) -> tuple[Any, Any, Any]:
    """
    Computes baseline NDVI, current NDVI, and delta NDVI (current - historical).
    Negative delta NDVI indicates vegetation loss.
    """
    ndvi_hist = compute_ndvi(historical_composite).rename('ndvi_historical')
    ndvi_curr = compute_ndvi(current_composite).rename('ndvi_current')
    ndvi_delta = ndvi_curr.subtract(ndvi_hist).rename('ndvi_delta')
    return ndvi_hist, ndvi_curr, ndvi_delta
