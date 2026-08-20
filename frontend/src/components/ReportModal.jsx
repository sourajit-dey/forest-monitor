import React, { useState } from 'react';
import { X, Printer, Send, FileCheck, ShieldCheck, CheckSquare, Square } from 'lucide-react';

export default function ReportModal({
  isOpen,
  onClose,
  report,
  incident,
  onOpenEmailModal,
}) {
  const [checklist, setChecklist] = useState({
    cadastre: false,
    beatInspection: false,
    droneSurvey: false,
  });

  if (!isOpen || !report) return null;

  const toggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-text">
      <div className="bg-bnb-card rounded-xl border border-bnb-hairline-dark shadow-[0_24px_64px_rgba(0,0,0,0.6)] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-bnb-hairline-dark flex items-center justify-between bg-bnb-elevated flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-bnb-primary text-bnb-ink">
              <FileCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-bnb-body tracking-tight">
                Officer Field Verification Advisory
              </h2>
              <p className="text-xs text-bnb-muted">
                Incident Reference #{incident?.id} · Grounded Remote Sensing Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-bnb-muted hover:text-bnb-body hover:bg-bnb-canvas-dark rounded-md transition-all"
              title="Print Advisory Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-bnb-muted hover:text-bnb-body hover:bg-bnb-canvas-dark rounded-md transition-all"
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body with Report Markdown Rendering */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-bnb-body">
          {/* Formatted Report Content */}
          <div className="whitespace-pre-wrap leading-relaxed font-sans bg-bnb-elevated border border-bnb-hairline-dark p-5 rounded-lg text-bnb-body">
            {report.generated_text}
          </div>

          {/* Interactive Officer Field Verification Checklist */}
          <div className="bg-bnb-canvas-dark border border-bnb-hairline-dark rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-bnb-body">
              <ShieldCheck className="w-4 h-4 text-bnb-trading-up" />
              Field Verification Protocol Checklist
            </div>

            <div className="space-y-2 text-xs">
              <label
                onClick={() => toggleCheck('cadastre')}
                className="flex items-center gap-2.5 p-2.5 rounded-md bg-bnb-card border border-bnb-hairline-dark cursor-pointer hover:bg-bnb-elevated transition-all"
              >
                {checklist.cadastre ? (
                  <CheckSquare className="w-4 h-4 text-bnb-primary" />
                ) : (
                  <Square className="w-4 h-4 text-bnb-muted" />
                )}
                <span className={checklist.cadastre ? 'line-through text-bnb-muted' : 'text-bnb-body'}>
                  1. Cross-reference ({incident?.centroid_lat.toFixed(4)}°, {incident?.centroid_lng.toFixed(4)}°) with Cadastral &amp; FRA Land Concession Records
                </span>
              </label>

              <label
                onClick={() => toggleCheck('beatInspection')}
                className="flex items-center gap-2.5 p-2.5 rounded-md bg-bnb-card border border-bnb-hairline-dark cursor-pointer hover:bg-bnb-elevated transition-all"
              >
                {checklist.beatInspection ? (
                  <CheckSquare className="w-4 h-4 text-bnb-primary" />
                ) : (
                  <Square className="w-4 h-4 text-bnb-muted" />
                )}
                <span className={checklist.beatInspection ? 'line-through text-bnb-muted' : 'text-bnb-body'}>
                  2. Dispatch Forest Beat Officer for Geo-Tagged Ground Inspection &amp; Photography ({incident?.area_hectares} ha)
                </span>
              </label>

              <label
                onClick={() => toggleCheck('droneSurvey')}
                className="flex items-center gap-2.5 p-2.5 rounded-md bg-bnb-card border border-bnb-hairline-dark cursor-pointer hover:bg-bnb-elevated transition-all"
              >
                {checklist.droneSurvey ? (
                  <CheckSquare className="w-4 h-4 text-bnb-primary" />
                ) : (
                  <Square className="w-4 h-4 text-bnb-muted" />
                )}
                <span className={checklist.droneSurvey ? 'line-through text-bnb-muted' : 'text-bnb-body'}>
                  3. UAV / Drone Reconnaissance for Canopy Loss Density Verification
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-bnb-hairline-dark bg-bnb-elevated flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-bnb-muted">
            Synthesis engine: <span className="font-mono text-bnb-muted-strong">{report.model_name || 'Gemini 1.5 Flash'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenEmailModal(incident);
              }}
              className="btn-secondary text-xs py-2.5 px-4"
            >
              <Send className="w-3.5 h-3.5" />
              Email Advisory Alert
            </button>

            <button
              onClick={onClose}
              className="btn-primary text-xs py-2.5 px-5"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}