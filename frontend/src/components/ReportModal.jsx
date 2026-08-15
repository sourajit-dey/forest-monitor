import React, { useState } from 'react';
import { X, Printer, Send, FileCheck, ShieldCheck, CheckSquare, Square, Download } from 'lucide-react';

export default function ReportModal({
  isOpen,
  onClose,
  report,
  incident,
  onOpenEmailModal,
}) {
  if (!isOpen || !report) return null;

  const [checklist, setChecklist] = useState({
    cadastre: false,
    beatInspection: false,
    droneSurvey: false,
  });

  const toggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-text">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/10 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e0e0e0] flex items-center justify-between bg-[#fafafc] flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#0066cc]" />
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
                Officer Field Verification Advisory
              </h2>
              <p className="text-xs text-[#7a7a7a]">
                Incident Reference #{incident?.id} • Grounded Remote Sensing Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-[#7a7a7a] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-all"
              title="Print Advisory Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#7a7a7a] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-all"
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body with Report Markdown Rendering */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-[#1d1d1f]">
          {/* Formatted Report Content */}
          <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#0066cc]">
            <div className="whitespace-pre-wrap leading-relaxed font-sans bg-[#fafafc] border border-[#e0e0e0] p-5 rounded-2xl">
              {report.generated_text}
            </div>
          </div>

          {/* Interactive Officer Field Verification Checklist */}
          <div className="bg-[#f5f5f7] border border-[#e0e0e0] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#333333]">
              <ShieldCheck className="w-4 h-4 text-[#34c759]" />
              Field Verification Protocol Checklist
            </div>

            <div className="space-y-2 text-xs">
              <label
                onClick={() => toggleCheck('cadastre')}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#e0e0e0] cursor-pointer hover:bg-[#fafafc] transition-all"
              >
                {checklist.cadastre ? (
                  <CheckSquare className="w-4 h-4 text-[#0066cc]" />
                ) : (
                  <Square className="w-4 h-4 text-[#7a7a7a]" />
                )}
                <span className={checklist.cadastre ? 'line-through text-[#7a7a7a]' : 'text-[#1d1d1f]'}>
                  1. Cross-reference ({incident?.centroid_lat.toFixed(4)}°, {incident?.centroid_lng.toFixed(4)}°) with Cadastral & FRA Land Concession Records
                </span>
              </label>

              <label
                onClick={() => toggleCheck('beatInspection')}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#e0e0e0] cursor-pointer hover:bg-[#fafafc] transition-all"
              >
                {checklist.beatInspection ? (
                  <CheckSquare className="w-4 h-4 text-[#0066cc]" />
                ) : (
                  <Square className="w-4 h-4 text-[#7a7a7a]" />
                )}
                <span className={checklist.beatInspection ? 'line-through text-[#7a7a7a]' : 'text-[#1d1d1f]'}>
                  2. Dispatch Forest Beat Officer for Geo-Tagged Ground Inspection & Photography ({incident?.area_hectares} ha)
                </span>
              </label>

              <label
                onClick={() => toggleCheck('droneSurvey')}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#e0e0e0] cursor-pointer hover:bg-[#fafafc] transition-all"
              >
                {checklist.droneSurvey ? (
                  <CheckSquare className="w-4 h-4 text-[#0066cc]" />
                ) : (
                  <Square className="w-4 h-4 text-[#7a7a7a]" />
                )}
                <span className={checklist.droneSurvey ? 'line-through text-[#7a7a7a]' : 'text-[#1d1d1f]'}>
                  3. UAV / Drone Reconnaissance for Canopy Loss Density Verification
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#e0e0e0] bg-[#fafafc] flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-[#7a7a7a]">
            Synthesis Engine: <span className="font-mono">{report.model_name || 'Gemini 1.5 Flash'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenEmailModal(incident);
              }}
              className="btn-apple-secondary text-xs py-2 px-4"
            >
              <Send className="w-3.5 h-3.5 text-[#0066cc]" />
              Email Advisory Alert
            </button>

            <button
              onClick={onClose}
              className="btn-apple-primary text-xs py-2 px-5"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
