import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onDismiss, onRetry }) {
  if (!error) return null;

  return (
    <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-fade-in select-none">
      <div className="bg-[#fff1f0] border border-[#ffa39e] text-[#cf1322] rounded-2xl p-4 shadow-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#f5222d]" />
        
        <div className="flex-1 text-xs">
          <div className="font-semibold text-sm mb-0.5">Analysis Request Warning</div>
          <div className="leading-relaxed text-[#5c0011]">{error}</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1 text-[#f5222d] hover:bg-[#ffccc7] rounded-lg transition-all"
              title="Retry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-[#f5222d] hover:bg-[#ffccc7] rounded-lg transition-all"
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
