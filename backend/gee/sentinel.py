import logging
from typing import Any

logger = logging.getLogger(__name__)

def mask_s2_clouds(image: Any) -> Any:
    """
    Cloud masking for Sentinel-2 Surface Reflectance (S2_SR_HARMONIZED).
    Uses the SCL (Scene Classification Layer) band.
    Values to mask:
      3: Cloud shadows
      8: Cloud medium probability
      9: Cloud high probability
      10: Thin cirrus
      11: Snow/ice
    """
    import ee
    scl = image.select('SCL')
    # Valid non-cloud pixels
    mask = scl.neq(3).And(scl.neq(8)).And(scl.neq(9)).And(scl.neq(10)).And(scl.neq(11))
    return image.updateMask(mask).divide(10000)

def build_sentinel2_composite(aoi_geom: Any, start_date: str, end_date: str) -> Any:
    """
    Filters Sentinel-2 Surface Reflectance Harmonized collection over the AOI
    and date range, applies cloud masking, and computes a median composite image.
    This median composite reduces seasonal/atmospheric false positives.
    """
    import ee
    collection = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(aoi_geom)
        .filterDate(start_date, end_date)
        .map(mask_s2_clouds)
    )
    return collection.median()
