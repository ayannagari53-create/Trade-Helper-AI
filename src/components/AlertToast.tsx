import React from 'react';
import { PriceAlert } from '../types';
import { BellRing, X, Check, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface AlertToastProps {
  alert: PriceAlert | null;
  onDismiss: () => void;
  onViewAnalysis?: (analysisId?: string) => void;
}

export const AlertToast: React.FC<AlertToastProps> = ({ alert, onDismiss, onViewAnalysis }) => {
  if (!alert) return null;

  const isSupport = alert.levelType.toLowerCase().includes('support');
  const isResistance = alert.levelType.toLowerCase().includes('resistance');

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-slideUp">
      <div className="bg-[#121824] border-2 border-emerald-500/80 rounded-2xl p-4 shadow-2xl shadow-emerald-950/60 text-white relative overflow-hidden backdrop-blur-xl">
        {/* Animated Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 animate-pulse" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                  {alert.asset}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {alert.timeframe}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Triggered
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-300">Level: <strong className="text-white">{alert.levelType}</strong></span>
              <span className="text-base font-mono font-black text-emerald-400">{alert.targetPrice}</span>
            </div>

            <p className="text-xs text-slate-300 leading-snug">
              <strong className="text-emerald-300">{alert.condition}</strong> {alert.notes ? `— ${alert.notes}` : ''}
            </p>

            {alert.simulatedPrice && (
              <div className="text-[11px] font-mono text-slate-400 pt-1">
                Market Price: <strong className="text-white">{alert.simulatedPrice}</strong>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>
          {onViewAnalysis && alert.analysisId && (
            <button
              type="button"
              onClick={() => onViewAnalysis(alert.analysisId)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-md shadow-emerald-950"
            >
              <span>View Chart</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
