import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { PRESET_AOIS } from '../data/presets';

export function useAnalysis() {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_AOIS[0]);
  const [aoi, setAoi] = useState(PRESET_AOIS[0].geometry);
  const [aoiName, setAoiName] = useState(PRESET_AOIS[0].name);
  
  const [historicalStart, setHistoricalStart] = useState(PRESET_AOIS[0].defaultDates.historicalStart);
  const [historicalEnd, setHistoricalEnd] = useState(PRESET_AOIS[0].defaultDates.historicalEnd);
  const [currentStart, setCurrentStart] = useState(PRESET_AOIS[0].defaultDates.currentStart);
  const [currentEnd, setCurrentEnd] = useState(PRESET_AOIS[0].defaultDates.currentEnd);

  const [threshold, setThreshold] = useState(-0.30);
  const [minAreaHa, setMinAreaHa] = useState(0.5);

  const [jobId, setJobId] = useState(null);
  const [tileUrlTemplate, setTileUrlTemplate] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [aoiAreaSqkm, setAoiAreaSqkm] = useState(null);
  const [isCachedResult, setIsCachedResult] = useState(false);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedIncidentGeoJSON, setSelectedIncidentGeoJSON] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingGeoJSON, setIsLoadingGeoJSON] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, duration = 4000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  };

  const handleSelectPreset = useCallback((preset) => {
    setSelectedPreset(preset);
    setAoi(preset.geometry);
    setAoiName(preset.name);
    setHistoricalStart(preset.defaultDates.historicalStart);
    setHistoricalEnd(preset.defaultDates.historicalEnd);
    setCurrentStart(preset.defaultDates.currentStart);
    setCurrentEnd(preset.defaultDates.currentEnd);
    setSelectedIncident(null);
    setSelectedIncidentGeoJSON(null);
    setTileUrlTemplate(null);
    setIncidents([]);
    setSummary(null);
    setAoiAreaSqkm(null);
    setIsCachedResult(false);
  }, []);

  const handleCustomAOI = useCallback((customGeoJSON, customName = "Custom User AOI") => {
    setSelectedPreset(null);
    setAoi(customGeoJSON);
    setAoiName(customName);
    setSelectedIncident(null);
    setSelectedIncidentGeoJSON(null);
    setTileUrlTemplate(null);
    setIncidents([]);
    setSummary(null);
    setAoiAreaSqkm(null);
    setIsCachedResult(false);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!aoi) {
      setError("Please select or draw an Area of Interest (AOI).");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSelectedIncident(null);
    setSelectedIncidentGeoJSON(null);

    try {
      const result = await api.analyzeAOI({
        aoi,
        aoi_name: aoiName,
        historical_start: historicalStart,
        historical_end: historicalEnd,
        current_start: currentStart,
        current_end: currentEnd,
        threshold: parseFloat(threshold),
        min_area_ha: parseFloat(minAreaHa),
      });

      setJobId(result.job_id);
      setTileUrlTemplate(result.tile_url_template);
      setIncidents(result.incidents || []);
      setSummary(result.summary || null);
      setAoiAreaSqkm(result.aoi?.area_sqkm || null);
      setIsCachedResult(Boolean(result.cached));

      if (result.cached) {
        showToast("Loaded analysis from instant database cache.");
      } else {
        showToast(`Analysis complete: Flagged ${result.incidents?.length || 0} potential vegetation loss zones.`);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message || "Change detection pipeline execution failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [aoi, aoiName, historicalStart, historicalEnd, currentStart, currentEnd, threshold, minAreaHa]);

  // On-demand fetch of a single incident's polygon geometry (per AGENT.md §2 & §9)
  const selectIncident = useCallback(async (incident) => {
    setSelectedIncident(incident);
    setActiveReport(null);
    setIsLoadingGeoJSON(true);

    try {
      const geojsonData = await api.getIncidentGeoJSON(incident.id);
      setSelectedIncidentGeoJSON(geojsonData);
    } catch (err) {
      console.error("Failed to load incident GeoJSON:", err);
      showToast("Unable to load high-res incident vector geometry.");
    } finally {
      setIsLoadingGeoJSON(false);
    }
  }, []);

  const generateReport = useCallback(async (incidentId, forceRegenerate = false) => {
    setIsGeneratingReport(true);
    setError(null);

    try {
      const reportData = await api.generateOfficerReport(incidentId, forceRegenerate);
      setActiveReport(reportData);
      setIsReportModalOpen(true);
      showToast("Officer Verification Advisory generated.");
    } catch (err) {
      console.error("Failed to generate report:", err);
      setError("Failed to generate report advisory: " + err.message);
    } finally {
      setIsGeneratingReport(false);
    }
  }, []);

  const sendAlertEmail = useCallback(async ({ incidentId, email, notes }) => {
    setIsSendingEmail(true);
    try {
      await api.sendNotification({
        incident_id: incidentId,
        recipient_email: email,
        custom_notes: notes,
      });
      showToast(`Verification advisory dispatched to ${email}`);
      setIsEmailModalOpen(false);
    } catch (err) {
      console.error("Failed to dispatch email:", err);
      showToast(`Email delivery failed: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  }, []);

  return {
    selectedPreset,
    aoi,
    aoiName,
    historicalStart,
    setHistoricalStart,
    historicalEnd,
    setHistoricalEnd,
    currentStart,
    setCurrentStart,
    currentEnd,
    setCurrentEnd,
    threshold,
    setThreshold,
    minAreaHa,
    setMinAreaHa,
    jobId,
    tileUrlTemplate,
    incidents,
    summary,
    aoiAreaSqkm,
    isCachedResult,
    selectedIncident,
    selectedIncidentGeoJSON,
    activeReport,
    isAnalyzing,
    isLoadingGeoJSON,
    isGeneratingReport,
    isSendingEmail,
    isReportModalOpen,
    setIsReportModalOpen,
    isEmailModalOpen,
    setIsEmailModalOpen,
    error,
    setError,
    toastMessage,
    handleSelectPreset,
    handleCustomAOI,
    runAnalysis,
    selectIncident,
    generateReport,
    sendAlertEmail,
  };
}
