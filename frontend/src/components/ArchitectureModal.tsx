import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Code2,
  FileJson,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Database,
  ArrowRight,
  MonitorSmartphone,
} from 'lucide-react';

export const ArchitectureModal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'pipeline' | 'innovations' | 'pitch' | 'schema'>('pipeline');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Technical Architecture & Presentation Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
          AI Trade Helper: System Engineering & Evaluation
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Comprehensive technical documentation of the multimodal vision processing engine, explainable AI reasoning layer, and system architecture.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-center gap-2 bg-[#121821] p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveSection('pipeline')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'pipeline'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Architecture Pipeline
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('innovations')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'innovations'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Key Innovations
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('pitch')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'pitch'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          2-Min Pitch Script
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('schema')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'schema'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          JSON Schema
        </button>
      </div>

      {/* Section Content */}
      <div className="bg-[#121821] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* TAB 1: ARCHITECTURE PIPELINE */}
        {activeSection === 'pipeline' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                Multimodal Vision Processing Flow
              </h3>
              <p className="text-xs text-slate-400">
                How visual chart pixels are transformed into deterministic, grounded technical evaluations.
              </p>
            </div>

            {/* Visual Pipeline Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs">1</span>
                <h4 className="font-bold text-white">Client Capture</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  User uploads, drags, or pastes (Ctrl+V) a screenshot. Validates resolution, aspect ratio, and mime types.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center text-xs">2</span>
                <h4 className="font-bold text-white">Server Proxy Gateway</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Express backend proxies the request to securely safeguard API keys and enforces strict payload constraints.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-xs">3</span>
                <h4 className="font-bold text-white">Gemini 2.5 Flash</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Multimodal vision extracts geometry, candle sequences, indicator values, and computes 3 conditional scenarios.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-xs">4</span>
                <h4 className="font-bold text-white">Interactive XAI UI</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Renders technical overlays, scenario cards, plain-English/advanced summaries, and enables interactive chat Q&A.
                </p>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1.5">
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Strict Server-Side Security
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  All Gemini model credentials exist purely server-side. The browser never receives secrets or raw keys, ensuring full compliance with cloud deployment standards.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1.5">
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Dual-Mode Pedagogical Layer
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Dynamically bridges the gap between novice learners (Beginner Mode with analogies) and professional traders (Institutional quantitative jargon).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KEY INNOVATIONS */}
        {activeSection === 'innovations' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              Core Technical Differentiation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Anti-Hallucination Scenario Engine
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Traditional tools make dangerous single-path predictions. AI Trade Helper provides 3 branching conditional scenarios (Bullish, Neutral, Bearish) with explicit invalidation and confirmation triggers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Explainable AI (XAI) Transparent Reasoning
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Breaks down the AI thought process into verifiable steps: 1. Visual trend, 2. Moving average slope, 3. Oscillator momentum, 4. Volume confirmation, 5. Risk factor weighting.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-purple-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Multi-Timeframe Confluence Synthesizer
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Ingests screenshots from multiple timeframes (e.g. Daily + 1H + 15m) and scores confluence alignment, separating high-probability setups from low-timeframe noise.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Evolution Comparison ("What Changed?")
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Enables traders to upload a new follow-up screenshot and immediately receive a structural diff of migrating support, momentum reset, and trend status transitions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 2-MINUTE PITCH SCRIPT */}
        {activeSection === 'pitch' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              2-Minute Evaluation Pitch Guide
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                  0:00 - 0:30 • The Problem
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  "Retail traders and learners struggle to interpret complex chart screenshots. Most AI tools hallucinate single static price predictions that violate financial compliance and lead to bad risk management."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                  0:30 - 1:15 • The Solution (Live Demo)
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  "AI Trade Helper uses multimodal vision models to instantly inspect chart screenshots. Rather than predicting the future, it extracts visible price structure, indicators, and generates 3 conditional scenarios with explicit confirmation and invalidation rules."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-purple-400 font-bold uppercase block">
                  1:15 - 2:00 • Differentiation & Scalability
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  "With built-in multi-timeframe confluence, interactive chart Q&A, and explainable step-by-step reasoning, AI Trade Helper provides decision support for any financial market."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: JSON SCHEMA */}
        {activeSection === 'schema' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <FileJson className="w-5 h-5 text-emerald-400" />
                Structured Output Contract
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">TypeScript / JSON Schema</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-300 max-h-72">
              <pre>{`{
  "asset": "NIFTY 50",
  "timeframe": "15m",
  "chartType": "Candlestick",
  "currentPrice": "₹25,120.50",
  "marketStructure": {
    "structure": "Higher Highs & Higher Lows (Uptrend)",
    "phase": "Breakout Expansion",
    "strength": "Strong"
  },
  "trend": {
    "direction": "Bullish",
    "strength": "Strong",
    "explanation": "Clear succession of higher lows along the 20 EMA floor..."
  },
  "scenarios": {
    "bullish": {
      "title": "Ascending Triangle Breakout Continuation",
      "condition": "Price sustains above ₹25,150 with volume expansion",
      "confirmation": "15m candle close above ₹25,150",
      "invalidation": "Sustained drop below ₹25,000 ascending support",
      "estimatedTargetOrRange": "₹25,320 – ₹25,400"
    },
    "neutral": { ... },
    "bearish": { ... }
  },
  "aiConfidence": {
    "score": 88,
    "category": "High Visual Clarity"
  }
}`}</pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
