import ee
from datetime import datetime, timedelta

def get_live_features(geometry_geojson, reference_date=None):
    """
    Extract live features for the given geometry to feed into the ML model.
    Returns:
        dict with:
          'ndvi_sequence': list of 36 floats
          'static_features': list of 3 floats [slope, dist_clear, dist_settle]
    """
    if not isinstance(geometry_geojson, dict):
        raise ValueError("geometry_geojson must be a dict")
    
    geom = ee.Geometry(geometry_geojson)
    centroid = geom.centroid()

    if reference_date is None:
        reference_date = datetime.now()

    # 1. NDVI Sequence (36 months prior to reference_date)
    SEQUENCE_MONTHS = 36
    CLOUDY_PIXEL_THRESHOLD = 20
    
    s2 = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", CLOUDY_PIXEL_THRESHOLD))
    )
    def add_ndvi(img):
        ndvi = img.normalizedDifference(["B8", "B4"]).rename("NDVI")
        return img.addBands(ndvi)
    ndvi_col = s2.map(add_ndvi).select("NDVI")

    ndvi_sequence = []
    for i in range(SEQUENCE_MONTHS, 0, -1):
        window_end = reference_date - timedelta(days=30 * (i - 1))
        window_start = window_end - timedelta(days=30)
        monthly_img = ndvi_col.filterDate(
            window_start.strftime("%Y-%m-%d"), window_end.strftime("%Y-%m-%d")
        ).mean()
        val = monthly_img.reduceRegion(
            reducer=ee.Reducer.mean(), geometry=centroid, scale=30, maxPixels=1e9
        ).get("NDVI")
        ndvi_sequence.append(val)
        
    # 2. Static features
    hansen = ee.Image("UMD/hansen/global_forest_change_2025_v1_13")
    loss = hansen.select("loss")
    
    SLOPE_IMG = ee.Terrain.slope(ee.Image("USGS/SRTMGL1_003"))
    DIST_PRIOR_CLEARING_IMG = (
        loss.selfMask().fastDistanceTransform(256).sqrt().multiply(ee.Image.pixelArea().sqrt())
    )
    SETTLEMENT_IMG = ee.Image("JRC/GHSL/P2023A/GHS_BUILT_S/GHS_BUILT_S_E2020_GLOBE_R2023A")
    DIST_SETTLEMENT_IMG = (
        SETTLEMENT_IMG.gt(0)
        .selfMask()
        .fastDistanceTransform(256)
        .sqrt()
        .multiply(ee.Image.pixelArea().sqrt())
    )
    
    slope_val = SLOPE_IMG.reduceRegion(
        ee.Reducer.mean(), centroid, 30, maxPixels=1e9
    ).get("slope")
    
    dist_clear_val = DIST_PRIOR_CLEARING_IMG.reduceRegion(
        ee.Reducer.mean(), centroid, 30, maxPixels=1e9
    ).get("distance")
    
    dist_settle_val = DIST_SETTLEMENT_IMG.reduceRegion(
        ee.Reducer.mean(), centroid, 30, maxPixels=1e9
    ).get("distance")
    
    # Bundle everything into a single EE Dictionary for a single fast getInfo() roundtrip
    feature_dict = ee.Dictionary({
        'ndvi_sequence': ee.List(ndvi_sequence),
        'slope': slope_val,
        'dist_to_prior_clearing': dist_clear_val,
        'dist_to_settlement': dist_settle_val
    })
    
    result = feature_dict.getInfo()
    
    # Clean output (impute nulls)
    seq = result.get('ndvi_sequence', [])
    clean_seq = []
    last_val = 0.5  # reasonable fallback for forest
    for val in seq:
        if val is None:
            clean_seq.append(last_val)
        else:
            clean_seq.append(val)
            last_val = val
            
    slope = result.get('slope') or 0.0
    dist_clear = result.get('dist_to_prior_clearing') or 0.0
    dist_settle = result.get('dist_to_settlement') or 0.0
    
    return {
        'ndvi_sequence': clean_seq,
        'static_features': [slope, dist_clear, dist_settle]
    }
