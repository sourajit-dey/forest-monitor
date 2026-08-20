import React from 'react';
import { FileText, Send, MapPin, Calendar, ShieldAlert } from 'lucide-react';

export default function IncidentPopup({
  incident,
  threshold,
  onGenerateReport,
  onOpenEmailModal,
  isGeneratingReport
}) {
  if (!incident) return null;

  const ndviChange = parseFloat(incident.ndvi_change);
  const ndviBefore = parseFloat(incident.ndvi_before);
  const ndviAfter = parseFloat(incident.ndvi_after);
  const areaHa = parseFloat(incident.area_hectares);

  return (
    <div className="w-[280px] sm:w-[300px] p-3 font-sans text-bnb-body overflow-hidden">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-bnb-hairline-dark">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-bnb-trading-down"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-bnb-muted-strong">
            Incident #{incident.id}
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-bnb-elevated text-bnb-muted border border-bnb-hairline-dark">
          Requires verification
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-bnb-elevated p-2.5 rounded-lg">
          <div className="text-[11px] font-medium text-bnb-muted">Area affected</div>
          <div className="font-mono text-lg font-bold tracking-tight text-bnb-body">
            {areaHa.toFixed(2)} <span className="text-xs font-normal text-bnb-muted">ha</span>
          </div>
        </div>

        <div className="bg-bnb-elevated p-2.5 rounded-lg">
          <div className="text-[11px] font-medium text-bnb-muted">Delta NDVI (Δ)</div>
          <div className="font-mono text-lg font-bold tracking-tight text-bnb-trading-down">
            {ndviChange.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Detailed Spectral Telemetry Table */}
      <div className="bg-bnb-canvas-dark border border-bnb-hairline-dark rounded-lg p-2.5 mb-3 text-xs space-y-1.5">
        <div className="flex justify-between items-center text-bnb-muted">
          <span>Baseline NDVI:</span>
          <span className="font-mono font-medium text-bnb-body">{ndviBefore.toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center text-bnb-muted">
          <span>Monitoring NDVI:</span>
          <span className="font-mono font-medium text-bnb-body">{ndviAfter.toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center text-bnb-muted">
          <span>Applied threshold:</span>
          <span className="font-mono font-medium text-bnb-body">{parseFloat(threshold || -0.3).toFixed(2)}</span>
        </div>
        {incident.predicted_class && (
          <div className="flex justify-between items-center text-bnb-muted pt-1 border-t border-bnb-hairline-dark">
            <span className="text-bnb-primary font-medium flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Risk class:
            </span>
            <span className="font-mono font-medium text-bnb-body">{incident.predicted_class} ({(incident.confidence * 100).toFixed(0)}%)</span>
          </div>
        )}
        {incident.detected_date && (
          <div className="flex justify-between items-center text-bnb-muted pt-1 border-t border-bnb-hairline-dark">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Detection window:
            </span>
            <span className="font-mono font-medium text-bnb-body">{incident.detected_date}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-bnb-muted">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Centroid:
          </span>
          <span className="font-mono text-[11px] text-bnb-muted">
            {incident.centroid_lat.toFixed(4)}°, {incident.centroid_lng.toFixed(4)}°
          </span>
        </div>
      </div>

      {/* Action Buttons — yellow primary + dark secondary */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onGenerateReport(incident.id)}
          disabled={isGeneratingReport}
          className="btn-primary w-full py-2.5 text-xs"
        >
          <FileText className="w-3.5 h-3.5" />
          {isGeneratingReport ? "Synthesizing Report..." : "Generate Officer Advisory"}
        </button>

        <button
          onClick={() => onOpenEmailModal(incident)}
          className="btn-secondary w-full py-2 text-xs"
        >
          <Send className="w-3 h-3" />
          Dispatch Field Alert Email
        </button>
      </div>

      <div className="mt-2.5 text-[10px] text-center text-bnb-muted">
        Deterministic telemetry · Requires on-ground field verification
      </div>
    </div>
  );
}