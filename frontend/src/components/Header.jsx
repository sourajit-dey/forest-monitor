import React from 'react';
import { Trees, Satellite, ShieldCheck, Play, Sparkles, ChevronRight, Activity } from 'lucide-react';

export default function Header({
  aoiName,
  incidentCount,
  isAnalyzing,
  onRunAnalysis,
  aoiAreaSqkm,
  isCachedResult
}) {
  return (
    <header className="w-full select-none z-30 flex flex-col flex-shrink-0">
      {/* Upper 44px Pure Black Global Nav (per DESIGN.md global-nav spec) */}
      <div className="h-[44px] bg-[#000000] text-white px-6 flex items-center justify-between text-xs font-normal tracking-tight border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white font-medium">
            <Trees className="w-4 h-4 text-[#2997ff]" />
            <span className="tracking-tight text-[13px] font-semibold">Forest Canopy WebGIS</span>
          </div>
          <span className="text-[#7a7a7a] hidden md:inline">|</span>
          <span className="text-[#cccccc] text-[11px] hidden md:inline">
            Deterministic Sentinel-2 Change Detection Portal
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#cccccc] text-[11px]">
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-white">
            <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse"></span>
            <span>Sentinel-2 Harmonized Live</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[#7a7a7a]">
            <span>Algorithm:</span>
            <span className="font-mono text-[#cccccc]">v1.0-ndvi-delta</span>
          </div>
        </div>
      </div>

      {/* Lower 52px Frosted Glass Sub-Nav (per DESIGN.md sub-nav-frosted spec) */}
      <div className="h-[52px] frosted-glass border-b border-[#e0e0e0] px-6 flex items-center justify-between">
        {/* Left: Active AOI & Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-[#1d1d1f]">
              {aoiName || "Select Area of Interest"}
            </span>
            {aoiAreaSqkm && (
              <span className="text-xs text-[#7a7a7a] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full border border-[#e0e0e0] font-mono">
                {aoiAreaSqkm} km²
              </span>
            )}
          </div>

          {incidentCount !== undefined && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff2e8] text-[#d4380d] border border-[#ffbb96]">
                {incidentCount} Flagged {incidentCount === 1 ? 'Zone' : 'Zones'}
              </span>
              {isCachedResult && (
                <span className="text-[11px] text-[#0066cc] bg-[#e6f4ff] px-2 py-0.5 rounded-full border border-[#91caff]">
                  Cached
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Primary Run Button (Apple pill CTA) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="btn-apple-primary text-xs py-2 px-5 shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Processing Sentinel-2...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Change Detection</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
