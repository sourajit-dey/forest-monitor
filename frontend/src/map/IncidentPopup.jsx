import React from 'react';
import { ShieldAlert, FileText, Send, CheckCircle2, MapPin } from 'lucide-react';

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
    <div className="w-80 p-4 font-sans text-[#1d1d1f]">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#e0e0e0]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e34a33] animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a]">
            Incident #{incident.id}
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fff2e8] text-[#d4380d] border border-[#ffbb96]">
          Requires Verification
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#f5f5f7] p-2 rounded-xl">
          <div className="text-[11px] font-medium text-[#7a7a7a]">Area Flagged</div>
          <div className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            {areaHa.toFixed(2)} <span className="text-xs font-normal text-[#7a7a7a]">ha</span>
          </div>
        </div>

        <div className="bg-[#f5f5f7] p-2 rounded-xl">
          <div className="text-[11px] font-medium text-[#7a7a7a]">Delta NDVI (Δ)</div>
          <div className="text-lg font-semibold tracking-tight text-[#b30000]">
            {ndviChange.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Detailed Spectral Telemetry Table */}
      <div className="bg-[#fafafc] border border-[#e0e0e0] rounded-xl p-2.5 mb-3 text-xs space-y-1.5">
        <div className="flex justify-between items-center text-[#333333]">
          <span className="text-[#7a7a7a]">Baseline NDVI:</span>
          <span className="font-mono font-medium text-[#1d1d1f]">{ndviBefore.toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center text-[#333333]">
          <span className="text-[#7a7a7a]">Monitoring NDVI:</span>
          <span className="font-mono font-medium text-[#1d1d1f]">{ndviAfter.toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center text-[#333333]">
          <span className="text-[#7a7a7a]">Applied Threshold:</span>
          <span className="font-mono font-medium text-[#1d1d1f]">{parseFloat(threshold || -0.3).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-[#333333] pt-1 border-t border-[#f0f0f0]">
          <span className="text-[#7a7a7a] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#7a7a7a]" /> Centroid:
          </span>
          <span className="font-mono text-[11px] text-[#7a7a7a]">
            {incident.centroid_lat.toFixed(4)}°, {incident.centroid_lng.toFixed(4)}°
          </span>
        </div>
      </div>

      {/* Action Buttons adhering to Apple pill button style */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => onGenerateReport(incident.id)}
          disabled={isGeneratingReport}
          className="btn-apple-primary w-full py-2 text-xs"
        >
          <FileText className="w-3.5 h-3.5" />
          {isGeneratingReport ? "Synthesizing Report..." : "Generate Officer Advisory"}
        </button>

        <button
          onClick={() => onOpenEmailModal(incident)}
          className="btn-apple-secondary w-full py-1.5 text-xs"
        >
          <Send className="w-3 h-3 text-[#0066cc]" />
          Dispatch Field Alert Email
        </button>
      </div>

      <div className="mt-2 text-[10px] text-center text-[#7a7a7a]">
        Deterministic telemetry • Field inspection required
      </div>
    </div>
  );
}
