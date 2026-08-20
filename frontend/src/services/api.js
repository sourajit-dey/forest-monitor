const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || errorData.details || JSON.stringify(errorData));
      }
      return await response.json();
    } catch (error) {
      console.error(`API request error on ${endpoint}:`, error);
      throw error;
    }
  }

  async checkHealth() {
    return this.request('/api/health/');
  }

  async analyzeAOI({
    aoi,
    aoi_name,
    historical_start,
    historical_end,
    current_start,
    current_end,
    threshold = -0.3,
    min_area_ha = 0.5,
  }) {
    return this.request('/api/risk-map/', {
      method: 'POST',
      body: JSON.stringify({
        aoi,
        aoi_name,
        historical_start,
        historical_end,
        current_start,
        current_end,
        threshold,
        min_area_ha,
      }),
    });
  }

  async getIncidentGeoJSON(incidentId) {
    return this.request(`/api/incidents/${incidentId}/geojson/`);
  }

  async generateOfficerReport(incidentId, forceRegenerate = false) {
    return this.request(`/api/incidents/${incidentId}/generate-report/`, {
      method: 'POST',
      body: JSON.stringify({ force_regenerate: forceRegenerate }),
    });
  }

  async sendNotification({ incident_id, recipient_email, custom_notes = '' }) {
    return this.request('/api/notifications/', {
      method: 'POST',
      body: JSON.stringify({
        incident_id,
        recipient_email,
        custom_notes,
      }),
    });
  }
}

export const api = new ApiService();
