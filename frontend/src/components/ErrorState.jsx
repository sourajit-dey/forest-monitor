import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onDismiss, onRetry }) {
  if (!error) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-fade-in select-none">
      {/* Dark card with trading-red accent — per system, red is a signal not a surface fill */}
      <div className="bg-bnb-card border border-bnb-trading-down/40 text-bnb-body rounded-lg p-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-bnb-trading-down" />

        <div className="flex-1 text-xs">
          <div className="font-bold text-sm mb-0.5 text-bnb-trading-down">
            Analysis failed
          </div>
          <div className="leading-relaxed text-bnb-muted">{error}</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1.5 text-bnb-trading-down hover:bg-bnb-elevated rounded-md transition-all"
              title="Retry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 text-bnb-muted hover:text-bnb-body hover:bg-bnb-elevated rounded-md transition-all"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}