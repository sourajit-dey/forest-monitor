import React from 'react';
import { Satellite } from 'lucide-react';

export default function LoadingState({ message = "Executing Sentinel-2 change detection pipeline..." }) {
  return (
    <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 select-none animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl border border-black/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4">
        {/* Animated Radar Pulse */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute w-full h-full rounded-full bg-[#0066cc]/20 animate-ping"></div>
          <div className="w-12 h-12 rounded-full bg-[#0066cc] flex items-center justify-center text-white shadow-lg">
            <Satellite className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#1d1d1f] tracking-tight">
            Querying Google Earth Engine
          </h3>
          <p className="text-xs text-[#7a7a7a] mt-1 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="w-full bg-[#f0f0f0] h-1.5 rounded-full overflow-hidden">
          <div className="bg-[#0066cc] h-full rounded-full w-2/3 animate-pulse"></div>
        </div>

        <div className="text-[10px] text-[#7a7a7a]">
          Bypassing raw raster bandwidth via signed tile URLs
        </div>
      </div>
    </div>
  );
}
