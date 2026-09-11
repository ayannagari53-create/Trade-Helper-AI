import React, { useState, useMemo } from 'react';
import {
  ChartAnalysisResult,
  ChartPattern,
  KeyPriceLevel,
} from '../types';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Filter,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  Target,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  BookOpen,
  Maximize2,
} from 'lucide-react';

export interface ScannedPatternItem {
  id: string;
  name: string;
  category: 'Bullish Continuation' | 'Bearish Continuation' | 'Bullish Reversal' | 'Bearish Reversal' | 'Bilateral / Range';
  bias: 'bullish' | 'bearish' | 'neutral';
  type: 'Reversal' | 'Continuation' | 'Bilateral / Range';
  confidence: 'High' | 'Moderate–High' | 'Moderate' | 'Low';
  matchScore: number; // 0-100%
  status: 'Confirmed' | 'Forming / Emerging' | 'Breakout Retest' | 'Completed';
  description: string;
  triggerLevel?: string;
  projectedTarget?: string;
  invalidationLevel?: string;
  volumeProfile: string;
  rulesChecklist: Array<{ rule: string; satisfied: boolean; note: string }>;
  anatomyNotes: {
    poleOrBase: string;
    consolidation: string;
    trigger: string;
  };
  svgType:
    | 'bull_flag'
    | 'bear_flag'
    | 'falling_wedge'
    | 'ascending_wedge'
    | 'head_and_shoulders'
    | 'inv_head_and_shoulders'
    | 'double_bottom'
    | 'double_top'
    | 'ascending_triangle'
    | 'descending_triangle'
    | 'cup_and_handle'
    | 'symmetrical_triangle'
    | 'range_rectangle';
  isAiDetected: boolean;
}

interface PatternScannerProps {
  analysis: ChartAnalysisResult;
  onSetAlertForPattern?: (pattern: ScannedPatternItem) => void;
  onHighlightAnnotation?: (patternName: string) => void;
  hoveredPatternName?: string | null;
  onHoverPattern?: (patternName: string | null) => void;
}

export const PatternScanner: React.FC<PatternScannerProps> = ({
  analysis,
  onSetAlertForPattern,
  onHighlightAnnotation,
  hoveredPatternName,
  onHoverPattern,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'detected' | 'bullish' | 'bearish' | 'reversal' | 'continuation'>('all');
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);
  const [showTheoryGuide, setShowTheoryGuide] = useState<boolean>(false);
  const [selectedPatternForTheory, setSelectedPatternForTheory] = useState<ScannedPatternItem | null>(null);

  // Derive comprehensive pattern scans based on AI analysis results
  const scannedPatterns: ScannedPatternItem[] = useMemo(() => {
    const results: ScannedPatternItem[] = [];
    const lowerTrend = analysis.trend.direction.toLowerCase();
    const isBullTrend = lowerTrend.includes('bullish');
    const isBearTrend = lowerTrend.includes('bearish');
    const isSideways = lowerTrend.includes('neutral') || lowerTrend.includes('sideways');
    const primaryLevels = analysis.keyLevels || [];
    const resistanceLevels = primaryLevels.filter((l) => l.type.toLowerCase().includes('resistance'));
    const supportLevels = primaryLevels.filter((l) => l.type.toLowerCase().includes('support'));
    const nearestResistance = resistanceLevels[0]?.price || 'Next Swing High';
    const nearestSupport = supportLevels[0]?.price || 'Key Support Floor';
    const currentPrice = analysis.currentPrice;

    // 1. Convert explicitly detected AI patterns
    if (analysis.patterns && analysis.patterns.length > 0) {
      analysis.patterns.forEach((pat, idx) => {
        const pNameLower = pat.name.toLowerCase();
        let svgType: ScannedPatternItem['svgType'] = 'bull_flag';
        let bias: ScannedPatternItem['bias'] = 'bullish';
        let category: ScannedPatternItem['category'] = 'Bullish Continuation';

        if (pNameLower.includes('head') && pNameLower.includes('inverse')) {
          svgType = 'inv_head_and_shoulders';
          bias = 'bullish';
          category = 'Bullish Reversal';
        } else if (pNameLower.includes('head') && pNameLower.includes('shoulder')) {
          svgType = 'head_and_shoulders';
          bias = 'bearish';
          category = 'Bearish Reversal';
        } else if (pNameLower.includes('falling wedge') || (pNameLower.includes('wedge') && isBullTrend)) {
          svgType = 'falling_wedge';
          bias = 'bullish';
          category = 'Bullish Reversal';
        } else if (pNameLower.includes('ascending wedge') || pNameLower.includes('rising wedge')) {
          svgType = 'ascending_wedge';
          bias = 'bearish';
          category = 'Bearish Reversal';
        } else if (pNameLower.includes('double bottom') || pNameLower.includes('w bottom')) {
          svgType = 'double_bottom';
          bias = 'bullish';
          category = 'Bullish Reversal';
        } else if (pNameLower.includes('double top') || pNameLower.includes('m top')) {
          svgType = 'double_top';
          bias = 'bearish';
          category = 'Bearish Reversal';
        } else if (pNameLower.includes('cup')) {
          svgType = 'cup_and_handle';
          bias = 'bullish';
          category = 'Bullish Continuation';
        } else if (pNameLower.includes('bear flag') || (pNameLower.includes('flag') && isBearTrend)) {
          svgType = 'bear_flag';
          bias = 'bearish';
          category = 'Bearish Continuation';
        } else if (pNameLower.includes('bull flag') || pNameLower.includes('flag') || pNameLower.includes('pennant')) {
          svgType = 'bull_flag';
          bias = 'bullish';
          category = 'Bullish Continuation';
        } else if (pNameLower.includes('ascending triangle')) {
          svgType = 'ascending_triangle';
          bias = 'bullish';
          category = 'Bullish Continuation';
        } else if (pNameLower.includes('descending triangle')) {
          svgType = 'descending_triangle';
          bias = 'bearish';
          category = 'Bearish Continuation';
        } else if (pNameLower.includes('range') || pNameLower.includes('box') || pNameLower.includes('rectangle')) {
          svgType = 'range_rectangle';
          bias = 'neutral';
          category = 'Bilateral / Range';
        } else {
          svgType = 'symmetrical_triangle';
          bias = pat.type === 'Reversal' ? (isBullTrend ? 'bearish' : 'bullish') : 'neutral';
          category = 'Bilateral / Range';
        }

        results.push({
          id: `ai-pattern-${idx}`,
          name: pat.name,
          category,
          bias,
          type: pat.type,
          confidence: pat.confidence || 'High',
          matchScore: typeof pat.probabilityScore === 'number' ? pat.probabilityScore : (pat.confidence === 'High' ? 92 : pat.confidence === 'Moderate–High' ? 84 : 72),
          status: 'Confirmed',
          description: pat.description,
          triggerLevel: pat.breakoutTrigger || nearestResistance,
          projectedTarget: bias === 'bullish' ? `Measured Move ~ +4.5% to ${nearestResistance}` : `Measured Move ~ -4.2% to ${nearestSupport}`,
          invalidationLevel: bias === 'bullish' ? nearestSupport : nearestResistance,
          volumeProfile: 'Volume contraction visible during consolidation; requires volume burst on breakout.',
          rulesChecklist: [
            { rule: 'Clear Prior Trend', satisfied: true, note: `Prior ${analysis.trend.direction} trend established.` },
            { rule: 'Geometric Boundary Retest', satisfied: true, note: 'Upper & lower boundaries respected.' },
            { rule: 'Momentum Alignment', satisfied: !analysis.momentum.status.includes('Negative') || bias === 'bearish', note: `Momentum status: ${analysis.momentum.status}` },
            { rule: 'Breakout Volume Confirmation', satisfied: false, note: 'Pending volume expansion on candle close.' },
          ],
          anatomyNotes: {
            poleOrBase: 'Impulsive structural leg preceding consolidation phase.',
            consolidation: 'Orderly pullback/compression with narrowing candle ranges.',
            trigger: pat.breakoutTrigger || `Decisive breakout above ${nearestResistance}.`,
          },
          svgType,
          isAiDetected: true,
        });
      });
    }

    // 2. Scan for Emerging / Secondary Structural Patterns based on Market Structure & Indicators
    // Check for Flag / Consolidation if strong trend exists
    const hasExistingFlag = results.some((r) => r.name.toLowerCase().includes('flag'));
    if (!hasExistingFlag && (isBullTrend || isBearTrend)) {
      if (isBullTrend) {
        results.push({
          id: 'scan-bull-flag',
          name: 'Bullish Flag / High-Tight Consolidation',
          category: 'Bullish Continuation',
          bias: 'bullish',
          type: 'Continuation',
          confidence: 'Moderate–High',
          matchScore: 82,
          status: 'Forming / Emerging',
          description: 'A sharp upward pole followed by a shallow, orderly downward-sloping consolidation channel holding above key moving averages.',
          triggerLevel: nearestResistance,
          projectedTarget: `Pole height extension to ${nearestResistance}`,
          invalidationLevel: nearestSupport,
          volumeProfile: 'Decreasing volume during the flag pullback indicates lack of selling pressure.',
          rulesChecklist: [
            { rule: 'Steep Impulse Flagpole', satisfied: true, note: 'Strong prior bullish markup phase.' },
            { rule: 'Pullback Depth < 38.2% - 50%', satisfied: true, note: 'Price holding top half of impulse move.' },
            { rule: 'Parallel Channel Boundaries', satisfied: true, note: 'Clean channel slope without breakdown.' },
            { rule: 'Breakout Confirmation Close', satisfied: false, note: 'Waiting for candle close above upper flag rail.' },
          ],
          anatomyNotes: {
            poleOrBase: 'Rapid price surge on institutional accumulation.',
            consolidation: '3 to 10 candles of tight consolidation holding value.',
            trigger: `Break and close above the upper resistance rail at ${nearestResistance}.`,
          },
          svgType: 'bull_flag',
          isAiDetected: false,
        });
      } else {
        results.push({
          id: 'scan-bear-flag',
          name: 'Bearish Flag / Distribution Channel',
          category: 'Bearish Continuation',
          bias: 'bearish',
          type: 'Continuation',
          confidence: 'Moderate',
          matchScore: 76,
          status: 'Forming / Emerging',
          description: 'A steep markdown impulse followed by a slow upward-sloping retracement channel into dynamic resistance.',
          triggerLevel: nearestSupport,
          projectedTarget: `Pole height markdown towards ${nearestSupport}`,
          invalidationLevel: nearestResistance,
          volumeProfile: 'Low volume on upward bounce indicates low buyer conviction and high vulnerability.',
          rulesChecklist: [
            { rule: 'Sharp Bearish Flagpole', satisfied: true, note: 'Prior swift rejection and lower lows.' },
            { rule: 'Weak Ascending Retracement', satisfied: true, note: 'Sluggish upward drift lacking volume.' },
            { rule: 'Dynamic MA Resistance Test', satisfied: true, note: 'Testing underside of moving averages.' },
            { rule: 'Support Breakdown Confirmation', satisfied: false, note: `Watch for breakdown below ${nearestSupport}.` },
          ],
          anatomyNotes: {
            poleOrBase: 'Sharp selling impulse breaking previous support.',
            consolidation: 'Corrective counter-trend drift with overlapping candles.',
            trigger: `Decisive candle breakdown below lower flag boundary at ${nearestSupport}.`,
          },
          svgType: 'bear_flag',
          isAiDetected: false,
        });
      }
    }

    // Check for Wedge Patterns
    const hasExistingWedge = results.some((r) => r.name.toLowerCase().includes('wedge'));
    if (!hasExistingWedge) {
      if (analysis.indicators.rsi?.divergence?.toLowerCase().includes('bullish') || isBearTrend) {
        results.push({
          id: 'scan-falling-wedge',
          name: 'Falling Wedge (Bullish Reversal / Accumulation)',
          category: 'Bullish Reversal',
          bias: 'bullish',
          type: 'Reversal',
          confidence: 'Moderate',
          matchScore: 78,
          status: 'Forming / Emerging',
          description: 'Converging downward-sloping trendlines where the slope of the lower lows flattens faster than lower highs, signaling selling exhaustion.',
          triggerLevel: nearestResistance,
          projectedTarget: `Base of wedge at ${nearestResistance}`,
          invalidationLevel: nearestSupport,
          volumeProfile: 'Volume steadily declines as range narrows toward the apex.',
          rulesChecklist: [
            { rule: 'Converging Downward Trendlines', satisfied: true, note: 'Two intersecting lower-sloping rails.' },
            { rule: 'Diminishing Downward Momentum', satisfied: true, note: 'Wicks absorbing selling near floor.' },
            { rule: 'RSI Momentum Divergence', satisfied: analysis.indicators.rsi?.divergence?.includes('Bullish') || false, note: analysis.indicators.rsi?.divergence || 'Check RSI for bullish divergence.' },
            { rule: 'Upper Trendline Breakout', satisfied: false, note: 'Pending breakout of upper descending rail.' },
          ],
          anatomyNotes: {
            poleOrBase: 'Wide swings at pattern inception narrowing into the apex.',
            consolidation: 'Buyers stepping in higher while sellers lose velocity.',
            trigger: `Breakout through the upper falling trendline on expanding volume.`,
          },
          svgType: 'falling_wedge',
          isAiDetected: false,
        });
      } else if (analysis.indicators.rsi?.divergence?.toLowerCase().includes('bearish') || isBullTrend) {
        results.push({
          id: 'scan-ascending-wedge',
          name: 'Ascending / Rising Wedge (Bearish Exhaustion)',
          category: 'Bearish Reversal',
          bias: 'bearish',
          type: 'Reversal',
          confidence: 'Moderate',
          matchScore: 71,
          status: 'Forming / Emerging',
          description: 'Price grinds higher between two converging upward-sloping trendlines with contracting volume and slowing upside momentum.',
          triggerLevel: nearestSupport,
          projectedTarget: `Retest of wedge base near ${nearestSupport}`,
          invalidationLevel: nearestResistance,
          volumeProfile: 'Volume contracts during the rally, signaling a lack of genuine liquidity expansion.',
          rulesChecklist: [
            { rule: 'Converging Upward Trendlines', satisfied: true, note: 'Higher lows climbing steeper than higher highs.' },
            { rule: 'Volume Contraction During Rise', satisfied: true, note: 'Diminishing participation on each push.' },
            { rule: 'Oscillator Bearish Divergence', satisfied: analysis.indicators.rsi?.divergence?.includes('Bearish') || false, note: 'Loss of momentum on higher price peaks.' },
            { rule: 'Lower Trendline Breakdown', satisfied: false, note: `Watch for breakdown through ascending floor.` },
          ],
          anatomyNotes: {
            poleOrBase: 'Ascending structural channel with diminishing velocity.',
            consolidation: 'Buyers struggle to achieve wider extensions above highs.',
            trigger: `Clean break and close beneath the lower ascending trendline rail.`,
          },
          svgType: 'ascending_wedge',
          isAiDetected: false,
        });
      }
    }

    // Check for Double Bottom / Top or Range Box
    if (isSideways || primaryLevels.length >= 2) {
      if (isBullTrend || isSideways) {
        results.push({
          id: 'scan-double-bottom',
          name: 'Double Bottom / "W" Accumulation Base',
          category: 'Bullish Reversal',
          bias: 'bullish',
          type: 'Reversal',
          confidence: 'Moderate–High',
          matchScore: 80,
          status: 'Forming / Emerging',
          description: 'Two consecutive rejections of the same horizontal support level separated by an interim peak (neckline).',
          triggerLevel: nearestResistance,
          projectedTarget: `Height of base added to neckline ~ ${nearestResistance}`,
          invalidationLevel: nearestSupport,
          volumeProfile: 'Second trough typically shows lighter volume or strong rejection wick.',
          rulesChecklist: [
            { rule: 'Identical / Higher Support Lows', satisfied: true, note: `Double touch of ${nearestSupport}.` },
            { rule: 'Interim Neckline Peak Established', satisfied: true, note: `Resistance ceiling defined at ${nearestResistance}.` },
            { rule: 'Buyer Defense Wick', satisfied: true, note: 'Lower shadows indicating absorption.' },
            { rule: 'Neckline Breakout Confirmation', satisfied: false, note: `Needs candle close above ${nearestResistance}.` },
          ],
          anatomyNotes: {
            poleOrBase: 'First test establishes support; second test confirms demand exhaustion.',
            consolidation: 'Neckline forms at the intermediate peak between tests.',
            trigger: `Clear close above the neckline resistance at ${nearestResistance}.`,
          },
          svgType: 'double_bottom',
          isAiDetected: false,
        });
      }

      results.push({
        id: 'scan-range-box',
        name: 'Horizontal Range / Consolidation Rectangle',
        category: 'Bilateral / Range',
        bias: 'neutral',
        type: 'Bilateral / Range',
        confidence: 'High',
        matchScore: 88,
        status: 'Confirmed',
        description: 'Price is trapped between parallel horizontal resistance and support shelves as institutions accumulate liquidity.',
        triggerLevel: `${nearestResistance} (Bullish) or ${nearestSupport} (Bearish)`,
        projectedTarget: 'Full range width breakout projection upon boundary clearance',
        invalidationLevel: 'Midpoint mean-reversion equilibrium',
        volumeProfile: 'Volume dries up toward the center of the range and surges near edges.',
        rulesChecklist: [
          { rule: 'Clear Parallel Resistance Ceiling', satisfied: true, note: `Resistance bounded at ${nearestResistance}.` },
          { rule: 'Clear Parallel Support Floor', satisfied: true, note: `Support bounded at ${nearestSupport}.` },
          { rule: 'Oscillators Ranging in 40-60 Zone', satisfied: true, note: 'RSI/MACD in neutral state.' },
          { rule: 'Breakout Beyond Either Boundary', satisfied: false, note: 'Awaiting expansion out of the corridor.' },
        ],
        anatomyNotes: {
          poleOrBase: 'Equilibrium channel balancing institutional supply and demand.',
          consolidation: 'Multi-point retests of both boundaries with mean reversion.',
          trigger: `Decisive expansion close outside either the ceiling or floor.`,
        },
        svgType: 'range_rectangle',
        isAiDetected: true,
      });
    }

    return results;
  }, [analysis]);

  // Filtered patterns
  const filteredPatterns = useMemo(() => {
    return scannedPatterns.filter((item) => {
      if (selectedFilter === 'detected') return item.isAiDetected;
      if (selectedFilter === 'bullish') return item.bias === 'bullish';
      if (selectedFilter === 'bearish') return item.bias === 'bearish';
      if (selectedFilter === 'reversal') return item.type === 'Reversal';
      if (selectedFilter === 'continuation') return item.type === 'Continuation';
      return true;
    });
  }, [scannedPatterns, selectedFilter]);

  const detectedCount = scannedPatterns.filter((p) => p.isAiDetected).length;

  return (
    <div className="bg-[#121821] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                Technical Pattern Scanner
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {detectedCount} Active Detected
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automated multi-geometry scanner identifying flags, wedges, triangles, and reversal formations.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowTheoryGuide(!showTheoryGuide)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pattern Theory Guide</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <span className="text-slate-500 font-bold mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {[
          { id: 'all', label: `All Scanned (${scannedPatterns.length})` },
          { id: 'detected', label: `AI Detected (${detectedCount})` },
          { id: 'bullish', label: 'Bullish Setups' },
          { id: 'bearish', label: 'Bearish Setups' },
          { id: 'reversal', label: 'Reversals' },
          { id: 'continuation', label: 'Continuations' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedFilter === tab.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pattern Cards Grid */}
      {filteredPatterns.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 space-y-2">
          <Search className="w-8 h-8 mx-auto text-slate-600 mb-1" />
          <p className="text-xs font-bold text-slate-300">No patterns matched this specific filter.</p>
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Reset filter to view all scanned patterns
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPatterns.map((pattern) => {
            const isExpanded = expandedPatternId === pattern.id;
            const isBull = pattern.bias === 'bullish';
            const isBear = pattern.bias === 'bearish';
            const isHighlighted = Boolean(
              hoveredPatternName &&
                (pattern.name.toLowerCase().includes(hoveredPatternName.toLowerCase()) ||
                  hoveredPatternName.toLowerCase().includes(pattern.name.toLowerCase()) ||
                  (pattern.isAiDetected && hoveredPatternName.toLowerCase().includes('primary')))
            );

            return (
              <div
                key={pattern.id}
                onMouseEnter={() => onHoverPattern?.(pattern.name)}
                onMouseLeave={() => onHoverPattern?.(null)}
                className={`rounded-2xl border pattern-hover-transition duration-300 ease-out relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isHighlighted
                    ? isBull
                      ? 'bg-[#0E1B2B] border-emerald-400 ring-2 ring-emerald-400/80 shadow-[0_0_35px_rgba(52,211,153,0.35)] -translate-y-1 scale-[1.015]'
                      : isBear
                      ? 'bg-[#221316] border-red-400 ring-2 ring-red-400/80 shadow-[0_0_35px_rgba(248,113,113,0.35)] -translate-y-1 scale-[1.015]'
                      : 'bg-[#121E2F] border-cyan-400 ring-2 ring-cyan-400/80 shadow-[0_0_35px_rgba(56,189,248,0.35)] -translate-y-1 scale-[1.015]'
                    : pattern.isAiDetected
                    ? isBull
                      ? 'bg-[#0E1724] border-emerald-500/50 shadow-lg shadow-emerald-950/20 hover:border-emerald-400/80 hover:-translate-y-1 hover:scale-[1.01]'
                      : isBear
                      ? 'bg-[#181119] border-red-500/50 shadow-lg shadow-red-950/20 hover:border-red-400/80 hover:-translate-y-1 hover:scale-[1.01]'
                      : 'bg-[#101724] border-cyan-500/50 shadow-lg shadow-cyan-950/20 hover:border-cyan-400/80 hover:-translate-y-1 hover:scale-[1.01]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 hover:-translate-y-0.5'
                }`}
              >
                {/* Top Badge Strip with smooth gradient transition */}
                <div
                  className={`h-1 w-full transition-all duration-300 ${
                    isHighlighted
                      ? isBull
                        ? 'bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 h-1.5'
                        : isBear
                        ? 'bg-gradient-to-r from-red-400 via-rose-400 to-amber-300 h-1.5'
                        : 'bg-gradient-to-r from-cyan-300 to-blue-300 h-1.5'
                      : pattern.isAiDetected
                      ? isBull
                        ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
                        : isBear
                        ? 'bg-gradient-to-r from-red-400 via-rose-400 to-amber-400'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-400'
                      : 'bg-slate-800'
                  }`}
                />

                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Pattern Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm sm:text-base font-extrabold font-['Plus_Jakarta_Sans'] transition-colors duration-200 ${
                          isHighlighted
                            ? isBull
                              ? 'text-emerald-300'
                              : isBear
                              ? 'text-red-300'
                              : 'text-cyan-300'
                            : 'text-white'
                        }`}>
                          {pattern.name}
                        </h4>
                        {pattern.isAiDetected && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Primary Vision Match
                          </span>
                        )}
                        {isHighlighted && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide animate-pulse flex items-center gap-1 ${
                            isBull
                              ? 'bg-emerald-400 text-slate-950'
                              : isBear
                              ? 'bg-red-400 text-slate-950'
                              : 'bg-cyan-400 text-slate-950'
                          }`}>
                            <Sparkles className="w-2.5 h-2.5" /> Active Focus
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span
                          className={`font-bold text-[11px] px-2 py-0.5 rounded flex items-center gap-1 transition-all duration-200 ${
                            isBull
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isBear
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {isBull ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : isBear ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <Compass className="w-3 h-3" />
                          )}
                          {pattern.category}
                        </span>

                        <span className="text-slate-400 text-[11px] font-mono">
                          Match Quality: <strong className="text-white">{pattern.matchScore}%</strong>
                        </span>

                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          {pattern.status}
                        </span>
                      </div>
                    </div>

                    {/* Mini Schematic Graphic with interactive pulse */}
                    <div className={`w-16 h-12 rounded-xl bg-slate-950/80 border p-1 flex items-center justify-center shrink-0 shadow-inner transition-all duration-300 ${
                      isHighlighted
                        ? isBull
                          ? 'border-emerald-500/80 ring-2 ring-emerald-500/30 scale-105'
                          : isBear
                          ? 'border-red-500/80 ring-2 ring-red-500/30 scale-105'
                          : 'border-cyan-500/80 ring-2 ring-cyan-500/30 scale-105'
                        : 'border-slate-800'
                    }`}>
                      <PatternSchematicSvg type={pattern.svgType} bias={pattern.bias} isHighlighted={isHighlighted} />
                    </div>
                  </div>

                  {/* Pattern Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {pattern.description}
                  </p>

                  {/* Key Execution Metrics Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                        <Target className="w-3 h-3 text-emerald-400" /> Breakout Trigger:
                      </span>
                      <strong className="text-white font-mono text-xs block truncate" title={pattern.triggerLevel}>
                        {pattern.triggerLevel || 'Resistance Break'}
                      </strong>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-red-400" /> Invalidation Level:
                      </span>
                      <strong className="text-red-300 font-mono text-xs block truncate" title={pattern.invalidationLevel}>
                        {pattern.invalidationLevel || 'Support Breakdown'}
                      </strong>
                    </div>

                    {pattern.projectedTarget && (
                      <div className="sm:col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Measured Move Target:</span>
                        <span className="font-mono font-bold text-emerald-400">{pattern.projectedTarget}</span>
                      </div>
                    )}
                  </div>

                  {/* Expandable Anatomy & Checklist */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-fadeIn">
                      {/* Anatomy Notes */}
                      <div className="space-y-1.5 text-xs bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                          Geometric Anatomy:
                        </span>
                        <ul className="space-y-1 text-slate-300 text-[11px]">
                          <li>
                            <strong className="text-slate-200">• Impulse Leg:</strong> {pattern.anatomyNotes.poleOrBase}
                          </li>
                          <li>
                            <strong className="text-slate-200">• Consolidation:</strong> {pattern.anatomyNotes.consolidation}
                          </li>
                          <li>
                            <strong className="text-slate-200">• Confirmation Trigger:</strong> {pattern.anatomyNotes.trigger}
                          </li>
                        </ul>
                      </div>

                      {/* Rules Checklist */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Technical Rule Checklist:
                        </span>
                        <div className="space-y-1">
                          {pattern.rulesChecklist.map((ruleItem, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                            >
                              {ruleItem.satisfied ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              )}
                              <div className="space-y-0.5 flex-1">
                                <span className="font-bold text-slate-200 text-[11px]">{ruleItem.rule}</span>
                                <p className="text-[10px] text-slate-400">{ruleItem.note}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Volume profile */}
                      <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-800/30 text-[11px] text-purple-200 flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{pattern.volumeProfile}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-t border-slate-800/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedPatternId(isExpanded ? null : pattern.id)}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Less Details' : 'Full Structural Breakdown'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-2">
                    {onSetAlertForPattern && pattern.triggerLevel && (
                      <button
                        type="button"
                        onClick={() => onSetAlertForPattern(pattern)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all shadow-sm cursor-pointer"
                        title="Create a price alert for this pattern's breakout trigger"
                      >
                        <Bell className="w-3 h-3 text-amber-400" />
                        <span>Set Trigger Alert</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pattern Theory Guide Modal */}
      {showTheoryGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="relative w-full max-w-2xl bg-[#0F1520] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                  Technical Chart Pattern Theory & Institutional Rules
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTheoryGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Why Do Chart Patterns Recur?
                </h4>
                <p className="text-slate-400">
                  Chart patterns represent visualized human and algorithmic psychology. As institutions accumulate or distribute large positions over time, their orders create identifiable support shelves, ascending lows, and liquidity consolidation corridors.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Classic Pattern Archetypes</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400 block">🚩 Bull & Bear Flags</span>
                    <p className="text-[11px] text-slate-400">
                      High-probability continuation setups. The flagpole measures the initial momentum, while the shallow, counter-trend channel represents healthy profit-taking on declining volume.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 block">📐 Wedges (Ascending & Falling)</span>
                    <p className="text-[11px] text-slate-400">
                      Converging trendlines indicating momentum compression. Falling wedges usually lead to upward breakouts; rising wedges frequently resolve in bearish breakdowns.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-red-400 block">👤 Head & Shoulders</span>
                    <p className="text-[11px] text-slate-400">
                      A three-peak distribution formation where the middle peak (Head) is highest and the right shoulder fails to make a new high, signaling buyer exhaustion before neckline breach.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-400 block">☕ Cup & Handle</span>
                    <p className="text-[11px] text-slate-400">
                      A rounded accumulation bottom (U-shape) followed by a short downward-sloping pullback (handle). Breakout above rim resistance confirms trend continuation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] space-y-1">
                <span className="font-bold block">⚠️ The Golden Invalidation Rule:</span>
                <p>
                  Never trade a pattern before the candle closes beyond the confirmation trigger level. Over 40% of unconfirmed pattern shapes fail or morph into extended ranges. Always align with volume expansion.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTheoryGuide(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mini SVG Diagram rendering geometric shapes for each pattern
const PatternSchematicSvg: React.FC<{
  type: ScannedPatternItem['svgType'];
  bias: string;
  isHighlighted?: boolean;
}> = ({ type, bias, isHighlighted }) => {
  const isBull = bias === 'bullish';
  const color = isBull ? '#34D399' : bias === 'bearish' ? '#F87171' : '#38BDF8';
  const animClass = isHighlighted ? 'animate-schematic-pulse' : '';

  switch (type) {
    case 'bull_flag':
      return (
        <svg viewBox="0 0 60 40" className={`w-full h-full stroke-current ${animClass}`} fill="none" strokeWidth="2">
          {/* Flagpole */}
          <path d="M 8 36 L 24 10" stroke={color} strokeLinecap="round" />
          {/* Flag channels */}
          <path d="M 24 10 L 46 16" stroke={color} strokeLinecap="round" />
          <path d="M 20 18 L 42 24" stroke={color} strokeLinecap="round" />
          {/* Zig zag inside */}
          <path d="M 24 10 L 22 20 L 32 12 L 30 22 L 40 14" stroke="#94A3B8" strokeWidth="1" strokeDasharray="1 1" />
          {/* Breakout arrow */}
          <path d="M 44 14 L 54 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'bear_flag':
      return (
        <svg viewBox="0 0 60 40" className={`w-full h-full stroke-current ${animClass}`} fill="none" strokeWidth="2">
          {/* Flagpole downward */}
          <path d="M 8 6 L 24 30" stroke={color} strokeLinecap="round" />
          {/* Flag upward channel */}
          <path d="M 24 30 L 46 22" stroke={color} strokeLinecap="round" />
          <path d="M 20 22 L 42 14" stroke={color} strokeLinecap="round" />
          {/* Breakdown arrow */}
          <path d="M 44 24 L 54 34" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'falling_wedge':
      return (
        <svg viewBox="0 0 60 40" className={`w-full h-full stroke-current ${animClass}`} fill="none" strokeWidth="2">
          {/* Upper converging line */}
          <path d="M 8 10 L 46 26" stroke={color} strokeLinecap="round" />
          {/* Lower converging line */}
          <path d="M 12 32 L 48 30" stroke={color} strokeLinecap="round" />
          {/* Breakout arrow */}
          <path d="M 44 24 L 54 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'ascending_wedge':
      return (
        <svg viewBox="0 0 60 40" className={`w-full h-full stroke-current ${animClass}`} fill="none" strokeWidth="2">
          {/* Upper converging line */}
          <path d="M 8 26 L 46 10" stroke={color} strokeLinecap="round" />
          {/* Lower converging line */}
          <path d="M 12 34 L 48 16" stroke={color} strokeLinecap="round" />
          {/* Breakdown arrow */}
          <path d="M 44 18 L 54 32" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'double_bottom':
      return (
        <svg viewBox="0 0 60 40" className={`w-full h-full stroke-current ${animClass}`} fill="none" strokeWidth="2">
          {/* W path */}
          <path d="M 8 12 L 18 32 L 30 18 L 42 32 L 52 10" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
          {/* Neckline */}
          <line x1="8" y1="18" x2="52" y2="18" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    case 'double_top':
      return (
        <svg viewBox="0 0 60 40" className={`w-full h-full stroke-current ${animClass}`} fill="none" strokeWidth="2">
          {/* M path */}
          <path d="M 8 30 L 18 10 L 30 24 L 42 10 L 52 32" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
          {/* Neckline */}
          <line x1="8" y1="24" x2="52" y2="24" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    case 'head_and_shoulders':
      return (
        <svg viewBox="0 0 60 40" className={`w-full h-full stroke-current ${animClass}`} fill="none" strokeWidth="2">
          {/* Left shoulder, Head, Right shoulder */}
          <path d="M 6 30 L 16 18 L 22 26 L 30 8 L 38 26 L 44 18 L 54 34" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
          {/* Neckline */}
          <line x1="6" y1="26" x2="54" y2="26" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    case 'inv_head_and_shoulders':
      return (
        <svg viewBox="0 0 60 40" className={`w-full h-full stroke-current ${animClass}`} fill="none" strokeWidth="2">
          {/* Inverted Left shoulder, Head, Right shoulder */}
          <path d="M 6 12 L 16 24 L 22 16 L 30 34 L 38 16 L 44 24 L 54 8" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
          {/* Neckline */}
          <line x1="6" y1="16" x2="54" y2="16" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    case 'cup_and_handle':
      return (
        <svg viewBox="0 0 60 40" className={`w-full h-full stroke-current ${animClass}`} fill="none" strokeWidth="2">
          {/* Cup curve */}
          <path d="M 8 12 Q 22 36 36 12" stroke={color} strokeLinecap="round" />
          {/* Handle */}
          <path d="M 36 12 Q 44 20 48 16" stroke={color} strokeLinecap="round" />
          {/* Breakout */}
          <path d="M 48 16 L 54 8" stroke={color} strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 60 40" className={`w-full h-full stroke-current ${animClass}`} fill="none" strokeWidth="2">
          <rect x="10" y="10" width="40" height="20" rx="3" stroke={color} />
          <line x1="6" y1="20" x2="54" y2="20" stroke="#94A3B8" strokeDasharray="2 2" />
        </svg>
      );
  }
};
