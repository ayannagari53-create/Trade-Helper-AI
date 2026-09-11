import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Sparkles, Scan, Activity, Eye, ShieldAlert } from 'lucide-react';

interface AnalysisLoadingProps {
  previewImage?: string | null;
}

const STAGES = [
  { id: 1, label: 'Detecting chart & validating image clarity', icon: Scan },
  { id: 2, label: 'Reading visible price scale & timeframe structure', icon: Eye },
  { id: 3, label: 'Identifying technical indicators (EMAs, RSI, MACD, Volume)', icon: Activity },
  { id: 4, label: 'Detecting candlestick formations & structural patterns', icon: Sparkles },
  { id: 5, label: 'Computing conditional scenarios (Bullish, Neutral, Bearish)', icon: Activity },
  { id: 6, label: 'Synthesizing explainable reasoning & risk parameters', icon: ShieldAlert },
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ previewImage }) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STAGES.length ? prev + 1 : prev));
    }, 700);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-[#121821] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
      {/* Scanner Visual */}
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 animate-pulse flex items-center justify-center">
          <Scan className="w-10 h-10 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-emerald-300 animate-spin" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
          AI Vision Chart Analysis in Progress
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Inspecting visible chart geometry, extracting price structure, and assembling explainable trade scenarios.
        </p>
      </div>

      {/* Optional Thumbnail with scanning line */}
      {previewImage && (
        <div className="relative max-w-sm mx-auto h-28 rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F14]">
          <img
            src={previewImage}
            alt="Scanning chart"
            className="w-full h-full object-cover opacity-60 filter blur-[0.5px]"
          />
          {/* Laser scanning bar */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#00C853] animate-bounce" />
        </div>
      )}

      {/* Progress Checklist */}
      <div className="text-left space-y-2.5 max-w-md mx-auto bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        {STAGES.map((stage) => {
          const isDone = stage.id < currentStep;
          const isCurrent = stage.id === currentStep;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 text-xs transition-colors ${
                isDone
                  ? 'text-emerald-400 font-medium'
                  : isCurrent
                  ? 'text-slate-100 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
              )}
              <span className="truncate">{stage.label}</span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 font-mono">
        Strict Grounding: Only visible indicators and verifiable price action are included.
      </p>
    </div>
  );
};
