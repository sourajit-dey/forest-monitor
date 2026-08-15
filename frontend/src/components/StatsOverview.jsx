import React from 'react';
import { AlertTriangle, TrendingDown, Map, Activity } from 'lucide-react';

export default function StatsOverview({ summary, aoiAreaSqkm }) {
  if (!summary) return null;

  const metrics = [
    {
      label: 'Flagged zones',
      value: summary.total_incidents,
      icon: AlertTriangle,
      valueClass: 'text-[#1d1d1f]',
    },
    {
      label: 'Estimated loss',
      value: summary.total_loss_hectares,
      unit: 'ha',
      icon: TrendingDown,
      valueClass: 'text-[#1d1d1f]',
    },
    {
      label: 'Mean NDVI shift',
      value: summary.mean_ndvi_loss,
      icon: Activity,
      valueClass: 'text-[#b30000]',
    },
    {
      label: 'Monitored area',
      value: aoiAreaSqkm || '--',
      unit: 'km²',
      icon: Map,
      valueClass: 'text-[#1d1d1f]',
    },
  ];

  return (
    <div className="flex-shrink-0 bg-white/85 backdrop-blur-md border-b border-[#e0e0e0]">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {metrics.map((metric, i) => (
          <div
            key={metric.label}
            className={`px-6 py-3 ${i > 0 ? 'md:border-l md:border-[#f0f0f0]' : ''}`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#7a7a7a] mb-0.5">
              <metric.icon className="w-3.5 h-3.5 text-[#b3b3b6]" />
              {metric.label}
            </div>
            <div className={`text-lg font-semibold tracking-tight ${metric.valueClass}`}>
              {metric.value}
              {metric.unit && (
                <span className="text-xs font-normal text-[#7a7a7a] ml-1">{metric.unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
