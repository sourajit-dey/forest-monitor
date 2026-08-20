import React from 'react';
import { Satellite } from 'lucide-react';

export default function LoadingState({ message = "Executing Sentinel-2 change detection pipeline..." }) {
  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 select-none animate-fade-in">
      <div className="bg-bnb-card border border-bnb-hairline-dark rounded-xl p-6 max-w-sm w-full shadow-[0_24px_64px_rgba(0,0,0,0.6)] flex flex-col items-center text-center space-y-4">
        {/* Calm Status Indicator — yellow brand tile */}
        <div className="flex items-center justify-center w-14 h-14">
          <div className="w-12 h-12 rounded-lg bg-bnb-primary flex items-center justify-center text-bnb-ink shadow-[0_8px_24px_rgba(252,213,53,0.25)]">
            <Satellite className="w-5 h-5" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-bnb-body tracking-tight">
            Querying Google Earth Engine
          </h3>
          <p className="text-xs text-bnb-muted mt-1 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Indeterminate Progress Bar — yellow on dark */}
        <div className="w-full h-1 rounded-full bg-bnb-elevated overflow-hidden">
          <div className="h-full rounded-full bg-bnb-primary indeterminate-bar"></div>
        </div>

        <div className="text-[10px] text-bnb-muted">
          Bypassing raw raster bandwidth via signed tile URLs
        </div>
      </div>
    </div>
  );
}