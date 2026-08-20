import React from 'react';
import { AlertTriangle, TrendingDown, Activity, Map } from 'lucide-react';

export default function StatsOverview({ summary, aoiAreaSqkm }) {
  if (!summary) return null;

  const metrics = [
    {
      label: 'Detected zones',
      value: summary.total_incidents,
      icon: AlertTriangle,
      valueClass: 'text-bnb-primary',
    },
    {
      label: 'Affected area',
      value: summary.total_loss_hectares,
      unit: 'ha',
      icon: TrendingDown,
      valueClass: 'text-bnb-primary',
    },
    {
      label: 'Mean NDVI shift',
      value: summary.mean_ndvi_loss,
      icon: Activity,
      valueClass: 'text-bnb-trading-down',
    },
    {
      label: 'Monitored area',
      value: aoiAreaSqkm || '--',
      unit: 'km²',
      icon: Map,
      valueClass: 'text-bnb-body',
    },
  ];

  return (
    <div className="flex-shrink-0 bg-bnb-canvas-dark border-b border-bnb-hairline-dark">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {metrics.map((metric, i) => (
          <div
            key={metric.label}
            className={`px-6 py-3 ${i > 0 ? 'md:border-l md:border-bnb-hairline-dark border-t border-bnb-hairline-dark md:border-t-0' : ''}`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-bnb-muted mb-1">
              <metric.icon className="w-3.5 h-3.5 text-bnb-muted-strong" />
              {metric.label}
            </div>
            <div className={`font-mono text-xl font-bold tracking-tight leading-none ${metric.valueClass}`}>
              {metric.value}
              {metric.unit && (
                <span className="text-xs font-normal text-bnb-muted ml-1">{metric.unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}