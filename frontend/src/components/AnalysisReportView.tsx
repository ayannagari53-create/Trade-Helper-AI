import React, { useState, useEffect } from 'react';
import {
  ChartAnalysisResult,
  ScenarioDetail,
  KeyPriceLevel,
  PriceAlert,
} from '../types';
import {
  TrendingUp,
  TrendingDown,
  Compass,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Brain,
  Layers,
  Activity,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Flame,
  FileDown,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  Share2,
  Sparkles,
  Info,
  Check,
  Tag,
  Bell,
  BellRing,
  Plus,
  Gauge,
  Target,
  Percent,
} from 'lucide-react';
import { SetAlertModal } from './SetAlertModal';
import { PatternScanner, ScannedPatternItem } from './PatternScanner';
import { getStoredAlerts, ALERTS_EVENT_NAME } from '../utils/alertStore';

interface AnalysisReportViewProps {
  analysis: ChartAnalysisResult;
  beginnerMode: boolean;
  onSaveToWatchlist?: (analysis: ChartAnalysisResult) => void;
  onOpenChat: () => void;
}

export const AnalysisReportView: React.FC<AnalysisReportViewProps> = ({
  analysis,
  beginnerMode,
  onSaveToWatchlist,
  onOpenChat,
}) => {
  const [activeScenario, setActiveScenario] = useState<'bullish' | 'neutral' | 'bearish'>('bullish');
  const [showReasoning, setShowReasoning] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<'helpful' | 'not_helpful' | null>(null);
  const [feedbackReason, setFeedbackReason] = useState<string>('');
  const [savedToWl, setSavedToWl] = useState<boolean>(false);

  // Alert Modal state & active alerts tracking
  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);
  const [selectedKeyLevelForAlert, setSelectedKeyLevelForAlert] = useState<KeyPriceLevel | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<PriceAlert[]>([]);
  const [hoveredPatternName, setHoveredPatternName] = useState<string | null>(null);

  // Load and subscribe to persistent browser-based alert store changes
  useEffect(() => {
    const loadAlerts = () => {
      const allAlerts = getStoredAlerts();
      const currentAssetAlerts = allAlerts.filter(
        (a) => a.asset.toLowerCase().trim() === analysis.asset.toLowerCase().trim()
      );
      setActiveAlerts(currentAssetAlerts);
    };

    loadAlerts();

    const handleAlertsChanged = () => {
      loadAlerts();
    };

    window.addEventListener(ALERTS_EVENT_NAME, handleAlertsChanged);
    window.addEventListener('storage', handleAlertsChanged);

    return () => {
      window.removeEventListener(ALERTS_EVENT_NAME, handleAlertsChanged);
      window.removeEventListener('storage', handleAlertsChanged);
    };
  }, [analysis.asset]);

  const handleOpenAlertModal = (level?: KeyPriceLevel) => {
    setSelectedKeyLevelForAlert(level || null);
    setAlertModalOpen(true);
  };

  const handleSetAlertForPattern = (pattern: ScannedPatternItem) => {
    const customLevel: KeyPriceLevel = {
      id: `pat-alert-${Date.now()}`,
      type: pattern.bias === 'bullish' ? 'Major Resistance' : 'Major Support',
      price: pattern.triggerLevel || analysis.currentPrice,
      significance: `${pattern.name} breakout trigger level`,
      confidence: pattern.matchScore,
    };
    setSelectedKeyLevelForAlert(customLevel);
    setAlertModalOpen(true);
  };

  const getAlertForLevel = (lvl: KeyPriceLevel) => {
    const cleanLvlPrice = lvl.price.replace(/[^0-9.]/g, '');
    return activeAlerts.find(
      (a) => a.targetPrice.replace(/[^0-9.]/g, '') === cleanLvlPrice && a.status === 'Active'
    );
  };

  const handleCopySummary = () => {
    const text = `📊 AI TRADE HELPER TECHNICAL REPORT
Asset: ${analysis.asset} (${analysis.timeframe})
Current Price: ${analysis.currentPrice}
Market Structure: ${analysis.marketStructure.structure} (${analysis.marketStructure.phase})
Trend Bias: ${analysis.trend.direction} (Confidence Score: ${analysis.aiConfidence.score}%)
Volatility: ${analysis.volatility.level}

🟢 BULLISH SCENARIO:
Condition: ${analysis.scenarios.bullish.condition}
Confirmation: ${analysis.scenarios.bullish.confirmation}
Invalidation: ${analysis.scenarios.bullish.invalidation}

🟡 NEUTRAL SCENARIO:
Condition: ${analysis.scenarios.neutral.condition}

🔴 BEARISH SCENARIO:
Condition: ${analysis.scenarios.bearish.condition}
Confirmation: ${analysis.scenarios.bearish.confirmation}
Invalidation: ${analysis.scenarios.bearish.invalidation}

⚠️ RISK FACTORS:
${analysis.riskAssessment.factors.map((f) => `• ${f}`).join('\n')}

Notice: Educational technical analysis tool. Not financial advice.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFeedback = (rating: 'helpful' | 'not_helpful', reason?: string) => {
    setFeedbackSubmitted(rating);
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysisId: analysis.id,
        rating,
        reason: reason || feedbackReason,
      }),
    }).catch((e) => console.error('Feedback error:', e));
  };

  const handleWatchlistClick = () => {
    if (onSaveToWatchlist) {
      onSaveToWatchlist(analysis);
      setSavedToWl(true);
      setTimeout(() => setSavedToWl(false), 3000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Hero Diagnostics Banner */}
      <div className="bg-[#121821] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Asset & Trend Badge */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                {analysis.asset}
              </h2>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {analysis.timeframe}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/80 text-cyan-400 border border-cyan-500/30">
                {analysis.chartType}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span>
                Last Visible Price:{' '}
                <strong className="text-white font-mono text-sm">{analysis.currentPrice}</strong>
              </span>
              <span>•</span>
              <span>
                Structure:{' '}
                <strong className="text-slate-200">{analysis.marketStructure.structure}</strong>
              </span>
              <span>•</span>
              <span>
                Phase:{' '}
                <strong className="text-emerald-400">{analysis.marketStructure.phase}</strong>
              </span>
            </div>
          </div>

          {/* Core Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-auto">
            {/* Trend Bias */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Market Bias
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {analysis.trend.direction.includes('Bullish') ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : analysis.trend.direction.includes('Bearish') ? (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                ) : (
                  <Compass className="w-4 h-4 text-amber-400" />
                )}
                <span className={`text-xs font-bold ${
                  analysis.trend.direction.includes('Bullish')
                    ? 'text-emerald-400'
                    : analysis.trend.direction.includes('Bearish')
                    ? 'text-red-400'
                    : 'text-amber-400'
                }`}>
                  {analysis.trend.direction}
                </span>
              </div>
            </div>

            {/* AI Confidence */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Clarity / Confidence
                </span>
                <span
                  title="Score reflects visual clarity of the screenshot and indicator confluence, not future price certainty"
                  className="cursor-help"
                >
                  <Info className="w-3 h-3 text-slate-500" />
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-extrabold text-white font-mono">
                  {analysis.aiConfidence.score}%
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  ({analysis.aiConfidence.category})
                </span>
              </div>
            </div>

            {/* Momentum */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Momentum
              </span>
              <span className={`text-xs font-bold mt-1 block ${
                analysis.momentum.status.includes('Positive')
                  ? 'text-emerald-400'
                  : analysis.momentum.status.includes('Negative')
                  ? 'text-red-400'
                  : 'text-amber-400'
              }`}>
                {analysis.momentum.status}
              </span>
            </div>

            {/* Volatility */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Volatility
              </span>
              <span className="text-xs font-bold text-slate-200 mt-1 block">
                {analysis.volatility.level}
              </span>
            </div>
          </div>
        </div>

        {/* Action toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI About This Chart</span>
            </button>

            <a
              href="#pattern-scanner-section"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 hover:bg-teal-500/25 font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pattern Scanner</span>
            </a>

            <button
              type="button"
              onClick={() => handleOpenAlertModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 font-semibold transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Set Alert on Level</span>
            </button>

            {onSaveToWatchlist && (
              <button
                type="button"
                onClick={handleWatchlistClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>{savedToWl ? 'Saved to Watchlist!' : 'Add to Watchlist'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Report' : 'Copy Trade Brief'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode-Specific Executive Summary Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-emerald-400" />
            {beginnerMode ? 'Beginner Plain-English Explanation' : 'Quantitative Institutional Breakdown'}
          </span>
          <span className="text-[11px] text-slate-500">
            {beginnerMode ? 'Simplified concepts' : 'Full technical syntax'}
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-sans">
          {beginnerMode ? analysis.beginnerSummary : analysis.advancedSummary}
        </p>
      </div>

      {/* 🚀 CORE FEATURE: SCENARIO ENGINE */}
      <div className="bg-[#121821] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Scenario-Based Decision Engine
            </h3>
            <p className="text-xs text-slate-400">
              Conditional setups instead of single static predictions. Observe which trigger validates first.
            </p>
          </div>

          {/* Scenario Tab Buttons */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setActiveScenario('bullish')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeScenario === 'bullish'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Bullish</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScenario('neutral')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeScenario === 'neutral'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Neutral / Range</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScenario('bearish')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeScenario === 'bearish'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>Bearish</span>
            </button>
          </div>
        </div>

        {/* Active Scenario Card */}
        {(() => {
          const sc = analysis.scenarios[activeScenario];
          const isBull = activeScenario === 'bullish';
          const isBear = activeScenario === 'bearish';
          const accentColor = isBull ? 'border-emerald-500/40' : isBear ? 'border-red-500/40' : 'border-amber-500/40';

          return (
            <div className={`border rounded-xl p-5 bg-slate-900/60 space-y-4 ${accentColor}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-white font-['Plus_Jakarta_Sans']">
                  {sc.title}
                </span>
                {sc.estimatedTargetOrRange && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    Target / Range: <strong className="text-emerald-400">{sc.estimatedTargetOrRange}</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">
                    Condition Required:
                  </span>
                  <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    {sc.condition}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">
                    Technical Implication:
                  </span>
                  <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    {sc.implication}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-emerald-500 font-bold uppercase text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirmation Signal:
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    {sc.confirmation}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-red-400 font-bold uppercase text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Invalidation Rule:
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    {sc.invalidation}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 🧠 EXPLAINABLE AI (XAI) REASONING */}
      <div className="bg-[#121821] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div
          onClick={() => setShowReasoning(!showReasoning)}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] group-hover:text-emerald-300 transition-colors">
              Why Does the AI Deduce This? (Explainable Reasoning)
            </h3>
          </div>
          <button className="text-slate-400 group-hover:text-slate-200 p-1">
            {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showReasoning && (
          <div className="space-y-3 pt-2">
            {analysis.explainableReasoning.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.step || idx + 1}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TECHNICAL DIAGNOSTICS & INDICATOR MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Visible Indicators & Candlestick Formations */}
        <div className="bg-[#121821] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
              Visible Indicator Diagnostics
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* RSI */}
            {analysis.indicators.rsi && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Relative Strength Index (RSI)</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {analysis.indicators.rsi.value ? `Value: ${analysis.indicators.rsi.value}` : 'Visible'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {analysis.indicators.rsi.interpretation}
                </p>
                {analysis.indicators.rsi.divergence && analysis.indicators.rsi.divergence !== 'None visible' && (
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ⚡ {analysis.indicators.rsi.divergence}
                  </span>
                )}
              </div>
            )}

            {/* Moving Averages */}
            {analysis.indicators.movingAverages && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Moving Averages (EMA / SMA)</span>
                  <span className="text-amber-400 font-semibold text-[11px]">
                    {analysis.indicators.movingAverages.priceVsMA}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {analysis.indicators.movingAverages.interpretation}
                </p>
              </div>
            )}

            {/* MACD */}
            {analysis.indicators.macd && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">MACD Momentum</span>
                  <span className="text-emerald-400 font-semibold text-[11px]">
                    {analysis.indicators.macd.signal}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {analysis.indicators.macd.interpretation}
                </p>
              </div>
            )}

            {/* Volume */}
            {analysis.indicators.volume && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Volume Participation</span>
                  <span className="text-purple-400 font-semibold text-[11px]">
                    {analysis.indicators.volume.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {analysis.indicators.volume.interpretation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Patterns & Key Price Levels Table */}
        <div className="bg-[#121821] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
              Key Price Levels & Structural Geometry
            </h3>
          </div>

          {/* Key Levels List */}
          <div className="space-y-2">
            {analysis.keyLevels.map((lvl) => {
              const existingAlert = getAlertForLevel(lvl);
              return (
                <div
                  key={lvl.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs gap-2"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          lvl.type.includes('Resistance')
                            ? 'bg-red-400'
                            : lvl.type.includes('Support')
                            ? 'bg-emerald-400'
                            : 'bg-cyan-400'
                        }`}
                      />
                      <span className="font-bold text-slate-200">{lvl.type}</span>
                      <strong className="text-white font-mono ml-1 text-sm">{lvl.price}</strong>
                      <span className="text-[10px] font-mono text-slate-500 ml-1">
                        ({lvl.confidence}% conf.)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{lvl.significance}</p>
                  </div>

                  {/* Level Alert Action */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {existingAlert ? (
                      <button
                        type="button"
                        onClick={() => handleOpenAlertModal(lvl)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all shadow-sm cursor-pointer"
                        title={`Alert Active: ${existingAlert.condition}. Click to adjust or create another.`}
                      >
                        <BellRing className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>Alert Active</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenAlertModal(lvl)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/80 hover:border-amber-500/40 transition-all cursor-pointer"
                        title="Set a persistent price alert for this key level"
                      >
                        <Bell className="w-3 h-3 text-amber-400" />
                        <span>Set Alert</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Candlestick & Pattern Callouts with Quantitative Probability and Animated Hover Transitions */}
          {analysis.patterns.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Detected Chart Patterns ({analysis.patterns.length})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Avg. Probability:{' '}
                    {Math.round(
                      analysis.patterns.reduce((acc, p) => {
                        const score =
                          typeof p.probabilityScore === 'number'
                            ? p.probabilityScore
                            : p.confidence === 'High'
                            ? 88
                            : p.confidence === 'Moderate–High'
                            ? 80
                            : p.confidence === 'Moderate'
                            ? 68
                            : 52;
                        return acc + score;
                      }, 0) / analysis.patterns.length
                    )}
                    %
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    Hover to sync scanner
                  </span>
                </div>
              </div>

              {analysis.patterns.map((pat, pIdx) => {
                const isHovered =
                  hoveredPatternName?.toLowerCase().includes(pat.name.toLowerCase()) ||
                  pat.name.toLowerCase().includes(hoveredPatternName?.toLowerCase() || '');

                const probability =
                  typeof pat.probabilityScore === 'number'
                    ? pat.probabilityScore
                    : pat.confidence === 'High'
                    ? 88
                    : pat.confidence === 'Moderate–High'
                    ? 80
                    : pat.confidence === 'Moderate'
                    ? 68
                    : 52;

                const isHighEdge = probability >= 85;
                const isMediumEdge = probability >= 70 && probability < 85;
                const probTierLabel = isHighEdge
                  ? 'High Conviction'
                  : isMediumEdge
                  ? 'Strong Edge'
                  : 'Moderate Probability';

                const probBadgeClass = isHighEdge
                  ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40'
                  : isMediumEdge
                  ? 'text-teal-300 bg-teal-500/15 border-teal-500/40'
                  : 'text-amber-300 bg-amber-500/15 border-amber-500/40';

                const meterGradient = isHighEdge
                  ? 'from-emerald-500 via-teal-400 to-cyan-400'
                  : isMediumEdge
                  ? 'from-teal-500 via-cyan-400 to-blue-400'
                  : 'from-amber-500 via-yellow-400 to-orange-400';

                return (
                  <div
                    key={pIdx}
                    onMouseEnter={() => setHoveredPatternName(pat.name)}
                    onMouseLeave={() => setHoveredPatternName(null)}
                    className={`p-3.5 sm:p-4 rounded-xl border pattern-hover-transition duration-200 ease-out text-xs space-y-2.5 cursor-pointer transition-all ${
                      isHovered
                        ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_22px_rgba(52,211,153,0.3)] -translate-y-0.5 scale-[1.015]'
                        : 'bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/15 hover:border-emerald-400/60 hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Header: Title + Scanner Action */}
                    <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-emerald-300 text-sm flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                          <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isHovered ? 'animate-ping' : ''}`} />
                          {pat.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/90 border border-slate-800 text-slate-300">
                          {pat.type}
                        </span>
                      </div>

                      <a
                        href="#pattern-scanner-section"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHoveredPatternName(pat.name);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors shrink-0 ${
                          isHovered
                            ? 'bg-emerald-400 text-slate-950 shadow-sm'
                            : 'text-emerald-300 hover:text-white bg-emerald-950/60 border border-emerald-500/30'
                        }`}
                      >
                        {isHovered ? 'Focusing Scanner ↓' : 'View in Scanner ↓'}
                      </a>
                    </div>

                    {/* Quantitative Confidence Score & Probability Insight Panel */}
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-1.5 text-xs">
                        {/* Probability Score Pill */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-extrabold border flex items-center gap-1 shadow-sm ${probBadgeClass}`}>
                            <Percent className="w-3 h-3 shrink-0 text-current" />
                            <span>{probability}% Probability</span>
                          </span>
                          <span className="text-[11px] font-semibold text-slate-300">
                            {pat.confidence} Conf.
                          </span>
                        </div>

                        {/* Statistical Edge / Reliability Tag */}
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          <Target className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span>
                            {pat.historicalReliability ||
                              `~${Math.round(probability * 0.88)}% Historical Edge`}
                          </span>
                        </span>
                      </div>

                      {/* Probability Gauge Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 text-[10px]">
                            <Gauge className="w-2.5 h-2.5 text-slate-500" />
                            Statistical Setup Quality
                          </span>
                          <span className="font-mono text-slate-300 font-bold">
                            {probability}/100 • <span className="text-emerald-400">{probTierLabel}</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 p-[0.5px]">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${meterGradient} transition-all duration-500`}
                            style={{ width: `${probability}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pattern Description */}
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {pat.description}
                    </p>

                    {/* Breakout Trigger Footnote */}
                    {pat.breakoutTrigger && (
                      <div className="flex items-center justify-between pt-1.5 border-t border-emerald-500/20 text-[11px] flex-wrap gap-1">
                        <span className="text-emerald-400 font-mono">
                          Trigger: <strong className="text-white">{pat.breakoutTrigger}</strong>
                        </span>
                        {isHovered && (
                          <span className="text-[10px] text-emerald-300 font-semibold animate-pulse">
                            ⚡ Highlighting Scanner
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🔍 AUTOMATED TECHNICAL PATTERN SCANNER */}
      <div id="pattern-scanner-section">
        <PatternScanner
          analysis={analysis}
          onSetAlertForPattern={handleSetAlertForPattern}
          hoveredPatternName={hoveredPatternName}
          onHoverPattern={setHoveredPatternName}
        />
      </div>

      {/* ⚠️ RISK FACTORS & SAFETY SHIELD */}
      <div className="bg-[#121821] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
              Chart-Specific Technical Risk Evaluation
            </h3>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            analysis.riskAssessment.level === 'Low'
              ? 'bg-emerald-500/20 text-emerald-400'
              : analysis.riskAssessment.level === 'High' || analysis.riskAssessment.level === 'Very High'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            Risk Level: {analysis.riskAssessment.level}
          </span>
        </div>

        <p className="text-xs text-amber-200/90 font-medium">
          {analysis.riskAssessment.primaryWarning}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-300">
          {analysis.riskAssessment.factors.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">•</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Missing or Unclear Data Callout */}
      {analysis.missingOrUnclearData.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 space-y-1">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Missing or Unclear Chart Information:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
            {analysis.missingOrUnclearData.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback Widget (Prompt #31) */}
      <div className="bg-[#121821] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <h4 className="text-xs font-bold text-slate-200">Was this analysis useful?</h4>
          <p className="text-[11px] text-slate-500">
            Your feedback calibrates the evaluation benchmarks for future charts.
          </p>
        </div>

        {feedbackSubmitted ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Check className="w-4 h-4" />
            <span>Thank you! Feedback recorded.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFeedback('helpful')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Helpful</span>
            </button>
            <button
              type="button"
              onClick={() => handleFeedback('not_helpful', 'General inaccuracy')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Not Helpful</span>
            </button>
          </div>
        )}
      </div>

      {/* Persistent Price Alert Configuration Modal */}
      <SetAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        asset={analysis.asset}
        timeframe={analysis.timeframe}
        analysisId={analysis.id}
        initialKeyLevel={selectedKeyLevelForAlert}
        onAlertCreated={() => {
          // Trigger local state reload
          const allAlerts = getStoredAlerts();
          const currentAssetAlerts = allAlerts.filter(
            (a) => a.asset.toLowerCase().trim() === analysis.asset.toLowerCase().trim()
          );
          setActiveAlerts(currentAssetAlerts);
        }}
      />
    </div>
  );
};
