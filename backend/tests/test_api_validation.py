from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

class APIValidationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.valid_aoi = {
            "type": "Polygon",
            "coordinates": [[
                [88.80, 21.90],
                [88.95, 21.90],
                [88.95, 22.05],
                [88.80, 22.05],
                [88.80, 21.90]
            ]]
        }

    def test_health_check_endpoint(self):
        response = self.client.get(reverse('health-check'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')

    def test_oversized_aoi_rejected(self):
        # Extremely huge polygon covering large part of India (> 5000 km2)
        oversized_aoi = {
            "type": "Polygon",
            "coordinates": [[
                [80.0, 20.0],
                [85.0, 20.0],
                [85.0, 25.0],
                [80.0, 25.0],
                [80.0, 20.0]
            ]]
        }
        payload = {
            "aoi": oversized_aoi,
            "historical_start": "2023-01-01",
            "historical_end": "2023-03-31",
            "current_start": "2024-01-01",
            "current_end": "2024-03-31",
            "threshold": -0.3
        }
        response = self.client.post(reverse('analyze'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('aoi', response.data)

    def test_invalid_date_sequence_rejected(self):
        payload = {
            "aoi": self.valid_aoi,
            "historical_start": "2024-03-31",
            "historical_end": "2024-01-01", # End before start!
            "current_start": "2024-01-01",
            "current_end": "2024-03-31",
            "threshold": -0.3
        }
        response = self.client.post(reverse('analyze'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_threshold_bounds(self):
        payload = {
            "aoi": self.valid_aoi,
            "historical_start": "2023-01-01",
            "historical_end": "2023-03-31",
            "current_start": "2024-01-01",
            "current_end": "2024-03-31",
            "threshold": 0.5 # Positive threshold invalid for loss detection
        }
        response = self.client.post(reverse('analyze'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valid_analysis_and_caching(self):
        payload = {
            "aoi": self.valid_aoi,
            "aoi_name": "Sundarbans Test Reserve",
            "historical_start": "2023-01-01",
            "historical_end": "2023-03-31",
            "current_start": "2024-01-01",
            "current_end": "2024-03-31",
            "threshold": -0.3,
            "min_area_ha": 0.5
        }
        # First call: creates new job
        response1 = self.client.post(reverse('analyze'), payload, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertIn('incidents', response1.data)
        self.assertIn('tile_url_template', response1.data)
        self.assertFalse(response1.data['cached'])

        # Second call with identical params: returns cached job
        response2 = self.client.post(reverse('analyze'), payload, format='json')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertTrue(response2.data['cached'])
        self.assertEqual(response1.data['job_id'], response2.data['job_id'])
