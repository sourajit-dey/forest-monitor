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
    <header className="w-full select-none z-30 flex flex-col flex-shrink-0 border-b border-bnb-hairline-dark bg-bnb-canvas-dark">
      {/* 64px Dark Top Nav (per DESIGN.md top-nav-dark) */}
      <div className="h-16 px-5 flex items-center justify-between gap-4">
        {/* Left: Brand mark */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-bnb-primary text-bnb-ink flex-shrink-0 shadow-[0_4px_14px_rgba(252,213,53,0.25)]">
            <Trees className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-bnb-on-dark leading-tight truncate">
              ARANYA
            </div>
            <div className="text-[11px] text-bnb-muted leading-tight hidden md:block truncate" title="Automated Remote-sensing Analytics for Nature and Yield Assessment">
              Automated Remote-sensing Analytics for Nature and Yield Assessment
            </div>
          </div>
        </div>

        {/* Center: Active AOI context */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-center px-2">
          <span className="text-sm font-medium text-bnb-body truncate">
            {aoiName || "Select an area of interest"}
          </span>
          {aoiAreaSqkm && (
            <span className="text-[11px] text-bnb-muted-strong bg-bnb-card px-2.5 py-1 rounded-md border border-bnb-hairline-dark font-mono flex-shrink-0">
              {aoiAreaSqkm} km²
            </span>
          )}
          {incidentCount > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-bnb-muted flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-bnb-trading-down"></span>
              {incidentCount} {incidentCount === 1 ? 'zone' : 'zones'}
            </span>
          )}
          {isCachedResult && (
            <span className="text-[11px] text-bnb-muted flex-shrink-0">· cached</span>
          )}
        </div>

        {/* Right: status + primary Run CTA */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-bnb-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-bnb-trading-up"></span>
            Sentinel-2 data live
          </div>
          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="btn-primary btn-primary-pill text-[13px]"
          >
            {isAnalyzing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-bnb-ink/30 border-t-bnb-ink rounded-full animate-spin"></span>
                <span>Processing</span>
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