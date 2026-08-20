import React, { useState } from 'react';
import {
  Sliders,
  ListFilter,
  Info,
  Calendar,
  Layers,
  FileText,
  Send,
  Zap,
  PenTool
} from 'lucide-react';
import { PRESET_AOIS } from '../data/presets';

export default function Sidebar({
  selectedPreset,
  onSelectPreset,
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
  incidents,
  selectedIncident,
  onSelectIncident,
  onGenerateReport,
  onOpenEmailModal,
  isAnalyzing,
  onRunAnalysis,
  isDrawingAoi,
  setIsDrawingAoi
}) {
  const [activeTab, setActiveTab] = useState('controls'); // 'controls' | 'incidents' | 'arch'
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { key: 'controls', label: 'Controls', icon: Sliders },
    { key: 'incidents', label: 'Incidents', icon: ListFilter },
    { key: 'arch', label: 'System', icon: Info },
  ];

  return (
    <aside className={`relative z-20 flex flex-col bg-bnb-card border-r border-bnb-hairline-dark transition-all duration-300 ${
      isCollapsed ? 'w-14' : 'w-80 md:w-96'
    }`}>
      {/* Sidebar Top Segmented Tab Control */}
      <div className="flex items-center gap-1 p-1.5 border-b border-bnb-hairline-dark bg-bnb-canvas-dark flex-shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key && !isCollapsed;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setIsCollapsed(false); }}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 relative ${
                isActive
                  ? 'bg-bnb-card text-bnb-on-dark font-semibold'
                  : 'text-bnb-muted hover:text-bnb-body'
              }`}
              title={tab.label}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-bnb-primary' : ''}`} />
              {!isCollapsed && <span>{tab.label}</span>}
              {tab.key === 'incidents' && incidents?.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-bnb-trading-down text-white text-[10px] flex items-center justify-center font-bold">
                  {incidents.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {!isCollapsed && activeTab === 'controls' && (
          <>
            {/* 1. Target Reserve / Preset Selection */}
            <div>
              <label className="block text-xs font-semibold text-bnb-body mb-2 flex items-center justify-between">
                <span>Target forest area</span>
                <span className="text-[11px] font-normal text-bnb-muted">5 curated</span>
              </label>
              <select
                value={selectedPreset?.id || ''}
                onChange={(e) => {
                  const found = PRESET_AOIS.find((p) => p.id === e.target.value);
                  if (found) onSelectPreset(found);
                }}
                className="w-full text-xs font-medium bg-bnb-elevated border border-bnb-hairline-dark rounded-lg px-3.5 py-2.5 text-bnb-body focus:outline-none focus:border-bnb-primary focus:ring-2 focus:ring-bnb-primary/20"
              >
                {PRESET_AOIS.map((preset) => (
                  <option key={preset.id} value={preset.id} className="bg-bnb-card">
                    {preset.name} ({preset.region})
                  </option>
                ))}
              </select>
              {selectedPreset && (
                <p className="mt-2 text-[11px] text-bnb-muted leading-relaxed">
                  {selectedPreset.description}
                </p>
              )}
            </div>

            {/* Custom Drawing Option */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-bnb-hairline-dark bg-bnb-elevated p-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-bnb-body">Custom AOI drawing</div>
                <div className="text-[11px] text-bnb-muted">Draw a bounding box on the map</div>
              </div>
              <button
                onClick={() => setIsDrawingAoi(!isDrawingAoi)}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1 flex-shrink-0 ${
                  isDrawingAoi
                    ? 'bg-bnb-primary text-bnb-ink'
                    : 'bg-bnb-card border border-bnb-hairline-dark text-bnb-body hover:bg-bnb-elevated'
                }`}
              >
                <PenTool className="w-3 h-3" />
                {isDrawingAoi ? 'Drawing active' : 'Draw'}
              </button>
            </div>

            {/* 2. Date Ranges (Historical vs Current) */}
            <div className="space-y-3 pt-2 border-t border-bnb-hairline-dark">
              <div className="text-xs font-semibold text-bnb-body flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-bnb-muted" />
                <span>Monitoring windows</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Baseline Period */}
                <div className="rounded-lg border border-bnb-hairline-dark bg-bnb-elevated p-3 space-y-2">
                  <div className="text-[11px] font-semibold text-bnb-muted-strong">1. Baseline</div>
                  <div>
                    <span className="text-[10px] text-bnb-muted">From</span>
                    <input
                      type="date"
                      value={historicalStart}
                      onChange={(e) => setHistoricalStart(e.target.value)}
                      className="w-full text-xs bg-bnb-card border border-bnb-hairline-dark rounded-md p-1.5 text-bnb-body focus:outline-none focus:border-bnb-primary"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-bnb-muted">To</span>
                    <input
                      type="date"
                      value={historicalEnd}
                      onChange={(e) => setHistoricalEnd(e.target.value)}
                      className="w-full text-xs bg-bnb-card border border-bnb-hairline-dark rounded-md p-1.5 text-bnb-body focus:outline-none focus:border-bnb-primary"
                    />
                  </div>
                </div>

                {/* Current Period */}
                <div className="rounded-lg border border-bnb-hairline-dark bg-bnb-elevated p-3 space-y-2">
                  <div className="text-[11px] font-semibold text-bnb-muted-strong">2. Current</div>
                  <div>
                    <span className="text-[10px] text-bnb-muted">From</span>
                    <input
                      type="date"
                      value={currentStart}
                      onChange={(e) => setCurrentStart(e.target.value)}
                      className="w-full text-xs bg-bnb-card border border-bnb-hairline-dark rounded-md p-1.5 text-bnb-body focus:outline-none focus:border-bnb-primary"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-bnb-muted">To</span>
                    <input
                      type="date"
                      value={currentEnd}
                      onChange={(e) => setCurrentEnd(e.target.value)}
                      className="w-full text-xs bg-bnb-card border border-bnb-hairline-dark rounded-md p-1.5 text-bnb-body focus:outline-none focus:border-bnb-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Sensitivity Controls */}
            <div className="space-y-4 pt-2 border-t border-bnb-hairline-dark">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-bnb-body mb-1.5">
                  <span>NDVI loss threshold (Δ)</span>
                  <span className="font-mono text-bnb-primary font-bold">{parseFloat(threshold).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-0.60"
                  max="-0.10"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-bnb-muted mt-1">
                  <span>-0.60 · severe only</span>
                  <span>-0.10 · sensitive</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-bnb-body mb-1.5">
                  <span>Minimum area filter</span>
                  <span className="font-mono text-bnb-primary font-bold">{parseFloat(minAreaHa).toFixed(1)} ha</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={minAreaHa}
                  onChange={(e) => setMinAreaHa(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-bnb-muted mt-1">
                  <span>0.2 ha · specks</span>
                  <span>3.0 ha · clusters</span>
                </div>
              </div>

              {/* Run button inside controls for convenience */}
              <button
                onClick={onRunAnalysis}
                disabled={isAnalyzing}
                className="btn-primary w-full py-3 text-[13px]"
              >
                <Zap className="w-3.5 h-3.5" />
                {isAnalyzing ? 'Processing analysis…' : 'Run Change Detection'}
              </button>
            </div>
          </>
        )}

        {/* Tab 2: Flagged Incidents List */}
        {!isCollapsed && activeTab === 'incidents' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-bnb-hairline-dark">
              <span className="text-xs font-semibold text-bnb-body">
                Detected vegetation-loss zones
              </span>
              <span className="text-[11px] text-bnb-muted">
                {incidents?.length || 0} · sorted by area
              </span>
            </div>

            {(!incidents || incidents.length === 0) ? (
              <div className="text-center py-12 text-xs text-bnb-muted">
                <Layers className="w-8 h-8 text-bnb-muted mx-auto mb-2" />
                No zones detected yet. Run change detection on the target area.
              </div>
            ) : (
              <div className="space-y-2.5">
                {incidents.map((incident) => {
                  const isSelected = selectedIncident?.id === incident.id;
                  return (
                    <div
                      key={incident.id}
                      onClick={() => onSelectIncident(incident)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-bnb-elevated border-bnb-primary ring-1 ring-bnb-primary'
                          : 'bg-bnb-elevated border-bnb-hairline-dark hover:border-bnb-muted-strong'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-bnb-trading-down"></span>
                          <span className="text-xs font-semibold text-bnb-body">
                            Incident #{incident.id}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-bnb-trading-down">
                          Δ {incident.ndvi_change.toFixed(3)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] text-bnb-muted mb-2">
                        <div>Area: <strong className="text-bnb-body font-mono">{incident.area_hectares} ha</strong></div>
                        <div>Status: <span className="text-bnb-trading-down font-medium">Verify</span></div>
                      </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-bnb-hairline-dark text-[11px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateReport(incident.id);
                          }}
                          className="text-bnb-primary font-semibold flex items-center gap-1 hover:opacity-80"
                        >
                          <FileText className="w-3 h-3" /> Report
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEmailModal(incident);
                          }}
                          className="text-bnb-muted hover:text-bnb-body flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Email alert
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Tile-Bypass System Architecture */}
        {!isCollapsed && activeTab === 'arch' && (
          <div className="space-y-4 text-xs text-bnb-muted leading-relaxed">
            <div className="bg-bnb-elevated p-3.5 rounded-lg border border-bnb-hairline-dark">
              <div className="font-semibold text-xs text-bnb-body mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-bnb-primary" />
                Tile-Bypass Architecture
              </div>
              <p className="text-[11px] text-bnb-muted">
                Raw satellite rasters never pass through the Django backend or consume server bandwidth.
              </p>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-md bg-bnb-card text-bnb-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 border border-bnb-hairline-dark">1</span>
                <div>
                  <strong className="text-bnb-body">Sentinel-2 Composites:</strong> Google Earth Engine computes cloud-masked median composites over the AOI.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-md bg-bnb-card text-bnb-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 border border-bnb-hairline-dark">2</span>
                <div>
                  <strong className="text-bnb-body">Signed XYZ Tile URL:</strong> Django receives a signed tile URL template via <code>ee.Image.getMapId()</code>.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-md bg-bnb-card text-bnb-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 border border-bnb-hairline-dark">3</span>
                <div>
                  <strong className="text-bnb-body">Direct Browser Streaming:</strong> Leaflet requests tiles straight from Google servers. Zero proxy load on Render.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-md bg-bnb-card text-bnb-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 border border-bnb-hairline-dark">4</span>
                <div>
                  <strong className="text-bnb-body">On-Demand Vectors:</strong> Only on-click per-incident simplified GeoJSON polygons are retrieved.
                </div>
              </div>
            </div>

            <div className="bg-bnb-canvas-dark p-3 rounded-lg border border-bnb-hairline-dark text-[11px]">
              <div className="font-semibold text-bnb-body mb-1">Terminology mandate</div>
              <p className="text-bnb-muted">
                All findings represent <em>"potential vegetation loss"</em> and strictly <em>"require on-ground field verification"</em> prior to any legal determination.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}