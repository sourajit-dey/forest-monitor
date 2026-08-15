import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)

def get_ndvi_delta_tile_url(ndvi_delta_image: Any, threshold: float = -0.3) -> Dict[str, Any]:
    """
    Generates a signed XYZ tile URL template from Earth Engine using ee.Image.getMapId().
    Visualizes vegetation loss in red/orange palette.
    The tile URL template is returned directly to the frontend Leaflet map.
    """
    try:
        # Mask non-loss pixels: only show pixels where delta <= threshold (negative loss)
        loss_mask = ndvi_delta_image.lte(threshold)
        masked_delta = ndvi_delta_image.updateMask(loss_mask)

        # Visualization styling: Red to Orange to Yellow
        viz_params = {
            'min': -0.8,
            'max': threshold,
            'palette': ['#b30000', '#e34a33', '#fc8d59', '#fdcc8a']
        }

        map_id_dict = masked_delta.getMapId(viz_params)
        tile_fetcher = map_id_dict.get('tile_fetcher', {})
        url_format = tile_fetcher.url_format if hasattr(tile_fetcher, 'url_format') else map_id_dict.get('tile_url')

        return {
            'tile_url_template': url_format,
            'mapid': map_id_dict.get('mapid'),
            'token': map_id_dict.get('token')
        }
    except Exception as e:
        logger.error(f"Error generating GEE tile URL: {e}")
        return {
            'tile_url_template': None,
            'error': str(e)
        }
