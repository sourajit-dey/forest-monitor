from django.test import TestCase
from gee.change_detection import run_gee_change_detection
from caching.cache_keys import compute_aoi_hash, build_analysis_cache_key

class GEEPipelineTests(TestCase):
    def setUp(self):
        self.sample_aoi = {
            "type": "Polygon",
            "coordinates": [[
                [88.85, 21.92],
                [88.92, 21.92],
                [88.92, 22.02],
                [88.85, 22.02],
                [88.85, 21.92]
            ]]
        }

    def test_cache_key_generation(self):
        key1 = build_analysis_cache_key(
            aoi_geojson=self.sample_aoi,
            historical_start="2023-01-01",
            historical_end="2023-03-31",
            current_start="2024-01-01",
            current_end="2024-03-31",
            threshold=-0.3
        )
        key2 = build_analysis_cache_key(
            aoi_geojson=self.sample_aoi,
            historical_start="2023-01-01",
            historical_end="2023-03-31",
            current_start="2024-01-01",
            current_end="2024-03-31",
            threshold=-0.3
        )
        self.assertEqual(key1, key2)
        self.assertIn("v1.0-ndvi-delta", key1)

    def test_pipeline_output_structure(self):
        tile_url, incidents = run_gee_change_detection(
            aoi_geojson=self.sample_aoi,
            historical_start="2023-01-01",
            historical_end="2023-03-31",
            current_start="2024-01-01",
            current_end="2024-03-31",
            threshold=-0.3,
            min_area_ha=0.5
        )
        self.assertIsInstance(tile_url, str)
        self.assertIsInstance(incidents, list)
        self.assertGreater(len(incidents), 0)

        first_inc = incidents[0]
        self.assertIn('area_hectares', first_inc)
        self.assertIn('ndvi_before', first_inc)
        self.assertIn('ndvi_after', first_inc)
        self.assertIn('ndvi_change', first_inc)
        self.assertIn('centroid_lat', first_inc)
        self.assertIn('centroid_lng', first_inc)
        self.assertIn('geometry', first_inc)
        self.assertLessEqual(first_inc['ndvi_change'], -0.3)
        self.assertGreaterEqual(first_inc['area_hectares'], 0.5)
