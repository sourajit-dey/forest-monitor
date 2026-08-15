import React from 'react';
import { AlertTriangle, TrendingDown, Map, ShieldCheck } from 'lucide-react';

export default function StatsOverview({ summary, aoiAreaSqkm }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white/80 backdrop-blur-md border-b border-[#e0e0e0]">
      {/* Metric 1: Total Incidents */}
      <div className="bg-[#f5f5f7] p-3 rounded-2xl border border-black/5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#7a7a7a] mb-1">
          <AlertTriangle className="w-3.5 h-3.5 text-[#e34a33]" />
          Flagged Zones
        </div>
        <div className="text-xl font-bold tracking-tight text-[#1d1d1f]">
          {summary.total_incidents}
        </div>
      </div>

      {/* Metric 2: Total Affected Area */}
      <div className="bg-[#f5f5f7] p-3 rounded-2xl border border-black/5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#7a7a7a] mb-1">
          <TrendingDown className="w-3.5 h-3.5 text-[#d4380d]" />
          Estimated Loss
        </div>
        <div className="text-xl font-bold tracking-tight text-[#1d1d1f]">
          {summary.total_loss_hectares}{' '}
          <span className="text-xs font-normal text-[#7a7a7a]">ha</span>
        </div>
      </div>

      {/* Metric 3: Mean NDVI Shift */}
      <div className="bg-[#f5f5f7] p-3 rounded-2xl border border-black/5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#7a7a7a] mb-1">
          <TrendingDown className="w-3.5 h-3.5 text-[#b30000]" />
          Mean NDVI Shift
        </div>
        <div className="text-xl font-bold tracking-tight text-[#b30000]">
          {summary.mean_ndvi_loss}
        </div>
      </div>

      {/* Metric 4: Total Monitored Area */}
      <div className="bg-[#f5f5f7] p-3 rounded-2xl border border-black/5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#7a7a7a] mb-1">
          <Map className="w-3.5 h-3.5 text-[#0066cc]" />
          AOI Monitored
        </div>
        <div className="text-xl font-bold tracking-tight text-[#1d1d1f]">
          {aoiAreaSqkm || '--'}{' '}
          <span className="text-xs font-normal text-[#7a7a7a]">km²</span>
        </div>
      </div>
    </div>
  );
}
