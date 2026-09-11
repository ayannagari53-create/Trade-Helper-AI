import React, { useState } from 'react';
import { ChartAnalysisResult, ChartAnnotationOverlay } from '../types';
import { Eye, Layers, Maximize2, SplitSquareVertical, Tag } from 'lucide-react';

interface ChartAnnotatorProps {
  analysis: ChartAnalysisResult;
}

export const ChartAnnotator: React.FC<ChartAnnotatorProps> = ({ analysis }) => {
  const [viewMode, setViewMode] = useState<'annotated' | 'original' | 'split'>('annotated');
  const [activeAnnotationHover, setActiveAnnotationHover] = useState<ChartAnnotationOverlay | null>(null);

  const annotations = analysis.annotations || [];

  return (
    <div className="w-full bg-[#121821] border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-4 sm:p-5">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
            Chart View & AI Technical Overlays
          </h3>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            {analysis.asset} • {analysis.timeframe}
          </span>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setViewMode('annotated')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'annotated'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI Annotated</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'original'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer hidden md:flex ${
              viewMode === 'split'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original View */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Original Screenshot
            </span>
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F14] h-[340px] flex items-center justify-center">
              <img
                src={analysis.imageUrl}
                alt="Original trading chart"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Annotated View */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              AI Vision Overlays (Support / Resistance / Trendlines)
            </span>
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F14] h-[340px] flex items-center justify-center">
              <img
                src={analysis.imageUrl}
                alt="Annotated chart background"
                className="w-full h-full object-contain"
              />
              <OverlayLayer
                annotations={annotations}
                analysis={analysis}
                onHover={setActiveAnnotationHover}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F14] max-h-[460px] flex items-center justify-center">
          <img
            src={analysis.imageUrl}
            alt="Trading chart"
            className="w-full max-h-[460px] object-contain"
          />

          {viewMode === 'annotated' && (
            <OverlayLayer
              annotations={annotations}
              analysis={analysis}
              onHover={setActiveAnnotationHover}
            />
          )}

          {/* Watermark badge */}
          <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur border border-slate-700/80 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white">{analysis.asset}</span>
            <span className="text-slate-400 font-mono">({analysis.timeframe})</span>
            <span className="text-emerald-400 font-bold">{analysis.trend.direction}</span>
          </div>
        </div>
      )}

      {/* Annotation Hover Tooltip Details */}
      {activeAnnotationHover && (
        <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs flex items-center justify-between gap-3 text-slate-200">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: activeAnnotationHover.color }}
            />
            <span className="font-bold text-white">{activeAnnotationHover.label}</span>
            {activeAnnotationHover.notes && (
              <span className="text-slate-400">— {activeAnnotationHover.notes}</span>
            )}
          </div>
        </div>
      )}

      {/* Annotations Key Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
        <span className="text-slate-500 font-semibold uppercase text-[10px]">Detected Key Levels:</span>
        {analysis.keyLevels.map((lvl) => (
          <span
            key={lvl.id}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${
              lvl.type.includes('Resistance')
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : lvl.type.includes('Support')
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: lvl.type.includes('Resistance')
                  ? '#FF5252'
                  : lvl.type.includes('Support')
                  ? '#00C853'
                  : '#38BDF8',
              }}
            />
            <span>{lvl.type}:</span>
            <strong className="text-white font-mono">{lvl.price}</strong>
          </span>
        ))}
      </div>
    </div>
  );
};

interface OverlayLayerProps {
  annotations: ChartAnnotationOverlay[];
  analysis: ChartAnalysisResult;
  onHover: (ann: ChartAnnotationOverlay | null) => void;
}

const OverlayLayer: React.FC<OverlayLayerProps> = ({ annotations, analysis, onHover }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-auto"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {annotations.map((ann, idx) => {
        if (ann.type === 'horizontal_line' && typeof ann.yPercentage === 'number') {
          const y = ann.yPercentage;
          return (
            <g
              key={idx}
              onMouseEnter={() => onHover(ann)}
              onMouseLeave={() => onHover(null)}
              className="cursor-pointer group"
            >
              {/* Thick transparent stroke for easier hover touch target */}
              <line
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="transparent"
                strokeWidth="4"
              />
              <line
                x1="2"
                y1={y}
                x2="98"
                y2={y}
                stroke={ann.color || '#38BDF8'}
                strokeWidth="0.8"
                strokeDasharray="2 1"
                className="transition-all group-hover:stroke-width-1.5"
              />
              <rect
                x="3"
                y={Math.max(y - 3.5, 1)}
                width={Math.min(ann.label.length * 1.5 + 4, 30)}
                height="3.5"
                rx="0.8"
                fill={ann.color || '#38BDF8'}
                opacity="0.85"
              />
              <text
                x="4.5"
                y={Math.max(y - 1, 3.5)}
                fill="#000"
                fontSize="2.2"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {ann.label}
              </text>
            </g>
          );
        }

        if (ann.type === 'trendline' && typeof ann.x1 === 'number' && typeof ann.y1 === 'number') {
          return (
            <g
              key={idx}
              onMouseEnter={() => onHover(ann)}
              onMouseLeave={() => onHover(null)}
              className="cursor-pointer group"
            >
              <line
                x1={ann.x1}
                y1={ann.y1}
                x2={ann.x2 ?? 90}
                y2={ann.y2 ?? 50}
                stroke="transparent"
                strokeWidth="5"
              />
              <line
                x1={ann.x1}
                y1={ann.y1}
                x2={ann.x2 ?? 90}
                y2={ann.y2 ?? 50}
                stroke={ann.color || '#00C853'}
                strokeWidth="0.9"
                className="transition-all group-hover:stroke-width-1.5"
              />
            </g>
          );
        }

        return null;
      })}
    </svg>
  );
};
