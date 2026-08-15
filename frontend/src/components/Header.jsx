import React from 'react';
import { Trees, Play } from 'lucide-react';

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
            Deterministic Sentinel-2 Change Detection
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#7a7a7a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]"></span>
          <span className="hidden sm:inline">Sentinel-2 data live</span>
        </div>
      </div>

      {/* Lower 52px Frosted Glass Sub-Nav (per DESIGN.md sub-nav-frosted spec) */}
      <div className="h-[52px] frosted-glass border-b border-[#e0e0e0] px-6 flex items-center justify-between">
        {/* Left: Active AOI & Quick Stats */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-base md:text-lg font-semibold tracking-tight text-[#1d1d1f] truncate">
            {aoiName || "Select Area of Interest"}
          </span>
          {aoiAreaSqkm && (
            <span className="text-xs text-[#7a7a7a] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full border border-[#e0e0e0] font-mono flex-shrink-0">
              {aoiAreaSqkm} km²
            </span>
          )}

          {incidentCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-[#7a7a7a] flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e34a33]"></span>
              {incidentCount} flagged {incidentCount === 1 ? 'zone' : 'zones'}
            </span>
          )}
          {isCachedResult && (
            <span className="text-[11px] text-[#7a7a7a] flex-shrink-0">· cached result</span>
          )}
        </div>

        {/* Right: Primary Run Button (Apple pill CTA) */}
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="btn-apple-primary text-xs py-2 px-5"
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
