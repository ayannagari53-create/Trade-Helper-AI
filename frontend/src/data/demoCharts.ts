import { DemoChartItem, ChartAnalysisResult } from '../types';

function createSvgChart(
  title: string,
  timeframe: string,
  pricePoints: Array<{ o: number; h: number; l: number; c: number; v: number }>,
  currency: string = '₹',
  indicators: { ema20?: boolean; ema50?: boolean; rsi?: boolean } = { ema20: true, ema50: true, rsi: true }
): string {
  const width = 880;
  const height = 480;
  const mainHeight = 340;
  const subHeight = 90;
  const paddingLeft = 60;
  const paddingRight = 75;
  const paddingTop = 50;

  const minPrice = Math.min(...pricePoints.map(p => p.l)) * 0.995;
  const maxPrice = Math.max(...pricePoints.map(p => p.h)) * 1.005;
  const priceRange = maxPrice - minPrice;

  const candleWidth = (width - paddingLeft - paddingRight) / pricePoints.length;

  const getY = (price: number) => {
    return paddingTop + (1 - (price - minPrice) / priceRange) * (mainHeight - paddingTop);
  };

  const candlesSvg = pricePoints
    .map((p, i) => {
      const x = paddingLeft + i * candleWidth + candleWidth * 0.15;
      const w = candleWidth * 0.7;
      const isGreen = p.c >= p.o;
      const color = isGreen ? '#00C853' : '#FF5252';
      const wickX = x + w / 2;
      const yHigh = getY(p.h);
      const yLow = getY(p.l);
      const yOpen = getY(p.o);
      const yClose = getY(p.c);
      const bodyY = Math.min(yOpen, yClose);
      const bodyH = Math.max(Math.abs(yOpen - yClose), 2);

      // Volume bar
      const maxVol = Math.max(...pricePoints.map(pt => pt.v));
      const volH = (p.v / maxVol) * 45;
      const volY = mainHeight - volH;

      return `
        <!-- Wick -->
        <line x1="${wickX}" y1="${yHigh}" x2="${wickX}" y2="${yLow}" stroke="${color}" stroke-width="1.5" />
        <!-- Body -->
        <rect x="${x}" y="${bodyY}" width="${w}" height="${bodyH}" rx="1" fill="${color}" stroke="${color}" stroke-width="0.5" />
        <!-- Volume -->
        <rect x="${x}" y="${volY}" width="${w}" height="${volH}" fill="${color}" opacity="0.35" />
      `;
    })
    .join('');

  // Grid lines & price labels
  const priceSteps = 6;
  let gridSvg = '';
  for (let i = 0; i <= priceSteps; i++) {
    const p = minPrice + (i / priceSteps) * priceRange;
    const y = getY(p);
    gridSvg += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="#1E293B" stroke-dasharray="3 3" />
      <text x="${width - paddingRight + 8}" y="${y + 4}" fill="#94A3B8" font-size="11" font-family="monospace">${currency}${p.toFixed(
      p > 1000 ? 0 : 2
    )}</text>
    `;
  }

  // EMA lines calculation
  let ema20Path = '';
  let ema50Path = '';
  pricePoints.forEach((p, i) => {
    const x = paddingLeft + i * candleWidth + candleWidth / 2;
    // approximate smoothed values
    const ema20Val = p.c * 0.998 - Math.sin(i / 3) * (priceRange * 0.05);
    const ema50Val = p.c * 0.992 - Math.cos(i / 4) * (priceRange * 0.08);
    const y20 = getY(ema20Val);
    const y50 = getY(ema50Val);
    if (i === 0) {
      ema20Path += `M ${x} ${y20}`;
      ema50Path += `M ${x} ${y50}`;
    } else {
      ema20Path += ` L ${x} ${y20}`;
      ema50Path += ` L ${x} ${y50}`;
    }
  });

  const lastPrice = pricePoints[pricePoints.length - 1].c;
  const lastY = getY(lastPrice);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #0B0F14; font-family: 'JetBrains Mono', sans-serif;">
      <!-- Header -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="#0B0F14" />
      <rect x="${paddingLeft}" y="${paddingTop}" width="${width - paddingLeft - paddingRight}" height="${mainHeight - paddingTop}" fill="#0E1520" stroke="#1E293B" />
      
      <!-- Chart Meta Info Header -->
      <text x="${paddingLeft}" y="30" fill="#F8FAFC" font-size="16" font-weight="bold">${title}</text>
      <text x="${paddingLeft + 160}" y="30" fill="#38BDF8" font-size="12" font-weight="600" letter-spacing="1">${timeframe}</text>
      <text x="${paddingLeft + 210}" y="30" fill="#10B981" font-size="12">● LIVE FEED</text>
      <text x="${width - paddingRight}" y="30" text-anchor="end" fill="#F8FAFC" font-size="15" font-weight="bold">${currency}${lastPrice.toFixed(
    lastPrice > 1000 ? 2 : 4
  )}</text>
      <text x="${width - paddingRight + 8}" y="30" fill="#00C853" font-size="12">+1.42%</text>

      <!-- Grids -->
      ${gridSvg}

      <!-- Candles & Volume -->
      ${candlesSvg}

      <!-- EMAs -->
      ${indicators.ema20 ? `<path d="${ema20Path}" fill="none" stroke="#38BDF8" stroke-width="1.8" />` : ''}
      ${indicators.ema50 ? `<path d="${ema50Path}" fill="none" stroke="#F59E0B" stroke-width="1.8" />` : ''}

      <!-- Current Price Cursor Tag -->
      <line x1="${paddingLeft}" y1="${lastY}" x2="${width - paddingRight}" y2="${lastY}" stroke="#00C853" stroke-width="1" stroke-dasharray="2 2" />
      <rect x="${width - paddingRight}" y="${lastY - 10}" width="${paddingRight - 5}" height="20" fill="#00C853" rx="3" />
      <text x="${width - paddingRight + 4}" y="${lastY + 4}" fill="#000" font-size="11" font-weight="bold">${currency}${lastPrice.toFixed(0)}</text>

      <!-- Sub Indicator Panel (RSI) -->
      <rect x="${paddingLeft}" y="${mainHeight + 15}" width="${width - paddingLeft - paddingRight}" height="${subHeight - 20}" fill="#0E1520" stroke="#1E293B" />
      <text x="${paddingLeft + 10}" y="${mainHeight + 32}" fill="#94A3B8" font-size="10">RSI (14): <tspan fill="#38BDF8" font-weight="bold">64.8</tspan></text>
      <!-- RSI Level 70 & 30 Lines -->
      <line x1="${paddingLeft}" y1="${mainHeight + 35}" x2="${width - paddingRight}" y2="${mainHeight + 35}" stroke="#EF4444" stroke-dasharray="2 2" stroke-width="0.8" opacity="0.6" />
      <line x1="${paddingLeft}" y1="${mainHeight + 65}" x2="${width - paddingRight}" y2="${mainHeight + 65}" stroke="#10B981" stroke-dasharray="2 2" stroke-width="0.8" opacity="0.6" />
      <path d="M ${paddingLeft + 20} ${mainHeight + 58} Q ${paddingLeft + 200} ${mainHeight + 70}, ${paddingLeft + 400} ${mainHeight + 45} T ${width - paddingRight - 20} ${mainHeight + 38}" fill="none" stroke="#A855F7" stroke-width="2" />
      
      <!-- Watermark / AI Trade Helper brand badge -->
      <text x="${width - paddingRight - 10}" y="${mainHeight - 10}" text-anchor="end" fill="#334155" font-size="11" font-weight="600">AI TRADE HELPER • VISION ANALYZER</text>
    </svg>
  `;

  // Return base64 data url
  if (typeof btoa !== 'undefined') {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// Sample Price Sequences for 5 Distinct Trading Archetypes
const niftyPrices = [
  { o: 24700, h: 24750, l: 24680, c: 24740, v: 45000 },
  { o: 24740, h: 24790, l: 24730, c: 24780, v: 52000 },
  { o: 24780, h: 24820, l: 24750, c: 24760, v: 38000 },
  { o: 24760, h: 24850, l: 24760, c: 24840, v: 61000 },
  { o: 24840, h: 24860, l: 24790, c: 24800, v: 42000 },
  { o: 24800, h: 24830, l: 24790, c: 24820, v: 39000 },
  { o: 24820, h: 24870, l: 24810, c: 24860, v: 58000 },
  { o: 24860, h: 24890, l: 24830, c: 24840, v: 44000 },
  { o: 24840, h: 24900, l: 24840, c: 24890, v: 72000 },
  { o: 24890, h: 24920, l: 24870, c: 24880, v: 49000 },
  { o: 24880, h: 24940, l: 24875, c: 24930, v: 68000 },
  { o: 24930, h: 24980, l: 24910, c: 24970, v: 88000 },
  { o: 24970, h: 25010, l: 24950, c: 24995, v: 95000 },
];

const bankNiftyPrices = [
  { o: 52200, h: 52400, l: 52150, c: 52380, v: 62000 },
  { o: 52380, h: 52450, l: 52300, c: 52320, v: 51000 },
  { o: 52320, h: 52360, l: 52100, c: 52140, v: 48000 },
  { o: 52140, h: 52250, l: 51950, c: 51980, v: 57000 },
  { o: 51980, h: 52120, l: 51900, c: 52080, v: 43000 },
  { o: 52080, h: 52280, l: 52050, c: 52240, v: 49000 },
  { o: 52240, h: 52420, l: 52180, c: 52390, v: 71000 },
  { o: 52390, h: 52460, l: 52290, c: 52310, v: 63000 },
  { o: 52310, h: 52350, l: 52050, c: 52090, v: 54000 },
  { o: 52090, h: 52180, l: 51950, c: 52020, v: 46000 },
  { o: 52020, h: 52260, l: 52000, c: 52230, v: 59000 },
];

const btcPrices = [
  { o: 65400, h: 65600, l: 64200, c: 64400, v: 1200 },
  { o: 64400, h: 64800, l: 63800, c: 63900, v: 980 },
  { o: 63900, h: 64200, l: 63100, c: 63300, v: 1100 },
  { o: 63300, h: 63700, l: 62800, c: 63100, v: 850 },
  { o: 63100, h: 63500, l: 62600, c: 62700, v: 740 },
  { o: 62700, h: 63400, l: 62500, c: 63350, v: 1450 },
  { o: 63350, h: 64100, l: 63200, c: 63950, v: 1980 },
  { o: 63950, h: 64600, l: 63800, c: 64500, v: 2400 },
  { o: 64500, h: 65200, l: 64300, c: 65150, v: 3100 },
];

const reliancePrices = [
  { o: 3020, h: 3045, l: 3010, c: 3040, v: 1200000 },
  { o: 3040, h: 3060, l: 3030, c: 3050, v: 980000 },
  { o: 3050, h: 3080, l: 3035, c: 3075, v: 1450000 },
  { o: 3075, h: 3085, l: 3040, c: 3045, v: 1300000 },
  { o: 3045, h: 3055, l: 3010, c: 3015, v: 1650000 },
  { o: 3015, h: 3035, l: 2990, c: 3000, v: 1100000 },
  { o: 3000, h: 3020, l: 2980, c: 2985, v: 1750000 },
  { o: 2985, h: 3000, l: 2940, c: 2945, v: 2200000 },
  { o: 2945, h: 2960, l: 2915, c: 2920, v: 2800000 },
];

const ethPrices = [
  { o: 3200, h: 3250, l: 3150, c: 3180, v: 14000 },
  { o: 3180, h: 3220, l: 3140, c: 3150, v: 12000 },
  { o: 3150, h: 3280, l: 3145, c: 3270, v: 18000 },
  { o: 3270, h: 3340, l: 3260, c: 3320, v: 22000 },
  { o: 3320, h: 3330, l: 3180, c: 3200, v: 15000 },
  { o: 3200, h: 3220, l: 3145, c: 3160, v: 11000 },
  { o: 3160, h: 3290, l: 3150, c: 3280, v: 25000 },
  { o: 3280, h: 3380, l: 3270, c: 3370, v: 34000 },
  { o: 3370, h: 3450, l: 3350, c: 3440, v: 42000 },
];

export const DEMO_CHARTS: DemoChartItem[] = [
  {
    id: 'demo-nifty-50',
    name: 'NIFTY 50 (15m)',
    asset: 'NIFTY 50',
    timeframe: '15m',
    bias: 'Bullish',
    pattern: 'Ascending Triangle Breakout',
    description: 'Higher lows compression against key ₹25,000 horizontal resistance with expanding volume & EMA stack.',
    svgDataUrl: createSvgChart('NIFTY 50 Index', '15M • NSE India', niftyPrices, '₹', { ema20: true, ema50: true, rsi: true }),
    precomputedAnalysis: {
      id: 'demo-analysis-nifty-50',
      timestamp: Date.now() - 3600000,
      imageUrl: createSvgChart('NIFTY 50 Index', '15M • NSE India', niftyPrices, '₹', { ema20: true, ema50: true, rsi: true }),
      asset: 'NIFTY 50',
      timeframe: '15m',
      chartType: 'Candlestick',
      currencyOrUnit: '₹ Points',
      currentPrice: '₹24,995.00',
      trend: {
        direction: 'Bullish',
        assessmentScore: 84,
        summary: 'Consistent series of higher swing lows respecting the upward sloping 20 EMA, currently pressing against the multi-session ceiling at ₹25,000.',
      },
      marketStructure: {
        higherHighs: true,
        higherLows: true,
        lowerHighs: false,
        lowerLows: false,
        structure: 'Bullish Market Structure',
        phase: 'Breakout Retest',
        strength: 'Strong',
      },
      momentum: {
        status: 'Positive',
        points: [
          '20 EMA is accelerating above the 50 EMA in classic bullish posture',
          'RSI is holding healthy momentum at 64.8 without overbought exhaustion divergence',
          'Volume on green candles is +38% higher than average consolidation bars',
        ],
      },
      volatility: {
        level: 'Moderate',
        description: 'Compressing volatility range inside triangle apex indicates imminent directional expansion.',
      },
      aiConfidence: {
        score: 92,
        category: 'High',
        reason: 'Exceptional visual clarity: distinct candles, clearly labeled price scale, visible 20/50 EMAs, and volume histogram.',
      },
      riskAssessment: {
        level: 'Moderate',
        factors: [
          'Immediate overhead psychological resistance at ₹25,000 may induce profit-taking',
          '15-minute timeframe contains intraday noise and sensitivity to opening gap-downs',
          'Failure to sustain above ₹24,980 could trigger a short-term liquidity sweep lower',
        ],
        primaryWarning: 'Wait for a full 15m candle close above ₹25,010 with volume confirmation before anticipating continuation.',
      },
      keyLevels: [
        {
          id: 'lvl-nifty-r1',
          type: 'Major Resistance',
          price: '₹25,020',
          significance: 'Multi-day supply zone and round-number psychological barrier',
          confidence: 94,
        },
        {
          id: 'lvl-nifty-pv',
          type: 'Current Pivot',
          price: '₹24,940',
          significance: 'Previous intraday swing high now acting as dynamic support',
          confidence: 88,
        },
        {
          id: 'lvl-nifty-s1',
          type: 'Major Support',
          price: '₹24,840',
          significance: 'Ascending trendline base and 50 EMA confluence',
          confidence: 91,
        },
      ],
      candlesticks: [
        {
          name: 'Bullish Marubozu & Long-Body Expansion',
          type: 'Bullish',
          location: 'Most recent 2 candles approaching ₹25,000',
          description: 'Strong green candles closing near their session highs with negligible upper wicks, displaying active buyer dominance.',
          reliability: 'High',
        },
        {
          name: 'Hammer-like Pin Bar',
          type: 'Reversal',
          location: 'At the ₹24,800 swing low pivot',
          description: 'Long lower shadow absorbed supply, establishing the latest higher low in the ascending triangle.',
          reliability: 'High',
        },
      ],
      patterns: [
        {
          name: 'Ascending Triangle Formation',
          type: 'Continuation',
          confidence: 'High',
          probabilityScore: 88,
          historicalReliability: '78% Continuation Win Rate',
          description: 'Flat horizontal resistance around ₹25,000 paired with rising trendline support. Classic accumulation structure.',
          breakoutTrigger: '15-minute close above ₹25,020 with volume expansion.',
        },
      ],
      indicators: {
        rsi: {
          value: 64.8,
          status: 'Elevated (60-70)',
          divergence: 'None visible',
          interpretation: 'Constructive bullish expansion zone. Plenty of room before reaching overbought levels (>70).',
        },
        macd: {
          signal: 'Positive Momentum',
          histogram: 'Ascending green histogram bars expanding above zero',
          interpretation: 'Fast MACD line is diverging positively from signal line, confirming upward velocity.',
        },
        movingAverages: {
          description: '20 EMA (Cyan) and 50 EMA (Amber)',
          priceVsMA: 'Above Visible MAs',
          slope: 'Positive / Upward',
          interpretation: 'Price is riding the upper band of the 20 EMA, which acts as dynamic rising support.',
        },
        volume: {
          status: 'High / Surge',
          trendCorrelation: 'Rising volume on green breakout attempts',
          interpretation: 'Strong institutional participation confirming the upward move.',
        },
      },
      scenarios: {
        bullish: {
          title: 'Bullish Breakout & Extension Scenario',
          type: 'bullish',
          condition: 'Price sustains above ₹25,020 with high volume and no immediate wick rejection.',
          implication: 'Ascending triangle measurement rule targets ₹25,120 – ₹25,180 upside zone.',
          confirmation: '15-minute closing candle above ₹25,020 with volume > 80k contracts.',
          invalidation: 'Rejection candle followed by a close back below ₹24,940.',
          estimatedTargetOrRange: '₹25,120 – ₹25,180',
        },
        neutral: {
          title: 'Triangle Apex Consolidation Scenario',
          type: 'neutral',
          condition: 'Price oscillates between ₹24,940 and ₹25,000 without breaking either boundary.',
          implication: 'Short-term sideways chop while market awaits fresh macroeconomic catalyst.',
          confirmation: 'Decreasing volume and alternating small-body doji candles.',
          invalidation: 'Decisive breach of either boundary level.',
          estimatedTargetOrRange: '₹24,940 – ₹25,000 Range',
        },
        bearish: {
          title: 'Failed Breakout / Liquidity Sweep Breakdown',
          type: 'bearish',
          condition: 'Price gets sharply rejected at ₹25,000 and slices below the ascending support at ₹24,840.',
          implication: 'Bull trap triggers stop-loss cascade down toward the ₹24,700 base support.',
          confirmation: 'Heavy red volume candle closing beneath ₹24,840.',
          invalidation: 'Immediate V-recovery back above ₹24,940.',
          estimatedTargetOrRange: '₹24,700 Demand Floor',
        },
      },
      explainableReasoning: [
        {
          step: 1,
          title: 'Ascending Market Structure',
          explanation: 'Price has made 4 consecutive higher lows (₹24,680 → ₹24,750 → ₹24,800 → ₹24,875), proving buyers are paying higher prices on every pullback.',
        },
        {
          step: 2,
          title: 'Key Resistance Pressure',
          explanation: 'The ₹25,000 ceiling has been tested 3 times. Repeated tests of horizontal resistance typically weaken the supply wall.',
        },
        {
          step: 3,
          title: 'Dynamic EMA Support Alignment',
          explanation: 'Candles remain comfortably above the ascending 20-period EMA, showing trend persistence without structural breakdown.',
        },
        {
          step: 4,
          title: 'Volume-Backed Accumulation',
          explanation: 'The latest green push to ₹24,995 is supported by the highest volume bar on the chart (95k contracts), signaling genuine demand.',
        },
        {
          step: 5,
          title: 'Risk Identification',
          explanation: 'Entering directly under ₹25,000 carries supply-rejection risk; professional execution seeks either confirmed breakout closes or pullbacks to the ascending trendline.',
        },
      ],
      beginnerSummary: 'The NIFTY 50 chart is showing strong upward energy. Think of the price as a bouncy ball being pressed against a ceiling at ₹25,000 while the floor keeps rising. Buyers are willing to step in earlier and earlier, which often leads to a break through the ceiling.',
      advancedSummary: 'Constructive ascending triangle structure with positive 20/50 EMA moving average stack on the 15m timeframe. RSI at 64.8 confirms strong directional momentum with zero bearish divergence. Favorable skew toward upward expansion upon hourly close above the 25,020 pivot.',
      missingOrUnclearData: ['VWAP line not explicitly overlaid', 'Higher timeframe (Daily/Weekly) macro context not visible in this single 15m crop'],
      annotations: [
        {
          type: 'horizontal_line',
          label: 'Major Resistance Ceiling (₹25,020)',
          color: '#FF5252',
          yPercentage: 20,
          notes: 'Tri-touch resistance zone',
        },
        {
          type: 'horizontal_line',
          label: 'Pivot Support (₹24,940)',
          color: '#38BDF8',
          yPercentage: 42,
          notes: 'Breakout retest level',
        },
        {
          type: 'horizontal_line',
          label: 'Trendline Base Support (₹24,840)',
          color: '#00C853',
          yPercentage: 68,
          notes: 'Ascending triangle lower boundary',
        },
        {
          type: 'trendline',
          label: 'Ascending Demand Trendline',
          color: '#00C853',
          x1: 12,
          y1: 82,
          x2: 88,
          y2: 46,
          notes: 'Dynamic ascending support',
        },
      ],
    },
  },
  {
    id: 'demo-bank-nifty',
    name: 'BANK NIFTY (5m)',
    asset: 'BANK NIFTY',
    timeframe: '5m',
    bias: 'Neutral / Sideways',
    pattern: 'Horizontal Range Box',
    description: 'Chop between ₹51,900 floor and ₹52,450 ceiling with repeated rejection wicks.',
    svgDataUrl: createSvgChart('BANK NIFTY Index', '5M • NSE India', bankNiftyPrices, '₹', { ema20: true, ema50: true, rsi: true }),
    precomputedAnalysis: {
      id: 'demo-analysis-bank-nifty',
      timestamp: Date.now() - 7200000,
      imageUrl: createSvgChart('BANK NIFTY Index', '5M • NSE India', bankNiftyPrices, '₹', { ema20: true, ema50: true, rsi: true }),
      asset: 'BANK NIFTY',
      timeframe: '5m',
      chartType: 'Candlestick',
      currencyOrUnit: '₹ Points',
      currentPrice: '₹52,230.00',
      trend: {
        direction: 'Neutral / Sideways',
        assessmentScore: 52,
        summary: 'Horizontal range oscillation bounded tightly between ₹51,900 demand floor and ₹52,450 overhead supply ceiling.',
      },
      marketStructure: {
        higherHighs: false,
        higherLows: false,
        lowerHighs: false,
        lowerLows: false,
        structure: 'Consolidation / Range-bound',
        phase: 'Range-Bound',
        strength: 'Moderate',
      },
      momentum: {
        status: 'Neutral',
        points: ['Oscillating around the 50 midpoint on RSI', '20 and 50 EMAs are intertwined and flat', 'Volume is erratic without sustained directional dominance'],
      },
      volatility: {
        level: 'Moderate',
        description: 'Mean-reverting intraday swings inside a 550-point range box.',
      },
      aiConfidence: {
        score: 88,
        category: 'High',
        reason: 'Clear visibility of range boundaries and wick rejections on both sides.',
      },
      riskAssessment: {
        level: 'High',
        factors: ['Whipsaw risk in middle of range', 'Frequent false breakout attempts near boundaries', '5m timeframe has high noise factor'],
        primaryWarning: 'Avoid trading in the middle (₹52,200); trade strictly at range extremes or wait for a confirmed boundary break.',
      },
      keyLevels: [
        {
          id: 'lvl-bn-r1',
          type: 'Major Resistance',
          price: '₹52,460',
          significance: 'Top of range box with multiple upper rejection shadows',
          confidence: 92,
        },
        {
          id: 'lvl-bn-mid',
          type: 'Current Pivot',
          price: '₹52,180',
          significance: 'Range equilibrium midpoint / chop zone',
          confidence: 76,
        },
        {
          id: 'lvl-bn-s1',
          type: 'Major Support',
          price: '₹51,920',
          significance: 'Strong demand floor with buyer absorption wicks',
          confidence: 90,
        },
      ],
      candlesticks: [
        {
          name: 'Shooting Star / Upper Shadow Rejections',
          type: 'Bearish',
          location: 'Near ₹52,450 resistance',
          description: 'Sellers continuously defend the ₹52,450 zone, pushing closing prices back into the range.',
          reliability: 'Moderate',
        },
      ],
      patterns: [
        {
          name: 'Rectangular Consolidation Box',
          type: 'Bilateral / Range',
          confidence: 'High',
          probabilityScore: 76,
          historicalReliability: '71% Range-Bound Bounce Rate',
          description: 'Well-defined horizontal channel between ₹51,920 and ₹52,460.',
          breakoutTrigger: 'Decisive 5m close outside ₹52,460 (upside) or ₹51,920 (downside).',
        },
      ],
      indicators: {
        rsi: {
          value: 51.2,
          status: 'Neutral (40-60)',
          divergence: 'None visible',
          interpretation: 'Equilibrium momentum. Neither buyers nor sellers have sustained momentum.',
        },
        macd: {
          signal: 'Converging',
          histogram: 'Small oscillating bars near zero line',
          interpretation: 'Momentum is flat without trend acceleration.',
        },
        movingAverages: {
          description: '20 EMA and 50 EMA flatlining',
          priceVsMA: 'Intertwined / Ranging',
          slope: 'Flat',
          interpretation: 'Moving averages are crossing back and forth, characteristic of range-bound consolidation.',
        },
        volume: {
          status: 'Moderate',
          trendCorrelation: 'Spikes at range boundaries followed by decay in the center',
          interpretation: 'Liquidity sits at the extremes of the channel.',
        },
      },
      scenarios: {
        bullish: {
          title: 'Range Breakout Expansion Scenario',
          type: 'bullish',
          condition: 'Price punches above ₹52,460 and closes with high volume.',
          implication: 'Range expansion target toward ₹52,900.',
          confirmation: '5-minute candle close above ₹52,480.',
          invalidation: 'Immediate drop back below ₹52,350.',
          estimatedTargetOrRange: '₹52,850 – ₹53,000',
        },
        neutral: {
          title: 'Range Mean-Reversion Continuation (Most Plausible)',
          type: 'neutral',
          condition: 'Price remains trapped between ₹51,920 and ₹52,460.',
          implication: 'Rotation between support and resistance continues.',
          confirmation: 'Rejection at boundaries with small candles.',
          invalidation: 'Breakout above ₹52,460 or breakdown below ₹51,920.',
          estimatedTargetOrRange: '₹51,920 – ₹52,460 Range',
        },
        bearish: {
          title: 'Range Breakdown & Demand Failure',
          type: 'bearish',
          condition: 'Price slices below ₹51,920 and fails to recover.',
          implication: 'Downside acceleration toward ₹51,500.',
          confirmation: '5-minute close beneath ₹51,900 with red volume spike.',
          invalidation: 'Sharp reversal back inside the box.',
          estimatedTargetOrRange: '₹51,500 Floor',
        },
      },
      explainableReasoning: [
        {
          step: 1,
          title: 'Equal Highs and Lows',
          explanation: 'Price has repeatedly tagged ₹52,450 without breaking out and tagged ₹51,920 without breaking down.',
        },
        {
          step: 2,
          title: 'Flat Moving Averages',
          explanation: 'Both 20 and 50 EMAs have lost their directional slope, confirming absence of a trend.',
        },
        {
          step: 3,
          title: 'RSI Centered at 50',
          explanation: 'The Relative Strength Index reflects balanced buying and selling pressure.',
        },
        {
          step: 4,
          title: 'Execution Strategy',
          explanation: 'In sideways markets, trading the middle leads to chop; disciplined traders wait for tests of the upper/lower edges.',
        },
      ],
      beginnerSummary: 'The BANK NIFTY chart is moving sideways like a ping-pong ball bouncing between two walls (₹51,920 on the bottom and ₹52,460 on the top). Neither buyers nor sellers have the upper hand right now.',
      advancedSummary: 'Neutral horizontal distribution/accumulation range. 20 and 50 EMAs are tangled and horizontal. MACD histogram oscillates near baseline with RSI at 51.2. Primary technical stance is mean-reverting range strategy until definitive volume-backed boundary breakout occurs.',
      missingOrUnclearData: ['Higher timeframe trend context', 'Open interest data not visible'],
      annotations: [
        {
          type: 'horizontal_line',
          label: 'Range Resistance (₹52,460)',
          color: '#FF5252',
          yPercentage: 18,
          notes: 'Upper range limit',
        },
        {
          type: 'horizontal_line',
          label: 'Range Floor Support (₹51,920)',
          color: '#00C853',
          yPercentage: 78,
          notes: 'Lower range limit',
        },
      ],
    },
  },
  {
    id: 'demo-btc-usd',
    name: 'BTC/USD (1h)',
    asset: 'BTC/USD',
    timeframe: '1h',
    bias: 'Bullish',
    pattern: 'Falling Wedge Breakout with Bullish RSI Divergence',
    description: 'Downward sloping converging boundaries broken to the upside with strong momentum surge.',
    svgDataUrl: createSvgChart('BTC/USD Perpetuals', '1H • Binance / Global', btcPrices, '$', { ema20: true, ema50: true, rsi: true }),
    precomputedAnalysis: {
      id: 'demo-analysis-btc-usd',
      timestamp: Date.now() - 1800000,
      imageUrl: createSvgChart('BTC/USD Perpetuals', '1H • Binance / Global', btcPrices, '$', { ema20: true, ema50: true, rsi: true }),
      asset: 'BTC/USD',
      timeframe: '1h',
      chartType: 'Candlestick',
      currencyOrUnit: '$ USD',
      currentPrice: '$65,150.00',
      trend: {
        direction: 'Bullish',
        assessmentScore: 86,
        summary: 'Strong impulse breakout from a multi-day falling wedge reversal pattern, reclaiming 20 & 50 EMAs with massive volume.',
      },
      marketStructure: {
        higherHighs: true,
        higherLows: true,
        lowerHighs: false,
        lowerLows: false,
        structure: 'Transitioning / Breakout in Progress',
        phase: 'Markup',
        strength: 'Strong',
      },
      momentum: {
        status: 'Strong Positive',
        points: [
          'Bullish divergence played out with strong price impulse',
          'RSI crossed sharply from 38 oversold up to 66 expansion zone',
          'Volume bar on the breakout is 2.5x the 20-period average volume',
        ],
      },
      volatility: {
        level: 'High',
        description: 'Large body expansion candles indicating rapid shift in liquidity.',
      },
      aiConfidence: {
        score: 95,
        category: 'High',
        reason: 'Pristine falling wedge geometry, visible RSI divergence, and clear price metrics.',
      },
      riskAssessment: {
        level: 'Moderate',
        factors: ['Chasing breakout candle after 3,000 point run carries pullback risk', 'Approaching major $66,000 resistance'],
        primaryWarning: 'Look for healthy pullbacks to previous wedge resistance turned support around $64,200 for optimal entry risk-reward.',
      },
      keyLevels: [
        {
          id: 'lvl-btc-r1',
          type: 'Major Resistance',
          price: '$66,200',
          significance: 'Prior macro lower high and liquidity pool',
          confidence: 93,
        },
        {
          id: 'lvl-btc-pv',
          type: 'Current Pivot',
          price: '$64,200',
          significance: 'Falling wedge breakout point now acting as support',
          confidence: 89,
        },
        {
          id: 'lvl-btc-s1',
          type: 'Major Support',
          price: '$62,500',
          significance: 'Wedge base demand zone and double bottom floor',
          confidence: 96,
        },
      ],
      candlesticks: [
        {
          name: 'Bullish Engulfing Cluster',
          type: 'Bullish',
          location: 'At wedge breakout line ($63,350 → $65,150)',
          description: 'Three consecutive large green candles completely overcoming previous two days of consolidation.',
          reliability: 'High',
        },
      ],
      patterns: [
        {
          name: 'Falling Wedge (Bullish Reversal)',
          type: 'Reversal',
          confidence: 'High',
          probabilityScore: 92,
          historicalReliability: '82% Reversal Follow-through',
          description: 'Converging downward trendlines where sellers ran out of momentum, followed by an aggressive upward breakout.',
          breakoutTrigger: 'Confirmed hourly close above $63,900.',
        },
      ],
      indicators: {
        rsi: {
          value: 66.2,
          status: 'Elevated (60-70)',
          divergence: 'Regular Bullish Divergence Confirmed',
          interpretation: 'Price made lower lows while RSI made higher lows, foreshadowing the current explosive reversal.',
        },
        macd: {
          signal: 'Bullish Crossover',
          histogram: 'Strong green histogram acceleration',
          interpretation: 'MACD line decisively crossed signal line with steep upward trajectory.',
        },
        movingAverages: {
          description: 'Reclaimed 20 EMA and 50 EMA',
          priceVsMA: 'Above Visible MAs',
          slope: 'Positive / Upward',
          interpretation: 'Price has pierced through both dynamic EMAs, flipping short-term trend bias from bearish to bullish.',
        },
        volume: {
          status: 'Climactic Spike',
          trendCorrelation: 'Huge green volume surge',
          interpretation: 'Institutional accumulation confirms genuine breakout.',
        },
      },
      scenarios: {
        bullish: {
          title: 'Wedge Extension & Target Tag ($67,500)',
          type: 'bullish',
          condition: 'Price holds above $64,200 retest level.',
          implication: 'Full measured move of the falling wedge toward $67,500.',
          confirmation: 'Holding higher lows on 1h chart.',
          invalidation: 'Break and close back inside wedge under $63,500.',
          estimatedTargetOrRange: '$67,000 – $68,200',
        },
        neutral: {
          title: 'High-Level Consolidation Flag',
          type: 'neutral',
          condition: 'Price consolidates between $64,500 and $65,500 to digest recent gains.',
          implication: 'Bull flag setup forming for second leg up.',
          confirmation: 'Low volume sideways action.',
          invalidation: 'Sharp drop below $63,800.',
          estimatedTargetOrRange: '$64,500 – $65,500',
        },
        bearish: {
          title: 'Fakeout Reversal Breakdown',
          type: 'bearish',
          condition: 'Sudden rejection candle sinking back below $63,500.',
          implication: 'Bull trap re-tests $62,500 low.',
          confirmation: 'High red volume spike wiping out previous green candle.',
          invalidation: 'Reclaiming $65,000 quickly.',
          estimatedTargetOrRange: '$62,500 Demand Base',
        },
      },
      explainableReasoning: [
        {
          step: 1,
          title: 'Exhaustion of Downward Momentum',
          explanation: 'Inside the falling wedge, each downward push covered less ground, indicating waning selling power.',
        },
        {
          step: 2,
          title: 'Bullish RSI Divergence Confirmation',
          explanation: 'While price hit $62,500, RSI registered higher reading than the previous low, creating a textbook divergence trigger.',
        },
        {
          step: 3,
          title: 'Volume-Backed Breakout',
          explanation: 'The breakout candle carried 3,100 volume units, proving strong aggressive market buying.',
        },
        {
          step: 4,
          title: 'EMA Reclaim',
          explanation: 'Price successfully reclaimed both the 20 and 50 EMAs in a single session impulse.',
        },
      ],
      beginnerSummary: 'Bitcoin was slowly grinding downwards in a funnel shape where sellers were getting tired. Buyers stepped in with huge force and broke the price out to the upside with strong momentum.',
      advancedSummary: 'High-conviction falling wedge reversal completed on the 1H timeframe. Confirmed regular bullish divergence on RSI (14) resolved with a 3.1k volume expansion candle. EMA dynamic resistance flipped to support; initial upside target at the $67,500 liquidity pool.',
      missingOrUnclearData: ['Funding rates & open interest heatmaps not available from screenshot'],
      annotations: [
        {
          type: 'horizontal_line',
          label: 'Upside Target ($67,200)',
          color: '#38BDF8',
          yPercentage: 12,
          notes: 'Measured wedge target',
        },
        {
          type: 'horizontal_line',
          label: 'Breakout Support ($64,200)',
          color: '#00C853',
          yPercentage: 48,
          notes: 'Previous resistance turned support',
        },
        {
          type: 'horizontal_line',
          label: 'Macro Support Floor ($62,500)',
          color: '#FF5252',
          yPercentage: 86,
          notes: 'Wedge base low',
        },
      ],
    },
  },
  {
    id: 'demo-reliance',
    name: 'RELIANCE IND (Daily)',
    asset: 'RELIANCE',
    timeframe: 'Daily',
    bias: 'Bearish',
    pattern: 'Head and Shoulders Breakdown Attempt',
    description: 'Left shoulder, head, and right shoulder formed; price testing crucial neckline support at ₹2,920.',
    svgDataUrl: createSvgChart('RELIANCE IND LTD', 'Daily • NSE India', reliancePrices, '₹', { ema20: true, ema50: true, rsi: true }),
    precomputedAnalysis: {
      id: 'demo-analysis-reliance',
      timestamp: Date.now() - 14400000,
      imageUrl: createSvgChart('RELIANCE IND LTD', 'Daily • NSE India', reliancePrices, '₹', { ema20: true, ema50: true, rsi: true }),
      asset: 'RELIANCE',
      timeframe: 'Daily',
      chartType: 'Candlestick',
      currencyOrUnit: '₹ Points',
      currentPrice: '₹2,920.00',
      trend: {
        direction: 'Bearish',
        assessmentScore: 79,
        summary: 'Progressive breakdown of daily market structure with lower highs and lower lows, currently pressing below the 50-day moving average and neckline at ₹2,920.',
      },
      marketStructure: {
        higherHighs: false,
        higherLows: false,
        lowerHighs: true,
        lowerLows: true,
        structure: 'Bearish Market Structure',
        phase: 'Markdown',
        strength: 'Moderate',
      },
      momentum: {
        status: 'Negative',
        points: ['RSI depressed at 36, slipping toward oversold', 'MACD line crossed below signal line and diving under zero', 'Selling volume expanded on red down days'],
      },
      volatility: {
        level: 'Moderate–High',
        description: 'Widening red daily candles signaling aggressive institutional distribution.',
      },
      aiConfidence: {
        score: 91,
        category: 'High',
        reason: 'Clean daily candlestick structure showing classical Head & Shoulders geometry and clearly demarcated neckline.',
      },
      riskAssessment: {
        level: 'High',
        factors: ['Neckline breakdown could trigger automated stop-losses', 'Stock is below 20 and 50 Daily EMAs', 'Broad index correlation'],
        primaryWarning: 'If ₹2,915 daily support fails to hold, downward momentum could accelerate toward ₹2,780.',
      },
      keyLevels: [
        {
          id: 'lvl-rel-r1',
          type: 'Major Resistance',
          price: '₹3,040',
          significance: 'Right shoulder swing high & 50 EMA resistance',
          confidence: 91,
        },
        {
          id: 'lvl-rel-neck',
          type: 'Current Pivot',
          price: '₹2,920',
          significance: 'Head & Shoulders neckline boundary',
          confidence: 94,
        },
        {
          id: 'lvl-rel-s1',
          type: 'Major Support',
          price: '₹2,780',
          significance: 'Prior multi-month accumulation base',
          confidence: 88,
        },
      ],
      candlesticks: [
        {
          name: 'Bearish Marubozu / Breakdown Candle',
          type: 'Bearish',
          location: 'At ₹2,920 neckline',
          description: 'Large red daily candle closing near the absolute low of the day with heavy volume.',
          reliability: 'High',
        },
      ],
      patterns: [
        {
          name: 'Head and Shoulders (Top Reversal)',
          type: 'Reversal',
          confidence: 'Moderate–High',
          probabilityScore: 83,
          historicalReliability: '79% Breakdown Target Hit Rate',
          description: 'Left shoulder (₹3,040), Head (₹3,080), Right shoulder (₹3,035) with horizontal neckline at ₹2,920.',
          breakoutTrigger: 'Daily candle close below ₹2,915.',
        },
      ],
      indicators: {
        rsi: {
          value: 36.4,
          status: 'Depressed (30-40)',
          divergence: 'Hidden Bearish Continuation',
          interpretation: 'RSI in bearish control zone. Not yet severely oversold (<30), leaving scope for further downside.',
        },
        macd: {
          signal: 'Bearish Crossover',
          histogram: 'Red expanding histogram bars below zero',
          interpretation: 'Sellers in firm control of daily momentum.',
        },
        movingAverages: {
          description: 'Price below 20 EMA & 50 EMA',
          priceVsMA: 'Below Visible MAs',
          slope: 'Negative / Downward',
          interpretation: 'Moving averages have formed a death cross (20 EMA below 50 EMA), exerting downward overhead pressure.',
        },
        volume: {
          status: 'High / Surge',
          trendCorrelation: 'High volume on red down days (2.8M shares)',
          interpretation: 'Distribution pattern confirmed by elevated volume on declines.',
        },
      },
      scenarios: {
        bullish: {
          title: 'Neckline Defense & Double Bottom Failure',
          type: 'bullish',
          condition: 'Buyers vigorously defend ₹2,915 with long lower shadow and reclaim ₹2,980.',
          implication: 'Bear trap creates relief rally back to ₹3,040.',
          confirmation: 'Daily green hammer candle above ₹2,920.',
          invalidation: 'Daily close beneath ₹2,910.',
          estimatedTargetOrRange: '₹3,000 – ₹3,040',
        },
        neutral: {
          title: 'Neckline Straddle Consolidation',
          type: 'neutral',
          condition: 'Price hovers in narrow band between ₹2,910 and ₹2,950.',
          implication: 'Equilibrium as market tests liquidity before directional resolution.',
          confirmation: 'Decreasing volume and small daily ranges.',
          invalidation: 'Decisive move away from ₹2,920.',
          estimatedTargetOrRange: '₹2,910 – ₹2,950',
        },
        bearish: {
          title: 'Confirmed Head & Shoulders Breakdown (High Skew)',
          type: 'bearish',
          condition: 'Daily candle closes convincingly below ₹2,915 with volume > 2.5M.',
          implication: 'Measured target of head-to-neckline height points toward ₹2,780.',
          confirmation: 'Follow-through red candle next session.',
          invalidation: 'Reclaiming ₹2,980 quickly.',
          estimatedTargetOrRange: '₹2,780 – ₹2,820 Downside Zone',
        },
      },
      explainableReasoning: [
        {
          step: 1,
          title: 'Structural Breakdown',
          explanation: 'Lower swing highs formed since the ₹3,085 peak confirm waning bullish enthusiasm.',
        },
        {
          step: 2,
          title: 'Neckline Testing Pressure',
          explanation: 'The critical support level of ₹2,920 is being subjected to sustained selling pressure.',
        },
        {
          step: 3,
          title: 'Moving Average Resistance',
          explanation: 'The stock has dropped below both 20 and 50 Daily EMAs, creating overhead supply on every rebound.',
        },
        {
          step: 4,
          title: 'Volume Signatures',
          explanation: 'Heaviest trading volume on the chart aligns with red downward candles, a typical marker of distribution.',
        },
      ],
      beginnerSummary: 'The RELIANCE daily chart is showing a classic "Head and Shoulders" pattern, which indicates buyers are losing strength. Price is now testing the key floor at ₹2,920. If this floor breaks, prices may drop further.',
      advancedSummary: 'Head and Shoulders topping formation on the Daily chart. Price testing the ₹2,920 horizontal neckline with 20/50 EMA bearish crossover and RSI at 36.4. Volume expansion on down days indicates institutional distribution; high probability of markdown toward ₹2,780 if daily close breaches ₹2,915.',
      missingOrUnclearData: ['Sector index (Nifty Oil & Gas) comparison not included in screenshot'],
      annotations: [
        {
          type: 'horizontal_line',
          label: 'Right Shoulder Resistance (₹3,040)',
          color: '#FF5252',
          yPercentage: 25,
          notes: 'Upper invalidation level',
        },
        {
          type: 'horizontal_line',
          label: 'Critical Neckline Support (₹2,920)',
          color: '#FFB300',
          yPercentage: 74,
          notes: 'Head and shoulders neckline',
        },
        {
          type: 'horizontal_line',
          label: 'Measured Target (₹2,780)',
          color: '#FF5252',
          yPercentage: 92,
          notes: 'Downside target projection',
        },
      ],
    },
  },
  {
    id: 'demo-eth-usdt',
    name: 'ETH/USDT (4h)',
    asset: 'ETH/USDT',
    timeframe: '4h',
    bias: 'Bullish',
    pattern: 'Adam & Eve Double Bottom with Volume Surge',
    description: 'Sharp V-bottom followed by rounded accumulation bottom, breaking neckline at $3,350 with surging volume.',
    svgDataUrl: createSvgChart('ETH/USDT Perpetuals', '4H • Global Spot/Futures', ethPrices, '$', { ema20: true, ema50: true, rsi: true }),
    precomputedAnalysis: {
      id: 'demo-analysis-eth-usdt',
      timestamp: Date.now() - 10800000,
      imageUrl: createSvgChart('ETH/USDT Perpetuals', '4H • Global Spot/Futures', ethPrices, '$', { ema20: true, ema50: true, rsi: true }),
      asset: 'ETH/USDT',
      timeframe: '4h',
      chartType: 'Candlestick',
      currencyOrUnit: '$ USD',
      currentPrice: '$3,440.00',
      trend: {
        direction: 'Bullish',
        assessmentScore: 88,
        summary: 'Decisive double bottom breakout above $3,350 neckline with expanding 4h volume and strong positive RSI slope.',
      },
      marketStructure: {
        higherHighs: true,
        higherLows: true,
        lowerHighs: false,
        lowerLows: false,
        structure: 'Bullish Market Structure',
        phase: 'Markup',
        strength: 'Strong',
      },
      momentum: {
        status: 'Strong Positive',
        points: ['RSI at 68 showing robust buyer acceleration', 'MACD histogram in green expansion phase', 'Volume at highest level of the 4-hour cycle'],
      },
      volatility: {
        level: 'Moderate–High',
        description: 'Strong bullish trend expansion candles.',
      },
      aiConfidence: {
        score: 93,
        category: 'High',
        reason: 'Clean double bottom pattern, clear indicators and visible volume confirmation.',
      },
      riskAssessment: {
        level: 'Moderate',
        factors: ['RSI approaching 70 short-term overbought', 'Need to defend $3,350 breakout level on any retest'],
        primaryWarning: 'Watch for retest of $3,350 neckline to confirm continuation.',
      },
      keyLevels: [
        {
          id: 'lvl-eth-r1',
          type: 'Major Resistance',
          price: '$3,650',
          significance: 'Prior macro swing high and liquidity zone',
          confidence: 92,
        },
        {
          id: 'lvl-eth-pv',
          type: 'Current Pivot',
          price: '$3,350',
          significance: 'Double bottom neckline (now flipped to support)',
          confidence: 95,
        },
        {
          id: 'lvl-eth-s1',
          type: 'Major Support',
          price: '$3,150',
          significance: 'Double bottom base floor',
          confidence: 96,
        },
      ],
      candlesticks: [
        {
          name: 'Bullish Continuation Expansion',
          type: 'Bullish',
          location: 'Neckline breakout ($3,350 → $3,440)',
          description: 'Strong full-body green candles with negligible upper wicks.',
          reliability: 'High',
        },
      ],
      patterns: [
        {
          name: 'Double Bottom (W-Pattern)',
          type: 'Reversal',
          confidence: 'High',
          probabilityScore: 89,
          historicalReliability: '81% Measured Move Completion',
          description: 'Two distinct tests of the $3,150 demand floor followed by neckline breakout at $3,350.',
          breakoutTrigger: 'Confirmed 4-hour close above $3,350.',
        },
      ],
      indicators: {
        rsi: {
          value: 68.1,
          status: 'Elevated (60-70)',
          divergence: 'None visible',
          interpretation: 'Strong buyer dominance with positive expansion momentum.',
        },
        macd: {
          signal: 'Positive Momentum',
          histogram: 'Expanding green bars above zero',
          interpretation: 'Momentum is accelerating upward.',
        },
        movingAverages: {
          description: 'Price well above 20 & 50 EMAs',
          priceVsMA: 'Above Visible MAs',
          slope: 'Positive / Upward',
          interpretation: 'Positive moving average divergence confirms sustained trend.',
        },
        volume: {
          status: 'High / Surge',
          trendCorrelation: 'Surge on the breakout candle (42k ETH)',
          interpretation: 'High conviction buying.',
        },
      },
      scenarios: {
        bullish: {
          title: 'Double Bottom Measured Move Extension',
          type: 'bullish',
          condition: 'Price holds above $3,350 on 4-hour close.',
          implication: 'Measured move of base height targets $3,650.',
          confirmation: 'Holding $3,350 on retest.',
          invalidation: 'Close back below $3,280.',
          estimatedTargetOrRange: '$3,600 – $3,680',
        },
        neutral: {
          title: 'Neckline Retest Consolidation',
          type: 'neutral',
          condition: 'Price pulls back to retest $3,350 support.',
          implication: 'Healthy consolidation to reset short-term RSI.',
          confirmation: 'Low volume pullback.',
          invalidation: 'Breakdown under $3,250.',
          estimatedTargetOrRange: '$3,350 – $3,450',
        },
        bearish: {
          title: 'Failed Breakout Bull Trap',
          type: 'bearish',
          condition: 'Price gets rejected and plunges back under $3,280.',
          implication: 'Re-test of $3,150 base.',
          confirmation: 'Heavy red volume candle.',
          invalidation: 'Reclaiming $3,400.',
          estimatedTargetOrRange: '$3,150 Demand Floor',
        },
      },
      explainableReasoning: [
        {
          step: 1,
          title: 'Double Demand Test',
          explanation: 'Price tested $3,150 twice and rejected lower prices both times, proving strong institutional interest.',
        },
        {
          step: 2,
          title: 'Neckline Breakout',
          explanation: 'A clean 4h close above the intermediate high of $3,350 confirmed the reversal pattern.',
        },
        {
          step: 3,
          title: 'Volume Surge',
          explanation: 'The breakout candle was accompanied by 42,000 ETH in volume, 3x higher than previous consolidation candles.',
        },
        {
          step: 4,
          title: 'Oscillator Alignment',
          explanation: 'RSI and MACD are both aligned in positive expansion territory.',
        },
      ],
      beginnerSummary: 'Ethereum bounced twice off the $3,150 floor (forming a "W" shape) and has now broken above the middle peak at $3,350 with huge buying volume. This is a classic pattern indicating buyers are taking control.',
      advancedSummary: 'High-probability Adam & Eve double bottom reversal completed on ETH/USDT 4H timeframe. Neckline breakout at $3,350 confirmed with 3x volume expansion and positive MACD histogram slope. Upside measured move target at $3,650.',
      missingOrUnclearData: ['Derivatives liquidation map and gas metrics not visible in screenshot'],
      annotations: [
        {
          type: 'horizontal_line',
          label: 'Upside Target ($3,650)',
          color: '#38BDF8',
          yPercentage: 16,
          notes: 'Measured double bottom target',
        },
        {
          type: 'horizontal_line',
          label: 'Neckline Support ($3,350)',
          color: '#00C853',
          yPercentage: 46,
          notes: 'Flipped resistance to support',
        },
        {
          type: 'horizontal_line',
          label: 'Double Bottom Floor ($3,150)',
          color: '#FF5252',
          yPercentage: 84,
          notes: 'Base demand floor',
        },
      ],
    },
  },
];
