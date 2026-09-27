export type TrendDirection =
  | 'Strong Bullish'
  | 'Bullish'
  | 'Neutral / Sideways'
  | 'Bearish'
  | 'Strong Bearish';

export type MomentumStatus =
  | 'Strong Positive'
  | 'Positive'
  | 'Neutral'
  | 'Negative'
  | 'Strong Negative'
  | 'Insufficient Visible Data';

export type VolatilityLevel =
  | 'Low'
  | 'Moderate'
  | 'Moderate–High'
  | 'High'
  | 'Extreme';

export type RiskRating = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface KeyPriceLevel {
  id: string;
  type: 'Major Resistance' | 'Minor Resistance' | 'Current Pivot' | 'Minor Support' | 'Major Support';
  price: string;
  significance: string;
  confidence: number; // 0-100
}

export interface CandlestickFormation {
  name: string;
  type: 'Bullish' | 'Bearish' | 'Indecision' | 'Reversal' | 'Continuation';
  location: string;
  description: string;
  reliability: 'High' | 'Moderate' | 'Low';
}

export interface ChartPattern {
  name: string;
  type: 'Reversal' | 'Continuation' | 'Bilateral / Range';
  confidence: 'High' | 'Moderate–High' | 'Moderate' | 'Low';
  probabilityScore?: number; // 0-100 quantitative confidence / probability percentage
  historicalReliability?: string; // Empirical follow-through or historical backtest win rate
  description: string;
  breakoutTrigger?: string;
}

export interface ScenarioDetail {
  title: string;
  type: 'bullish' | 'neutral' | 'bearish';
  condition: string;
  implication: string;
  confirmation: string;
  invalidation: string;
  estimatedTargetOrRange?: string;
  riskNote?: string;
}

export interface IndicatorAnalysis {
  rsi?: {
    value?: string | number;
    status: 'Overbought (>70)' | 'Elevated (60-70)' | 'Neutral (40-60)' | 'Depressed (30-40)' | 'Oversold (<30)' | 'Not Visible';
    divergence?: string;
    interpretation: string;
  };
  macd?: {
    signal: 'Bullish Crossover' | 'Bearish Crossover' | 'Positive Momentum' | 'Negative Momentum' | 'Converging' | 'Not Visible';
    histogram: string;
    interpretation: string;
  };
  movingAverages?: {
    description: string;
    priceVsMA: 'Above Visible MAs' | 'Below Visible MAs' | 'Intertwined / Ranging' | 'Testing Dynamic Support' | 'Testing Dynamic Resistance' | 'Not Visible';
    slope: 'Positive / Upward' | 'Flat' | 'Negative / Downward' | 'Not Visible';
    interpretation: string;
  };
  volume?: {
    status: 'High / Surge' | 'Moderate' | 'Low / Declining' | 'Climactic Spike' | 'Not Visible';
    trendCorrelation: string;
    interpretation: string;
  };
  vwapOrBollinger?: {
    description: string;
    interpretation: string;
  };
}

export interface MarketStructureInfo {
  higherHighs: boolean;
  higherLows: boolean;
  lowerHighs: boolean;
  lowerLows: boolean;
  structure: 'Bullish Market Structure' | 'Bearish Market Structure' | 'Consolidation / Range-bound' | 'Transitioning / Breakout in Progress';
  phase: 'Accumulation' | 'Markup' | 'Distribution' | 'Markdown' | 'Range-Bound' | 'Breakout Retest';
  strength: 'Strong' | 'Moderate' | 'Weak';
}

export interface ChartAnnotationOverlay {
  type: 'horizontal_line' | 'trendline' | 'zone' | 'label';
  label: string;
  color: string; // e.g. '#00C853', '#FF5252', '#FFB300', '#38BDF8'
  yPercentage?: number; // 0 - 100 from top of image
  x1?: number; // 0 - 100
  y1?: number; // 0 - 100
  x2?: number; // 0 - 100
  y2?: number; // 0 - 100
  notes?: string;
}

export interface ChartAnalysisResult {
  id: string;
  timestamp: number;
  imageUrl: string;
  imageThumbnail?: string;
  asset: string;
  timeframe: string;
  chartType: string;
  currencyOrUnit: string;
  currentPrice: string;
  
  // High-level Metrics
  trend: {
    direction: TrendDirection;
    assessmentScore: number; // 0 - 100 AI assessment score
    summary: string;
  };
  marketStructure: MarketStructureInfo;
  momentum: {
    status: MomentumStatus;
    points: string[];
  };
  volatility: {
    level: VolatilityLevel;
    description: string;
  };
  aiConfidence: {
    score: number; // 0 - 100
    category: 'High' | 'Moderate–High' | 'Moderate' | 'Low';
    reason: string;
  };
  riskAssessment: {
    level: RiskRating;
    factors: string[];
    primaryWarning: string;
  };

  // Technical Details
  keyLevels: KeyPriceLevel[];
  candlesticks: CandlestickFormation[];
  patterns: ChartPattern[];
  indicators: IndicatorAnalysis;

  // Scenarios
  scenarios: {
    bullish: ScenarioDetail;
    neutral: ScenarioDetail;
    bearish: ScenarioDetail;
  };

  // Explainable AI
  explainableReasoning: Array<{
    step: number;
    title: string;
    explanation: string;
  }>;

  // Educational Explanations
  beginnerSummary: string;
  advancedSummary: string;

  // Missing data flag
  missingOrUnclearData: string[];

  // Visual Annotations
  annotations: ChartAnnotationOverlay[];

  // User meta
  notes?: string;
  userTags?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface MultiTimeframeAnalysisItem {
  timeframe: string;
  trend: TrendDirection;
  momentum: MomentumStatus;
  keyObservation: string;
  imageUrl?: string;
}

export interface MultiTimeframeSynthesisResult {
  id: string;
  timestamp: number;
  overallConfluenceScore: number; // 0-100
  overallBias: TrendDirection;
  higherTimeframeContext: string;
  lowerTimeframeExecution: string;
  timeframeBreakdowns: MultiTimeframeAnalysisItem[];
  synthesisConclusion: string;
  keyConfluences: string[];
  conflictingSignals: string[];
  recommendedStrategy: string;
}

export interface AnalysisComparisonResult {
  id: string;
  timestamp: number;
  previousAnalysisId: string;
  asset: string;
  trendShift: {
    from: TrendDirection;
    to: TrendDirection;
    comment: string;
  };
  momentumShift: {
    from: MomentumStatus;
    to: MomentumStatus;
    comment: string;
  };
  levelChanges: string[];
  newObservations: string[];
  keyTakeaway: string;
}

export type PatternConfidence = 'High' | 'Moderate–High' | 'Moderate' | 'Low';

export type AlertTriggerCondition =
  | 'Price Crosses Above'
  | 'Price Crosses Below'
  | 'Price Touches Zone'
  | 'Breakout Confirmation'
  | 'Support Retest / Bounce'
  | 'Resistance Rejection';

export type AlertStatus = 'Active' | 'Triggered' | 'Disabled';

export interface PriceAlert {
  id: string;
  analysisId?: string;
  asset: string;
  timeframe: string;
  keyLevelId?: string;
  levelType: 'Major Resistance' | 'Minor Resistance' | 'Current Pivot' | 'Minor Support' | 'Major Support' | 'Custom Level' | string;
  targetPrice: string;
  numericPrice?: number;
  condition: AlertTriggerCondition;
  notes?: string;
  soundNotification?: boolean;
  createdAt: number;
  status: AlertStatus;
  triggeredAt?: number;
  simulatedPrice?: string;
}

export interface WatchlistItem {
  id: string;
  asset: string;
  timeframe: string;
  lastBias?: TrendDirection;
  trendBias: TrendDirection;
  confidence?: number;
  lastPrice?: string;
  keyLevels?: string[];
  lastUpdated?: number;
  lastAnalyzed: number;
  notes: string;
  analysisId?: string;
  chartImage?: string;
}

export interface DemoChartItem {
  id: string;
  name: string;
  asset: string;
  timeframe: string;
  bias: TrendDirection;
  pattern: string;
  description: string;
  svgDataUrl: string;
  precomputedAnalysis: ChartAnalysisResult;
}
