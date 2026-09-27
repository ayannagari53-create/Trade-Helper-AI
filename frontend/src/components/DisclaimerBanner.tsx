import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="line-clamp-1 sm:line-clamp-none">
            <strong className="text-slate-200">Educational Decision-Support Notice:</strong>{' '}
            AI Trade Helper analyzes only visible screenshot data for technical pattern recognition. It does{' '}
            <span className="text-amber-300 font-semibold">NOT guarantee future price movements</span> or constitute financial advice.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 shrink-0 px-2 py-0.5 rounded hover:bg-slate-800"
        >
          <span>{collapsed ? 'View Full Disclaimer' : 'Collapse'}</span>
          {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

      {!collapsed && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/60 text-[11px] leading-relaxed text-slate-400 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">•</span>
            <span>
              <strong>Confidence Score Meaning:</strong> Reflects visual clarity and indicator confluence, not probability that price will rise.
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong>Scenario-Based:</strong> Provides conditional Bullish, Neutral, and Bearish scenarios rather than absolute predictions.
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-cyan-400 font-bold">•</span>
            <span>
              <strong>Privacy Conscious:</strong> Screenshots are analyzed in memory and no sensitive account or broker information is stored.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
