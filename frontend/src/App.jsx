import React, { useState } from 'react';
import { useAnalysis } from './hooks/useAnalysis';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StatsOverview from './components/StatsOverview';
import MapView from './map/MapView';
import ReportModal from './components/ReportModal';
import EmailModal from './components/EmailModal';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

export default function App() {
  const {
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
  } = useAnalysis();

  const [isDrawingAoi, setIsDrawingAoi] = useState(false);
  const [emailIncidentTarget, setEmailIncidentTarget] = useState(null);

  const handleOpenEmailModal = (incident) => {
    setEmailIncidentTarget(incident);
    setIsEmailModalOpen(true);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-bnb-canvas-dark font-sans antialiased text-bnb-body">
      {/* 1. Apple-styled Dual Header (Global Black Nav + Frosted Sub-Nav) */}
      <Header
        aoiName={aoiName}
        incidentCount={incidents?.length}
        isAnalyzing={isAnalyzing}
        onRunAnalysis={runAnalysis}
        aoiAreaSqkm={aoiAreaSqkm}
        isCachedResult={isCachedResult}
      />

      {/* 2. Analytical Summary Metrics Bar (if analysis has run) */}
      {summary && (
        <StatsOverview summary={summary} aoiAreaSqkm={aoiAreaSqkm} />
      )}

      {/* 3. Main Workspace Layout (Sidebar + Full Leaflet Map) */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          selectedPreset={selectedPreset}
          aoi={aoi}
          onSelectPreset={handleSelectPreset}
          historicalStart={historicalStart}
          setHistoricalStart={setHistoricalStart}
          historicalEnd={historicalEnd}
          setHistoricalEnd={setHistoricalEnd}
          currentStart={currentStart}
          setCurrentStart={setCurrentStart}
          currentEnd={currentEnd}
          setCurrentEnd={setCurrentEnd}
          threshold={threshold}
          setThreshold={setThreshold}
          minAreaHa={minAreaHa}
          setMinAreaHa={setMinAreaHa}
          aoiAreaSqkm={aoiAreaSqkm}
          incidents={incidents}
          selectedIncident={selectedIncident}
          onSelectIncident={selectIncident}
          onGenerateReport={generateReport}
          onOpenEmailModal={handleOpenEmailModal}
          isAnalyzing={isAnalyzing}
          onRunAnalysis={runAnalysis}
          isDrawingAoi={isDrawingAoi}
          setIsDrawingAoi={setIsDrawingAoi}
        />

        {/* Leaflet WebGIS Map Container */}
        <main className="flex-1 h-full relative">
          <MapView
            aoi={aoi}
            aoiName={aoiName}
            selectedPreset={selectedPreset}
            tileUrlTemplate={tileUrlTemplate}
            incidents={incidents}
            selectedIncident={selectedIncident}
            selectedIncidentGeoJSON={selectedIncidentGeoJSON}
            threshold={threshold}
            onSelectIncident={selectIncident}
            onGenerateReport={generateReport}
            onOpenEmailModal={handleOpenEmailModal}
            onCustomAoiCreated={handleCustomAOI}
            isGeneratingReport={isGeneratingReport}
            isDrawingAoi={isDrawingAoi}
            setIsDrawingAoi={setIsDrawingAoi}
          />
        </main>
      </div>

      {/* 4. Officer Advisory Gemini Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={activeReport}
        incident={selectedIncident}
        onOpenEmailModal={handleOpenEmailModal}
      />

      {/* 5. Email Notification Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        incident={emailIncidentTarget || selectedIncident}
        onSendEmail={sendAlertEmail}
        isSendingEmail={isSendingEmail}
      />

      {/* 6. Loading Overlays */}
      {isAnalyzing && (
        <LoadingState message="Processing Sentinel-2 Harmonized median composites & NDVI differencing..." />
      )}

      {isLoadingGeoJSON && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-bnb-elevated border border-bnb-hairline-dark text-bnb-body px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.4)] animate-fade-in">
          <span className="w-3.5 h-3.5 border-2 border-bnb-primary border-t-transparent rounded-full animate-spin"></span>
          Streaming incident vector polygon...
        </div>
      )}

      {/* 7. Error Banner */}
      <ErrorState
        error={error}
        onDismiss={() => setError(null)}
        onRetry={runAnalysis}
      />

      {/* 8. Apple Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-bnb-elevated border border-bnb-hairline-dark text-bnb-body px-5 py-2.5 rounded-lg text-xs font-medium shadow-[0_8px_24px_rgba(0,0,0,0.4)] animate-fade-in">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-bnb-primary mr-2"></span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
