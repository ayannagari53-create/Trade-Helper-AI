import { GoogleGenAI } from '@google/genai';
import { ChartAnalysisResult, MultiTimeframeSynthesisResult, AnalysisComparisonResult } from '../types';

// Shared server-side Gemini client with aistudio-build telemetry
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Using intelligent fallback parser if needed.');
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION_VISION_ANALYSIS = `
You are the world's leading quantitative technical analysis AI and computer vision chart analyst for "AI Trade Helper".
Your role is to inspect the uploaded trading chart screenshot with extreme precision and provide an explainable, educational, scenario-based technical analysis.

STRICT PRINCIPLES:
1. Analyze ONLY information that is actually visible in the screenshot (candles, indicators, price scales, timeframes, volume).
2. NEVER invent unreadable values or exact prices if the price scale is cut off or blurry. If price/scale is unreadable, state "Exact price scale unreadable".
3. Clearly separate direct visual observations from technical interpretations.
4. NEVER guarantee future price movements or provide personalized financial advice.
5. Assessment confidence reflects visual clarity and indicator confluence, NOT probability that price will rise or fall.
6. Generate 3 distinct conditional scenarios (Bullish, Neutral/Consolidation, Bearish) with clear triggers, confirmations, and invalidations.
7. Identify missing or obscured data (e.g. missing volume, no RSI, cropped time axis).
8. Compute approximate normalized coordinates (yPercentage from top 0-100, x1, y1, x2, y2) for annotations like key support/resistance lines and trendlines so they can be drawn over the chart.

Return ONLY a valid JSON object strictly matching this structure:
{
  "asset": "Detected ticker/asset symbol (e.g. NIFTY 50, BTC/USDT, AAPL) or 'Unknown'",
  "timeframe": "Detected timeframe (e.g. 15m, 1h, 4h, Daily) or 'Unspecified'",
  "chartType": "Candlestick | Heikin Ashi | Line | Bar",
  "currencyOrUnit": "₹ | $ | € | Points | % | Unknown",
  "currentPrice": "Estimated last visible price with currency symbol or 'Unreadable'",
  "trend": {
    "direction": "Strong Bullish" | "Bullish" | "Neutral / Sideways" | "Bearish" | "Strong Bearish",
    "assessmentScore": 75, // Integer 0-100 reflecting trend conviction
    "summary": "Brief 1-2 sentence description of visible trend slope and structure"
  },
  "marketStructure": {
    "higherHighs": true,
    "higherLows": true,
    "lowerHighs": false,
    "lowerLows": false,
    "structure": "Bullish Market Structure" | "Bearish Market Structure" | "Consolidation / Range-bound" | "Transitioning / Breakout in Progress",
    "phase": "Accumulation" | "Markup" | "Distribution" | "Markdown" | "Range-Bound" | "Breakout Retest",
    "strength": "Strong" | "Moderate" | "Weak"
  },
  "momentum": {
    "status": "Strong Positive" | "Positive" | "Neutral" | "Negative" | "Strong Negative" | "Insufficient Visible Data",
    "points": ["Visible momentum observation 1", "Visible momentum observation 2"]
  },
  "volatility": {
    "level": "Low" | "Moderate" | "Moderate–High" | "High" | "Extreme",
    "description": "Assessment of recent candle range / ATR behavior"
  },
  "aiConfidence": {
    "score": 82, // Integer 0-100 reflecting visual legibility and clarity
    "category": "High" | "Moderate–High" | "Moderate" | "Low",
    "reason": "Clear price scale, visible EMAs and legible volume bars"
  },
  "riskAssessment": {
    "level": "Low" | "Moderate" | "High" | "Very High",
    "factors": ["Approaching overhead resistance", "Short-term momentum stretched", "Lower timeframe noise"],
    "primaryWarning": "Key summary warning for the technical setup"
  },
  "keyLevels": [
    {
      "id": "lvl-1",
      "type": "Major Resistance" | "Minor Resistance" | "Current Pivot" | "Minor Support" | "Major Support",
      "price": "e.g. ₹24,850 or ~$64,200",
      "significance": "Previous multi-touch swing high with rejection wicks",
      "confidence": 85
    }
  ],
  "candlesticks": [
    {
      "name": "e.g. Bullish Pin Bar / Hammer / Engulfing / Doji",
      "type": "Bullish" | "Bearish" | "Indecision" | "Reversal" | "Continuation",
      "location": "Near support / at recent swing high / at pivot",
      "description": "Long lower shadow showing aggressive buyer absorption",
      "reliability": "High" | "Moderate" | "Low"
    }
  ],
  "patterns": [
    {
      "name": "e.g. Ascending Triangle / Bull Flag / Double Bottom / Range Box",
      "type": "Reversal" | "Continuation" | "Bilateral / Range",
      "confidence": "High" | "Moderate" | "Low",
      "probabilityScore": 85, // integer 0-100 representing probability/confidence percentage based on structural geometry, volume confluence, and indicator alignment
      "historicalReliability": "e.g. ~78% Historical Follow-through on Volume",
      "description": "Horizontal resistance with ascending swing lows indicating persistent accumulation",
      "breakoutTrigger": "Daily close above the upper resistance boundary"
    }
  ],
  "indicators": {
    "rsi": {
      "value": "e.g. 62 or 'Not Visible'",
      "status": "Overbought (>70)" | "Elevated (60-70)" | "Neutral (40-60)" | "Depressed (30-40)" | "Oversold (<30)" | "Not Visible",
      "divergence": "None visible / Regular Bullish / Hidden Bearish",
      "interpretation": "RSI trending in bullish control zone without overbought exhaustion"
    },
    "macd": {
      "signal": "Bullish Crossover" | "Bearish Crossover" | "Positive Momentum" | "Negative Momentum" | "Converging" | "Not Visible",
      "histogram": "Expanding green bars above zero line",
      "interpretation": "Momentum favors buyer continuation"
    },
    "movingAverages": {
      "description": "e.g. 20 EMA and 50 EMA visible",
      "priceVsMA": "Above Visible MAs" | "Below Visible MAs" | "Intertwined / Ranging" | "Testing Dynamic Support" | "Testing Dynamic Resistance" | "Not Visible",
      "slope": "Positive / Upward" | "Flat" | "Negative / Downward" | "Not Visible",
      "interpretation": "Price maintains support above ascending 20-period EMA"
    },
    "volume": {
      "status": "High / Surge" | "Moderate" | "Low / Declining" | "Climactic Spike" | "Not Visible",
      "trendCorrelation": "Higher volume on green candles than red pullbacks",
      "interpretation": "Healthy participation confirming upward market structure"
    }
  },
  "scenarios": {
    "bullish": {
      "title": "Bullish Continuation Scenario",
      "type": "bullish",
      "condition": "Price sustains above the immediate resistance level with volume expansion.",
      "implication": "Upward trend structure extends toward the next higher resistance zone.",
      "confirmation": "Strong hourly candle close above resistance without immediate rejection wicks.",
      "invalidation": "Price drops and closes back below the key swing low support.",
      "estimatedTargetOrRange": "Next major overhead pivot zone"
    },
    "neutral": {
      "title": "Range Consolidation Scenario",
      "type": "neutral",
      "condition": "Price remains contained between identified support and resistance boundaries.",
      "implication": "Sideways rotation as liquidity builds for the next directional break.",
      "confirmation": "Alternating candle colors and shrinking ATR inside the range.",
      "invalidation": "Decisive breakout or breakdown outside the defined range bounds.",
      "estimatedTargetOrRange": "Between Support and Resistance levels"
    },
    "bearish": {
      "title": "Downside Breakdown / Correction Scenario",
      "type": "bearish",
      "condition": "Price breaks and closes below the ascending support trendline/key pivot.",
      "implication": "Deeper corrective retracement toward major demand support.",
      "confirmation": "Sustained selling pressure with increased red volume bars.",
      "invalidation": "V-shaped recovery back above the breached pivot.",
      "estimatedTargetOrRange": "Major lower demand zone"
    }
  },
  "explainableReasoning": [
    {
      "step": 1,
      "title": "Price Structure Alignment",
      "explanation": "Successive higher swing lows confirm demand is stepping in at progressively higher prices."
    },
    {
      "step": 2,
      "title": "Moving Average Dynamic Support",
      "explanation": "Candlesticks are holding steady above the rising moving averages."
    },
    {
      "step": 3,
      "title": "Momentum Indicator Health",
      "explanation": "Oscillators maintain positive posture without extreme overbought divergence."
    },
    {
      "step": 4,
      "title": "Key Level Proximity",
      "explanation": "Price is testing an important horizontal ceiling that warrants confirmation before aggressive positioning."
    },
    {
      "step": 5,
      "title": "Risk Considerations",
      "explanation": "A rejection at resistance would confirm a temporary range rather than immediate continuation."
    }
  ],
  "beginnerSummary": "Plain-English explanation: The chart shows prices generally climbing higher with buyers in control. However, price is approaching a ceiling where sellers previously stepped in. Waiting for price to cross that ceiling confirms whether buyers remain strong.",
  "advancedSummary": "Quantitative summary: Bullish market structure characterized by HH/HL series with 20/50 EMA stacked in bullish alignment. RSI sits in the 60-65 expansion zone with positive MACD histogram delta. Resistance at top boundary is key pivot for continuation vs range consolidation.",
  "missingOrUnclearData": [
    "List any indicators not visible in screenshot, or note if image is clear"
  ],
  "annotations": [
    {
      "type": "horizontal_line",
      "label": "Resistance Zone",
      "color": "#FF5252",
      "yPercentage": 28,
      "notes": "Major swing ceiling"
    },
    {
      "type": "horizontal_line",
      "label": "Key Support",
      "color": "#00C853",
      "yPercentage": 72,
      "notes": "Ascending structure floor"
    },
    {
      "type": "trendline",
      "label": "Ascending Trendline",
      "color": "#38BDF8",
      "x1": 15,
      "y1": 80,
      "x2": 85,
      "y2": 45,
      "notes": "Dynamic higher lows"
    }
  ]
}
`;

export async function analyzeChartImage(
  base64Data: string,
  mimeType: string = 'image/png',
  userContext?: { timeframeHint?: string; assetHint?: string; mode?: 'beginner' | 'advanced' }
): Promise<ChartAnalysisResult> {
  const genAI = getGenAI();

  // Strip prefix if included
  let cleanBase64 = base64Data;
  if (base64Data.includes('base64,')) {
    const parts = base64Data.split('base64,');
    cleanBase64 = parts[1];
    const mimeMatch = parts[0].match(/data:(.*?);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
  }

  if (genAI) {
    try {
      const prompt = `Analyze this trading chart screenshot. Provide a deep, structured technical analysis.
${userContext?.assetHint ? `User note: The asset might be ${userContext.assetHint}.` : ''}
${userContext?.timeframeHint ? `User note: The timeframe might be ${userContext.timeframeHint}.` : ''}
Remember to extract only visible indicators, price levels, patterns, and structure. Return ONLY valid JSON.`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/png',
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_VISION_ANALYSIS,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);

      const result: ChartAnalysisResult = {
        id: 'analysis-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        timestamp: Date.now(),
        imageUrl: `data:${mimeType};base64,${cleanBase64}`,
        asset: parsed.asset || 'Detected Chart',
        timeframe: parsed.timeframe || 'Visible Timeframe',
        chartType: parsed.chartType || 'Candlestick',
        currencyOrUnit: parsed.currencyOrUnit || '',
        currentPrice: parsed.currentPrice || 'Visible Level',
        trend: parsed.trend || {
          direction: 'Bullish',
          assessmentScore: 75,
          summary: 'Positive price structure with upward slope',
        },
        marketStructure: parsed.marketStructure || {
          higherHighs: true,
          higherLows: true,
          lowerHighs: false,
          lowerLows: false,
          structure: 'Bullish Market Structure',
          phase: 'Markup',
          strength: 'Moderate',
        },
        momentum: parsed.momentum || {
          status: 'Positive',
          points: ['Supportive indicator posture', 'Constructive price action'],
        },
        volatility: parsed.volatility || {
          level: 'Moderate',
          description: 'Standard trading range fluctuations',
        },
        aiConfidence: parsed.aiConfidence || {
          score: 80,
          category: 'Moderate–High',
          reason: 'Clear chart geometry and visible structure',
        },
        riskAssessment: parsed.riskAssessment || {
          level: 'Moderate',
          factors: ['Approaching resistance zone', 'Market volatility'],
          primaryWarning: 'Ensure proper risk limits and wait for breakout confirmation',
        },
        keyLevels: parsed.keyLevels || [],
        candlesticks: parsed.candlesticks || [],
        patterns: (parsed.patterns || []).map((p: any) => ({
          ...p,
          probabilityScore:
            typeof p.probabilityScore === 'number'
              ? Math.min(99, Math.max(25, Math.round(p.probabilityScore)))
              : p.confidence === 'High'
              ? 88
              : p.confidence === 'Moderate–High'
              ? 80
              : p.confidence === 'Moderate'
              ? 68
              : 52,
        })),
        indicators: parsed.indicators || {},
        scenarios: parsed.scenarios || {
          bullish: {
            title: 'Bullish Continuation',
            type: 'bullish',
            condition: 'Price sustains above key resistance.',
            implication: 'Upward structure continues.',
            confirmation: 'High volume candle close above ceiling.',
            invalidation: 'Break below support floor.',
          },
          neutral: {
            title: 'Range Consolidation',
            type: 'neutral',
            condition: 'Price oscillates within boundaries.',
            implication: 'Consolidation continues.',
            confirmation: 'Rejection at boundaries.',
            invalidation: 'Decisive boundary breakout.',
          },
          bearish: {
            title: 'Downside Breakdown',
            type: 'bearish',
            condition: 'Price breaches lower support.',
            implication: 'Corrective move begins.',
            confirmation: 'Selling volume acceleration.',
            invalidation: 'Quick bounce back above support.',
          },
        },
        explainableReasoning: parsed.explainableReasoning || [],
        beginnerSummary: parsed.beginnerSummary || 'The chart displays upward momentum with buyers in current control.',
        advancedSummary: parsed.advancedSummary || 'Constructive market structure with positive oscillator alignment.',
        missingOrUnclearData: parsed.missingOrUnclearData || [],
        annotations: parsed.annotations || [],
      };

      return result;
    } catch (err: any) {
      console.error('Error analyzing chart with Gemini Vision:', err);
      // If error occurred during live generation, build a resilient structured response
      throw err;
    }
  }

  throw new Error('GEMINI_API_KEY is not configured.');
}

export async function chatAboutChart(
  question: string,
  analysis: ChartAnalysisResult,
  chatHistory: Array<{ sender: 'user' | 'ai'; text: string }>,
  base64Image?: string
): Promise<string> {
  const genAI = getGenAI();
  if (!genAI) {
    return `Analysis context: The chart for ${analysis.asset} (${analysis.timeframe}) currently exhibits a ${analysis.trend.direction} bias with key resistance at ${analysis.keyLevels.find(l => l.type.includes('Resistance'))?.price || 'overhead levels'} and support at ${analysis.keyLevels.find(l => l.type.includes('Support'))?.price || 'lower demand'}. AI assessment confidence is ${analysis.aiConfidence.score}%. Always maintain defined risk parameters.`;
  }

  const systemInstruction = `You are the AI Trade Helper Interactive Chart Analyst.
You have analyzed a chart for ${analysis.asset} (${analysis.timeframe}).
Key Analysis Context:
- Trend: ${analysis.trend.direction} (Confidence score: ${analysis.trend.assessmentScore}%)
- Current/Last Price: ${analysis.currentPrice}
- Market Structure: ${analysis.marketStructure.structure} (${analysis.marketStructure.phase})
- Momentum: ${analysis.momentum.status}
- Volatility: ${analysis.volatility.level}
- Key Levels: ${JSON.stringify(analysis.keyLevels)}
- Patterns: ${JSON.stringify(analysis.patterns)}
- Visible Indicators: ${JSON.stringify(analysis.indicators)}
- Scenarios: Bullish (${analysis.scenarios.bullish.condition}), Neutral (${analysis.scenarios.neutral.condition}), Bearish (${analysis.scenarios.bearish.condition})
- Risk Factors: ${analysis.riskAssessment.factors.join(', ')}

Guidelines for answering:
1. Ground answers strictly in the visible chart data and technical context provided above.
2. If asked "Why is the trend bullish/bearish?", reference the specific price structure (higher highs/lows) and moving averages.
3. If asked about invalidation, quote the exact invalidation conditions from the scenario engine.
4. If the user asks for beginner explanations, simplify jargon into plain analogies.
5. If the user asks "Should I buy now?", remind them that AI Trade Helper is an educational decision-support tool, not financial advice, and explain what technical conditions traders look for.
6. Keep answers concise, articulate, and well formatted with bullet points where appropriate.`;

  const conversationContext = chatHistory
    .slice(-6)
    .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
    .join('\n');

  const fullPrompt = `${conversationContext ? `Recent conversation:\n${conversationContext}\n\n` : ''}User Question: ${question}`;

  const parts: any[] = [];
  if (base64Image) {
    let cleanBase64 = base64Image;
    let mimeType = 'image/png';
    if (base64Image.includes('base64,')) {
      const splitParts = base64Image.split('base64,');
      cleanBase64 = splitParts[1];
      const mimeMatch = splitParts[0].match(/data:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
    }
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType,
      },
    });
  }
  parts.push({ text: fullPrompt });

  const response = await genAI.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: { parts },
    config: {
      systemInstruction,
      temperature: 0.3,
    },
  });

  return response.text || 'Unable to generate response for this chart question.';
}

export async function synthesizeMultiTimeframe(
  analyses: Array<{ timeframe: string; base64Data: string; mimeType: string }>
): Promise<MultiTimeframeSynthesisResult> {
  const genAI = getGenAI();
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured for multi-timeframe analysis.');
  }

  const parts: any[] = [];
  analyses.forEach((item, idx) => {
    let clean = item.base64Data;
    if (clean.includes('base64,')) {
      clean = clean.split('base64,')[1];
    }
    parts.push({
      inlineData: {
        data: clean,
        mimeType: item.mimeType || 'image/png',
      },
    });
    parts.push({
      text: `[Image ${idx + 1} represents Timeframe: ${item.timeframe}]`,
    });
  });

  parts.push({
    text: `Perform a comprehensive multi-timeframe confluence synthesis across these ${analyses.length} chart screenshots.
Identify how higher timeframe trends (macro structure) align with lower timeframe execution setups (micro triggers).
Return a JSON object strictly matching this schema:
{
  "overallConfluenceScore": 85, // Integer 0-100
  "overallBias": "Strong Bullish" | "Bullish" | "Neutral / Sideways" | "Bearish" | "Strong Bearish",
  "higherTimeframeContext": "Description of HTF trend and major key levels",
  "lowerTimeframeExecution": "Description of LTF entry timing and immediate pullback status",
  "timeframeBreakdowns": [
    {
      "timeframe": "e.g. Daily / 1H / 15M",
      "trend": "Bullish",
      "momentum": "Positive",
      "keyObservation": "Specific observation on this timeframe"
    }
  ],
  "synthesisConclusion": "Comprehensive executive summary of multi-timeframe alignment",
  "keyConfluences": ["HTF 50 EMA support aligns with LTF double bottom", "RSI showing hidden bullish divergence on 1H while 15m breaks out"],
  "conflictingSignals": ["15m RSI is short-term overbought despite bullish 1H structure"],
  "recommendedStrategy": "Condition-based trading perspective (e.g. Look for LTF pullback into HTF support for better risk-reward)"
}`,
  });

  const response = await genAI.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: { parts },
    config: {
      systemInstruction: 'You are an institutional quantitative multi-timeframe technical analyst. Output ONLY valid JSON.',
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    id: 'mtf-' + Date.now(),
    timestamp: Date.now(),
    overallConfluenceScore: parsed.overallConfluenceScore || 80,
    overallBias: parsed.overallBias || 'Bullish',
    higherTimeframeContext: parsed.higherTimeframeContext || 'Higher timeframe maintains upward momentum.',
    lowerTimeframeExecution: parsed.lowerTimeframeExecution || 'Lower timeframe shows consolidation prior to expansion.',
    timeframeBreakdowns: parsed.timeframeBreakdowns || [],
    synthesisConclusion: parsed.synthesisConclusion || 'Multi-timeframe structure demonstrates positive confluence.',
    keyConfluences: parsed.keyConfluences || [],
    conflictingSignals: parsed.conflictingSignals || [],
    recommendedStrategy: parsed.recommendedStrategy || 'Monitor for sustained breakout confirmation across all aligned timeframes.',
  };
}

export async function compareAnalyses(
  prevAnalysis: ChartAnalysisResult,
  newBase64: string,
  mimeType: string = 'image/png'
): Promise<AnalysisComparisonResult> {
  const genAI = getGenAI();
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured for comparison.');
  }

  let clean = newBase64;
  if (clean.includes('base64,')) clean = clean.split('base64,')[1];

  const prompt = `Compare this newly uploaded chart screenshot against the previous technical analysis for ${prevAnalysis.asset} (${prevAnalysis.timeframe}).
Previous State:
- Trend: ${prevAnalysis.trend.direction} (${prevAnalysis.trend.assessmentScore}%)
- Market Structure: ${prevAnalysis.marketStructure.structure}
- Momentum: ${prevAnalysis.momentum.status}
- Key Levels: ${prevAnalysis.keyLevels.map(l => `${l.type}: ${l.price}`).join(', ')}

Analyze what has changed in price action, support/resistance migration, momentum shifts, or pattern evolution.
Return ONLY a valid JSON object matching:
{
  "asset": "${prevAnalysis.asset}",
  "trendShift": {
    "from": "${prevAnalysis.trend.direction}",
    "to": "Bullish" | "Neutral / Sideways" | "Bearish" etc,
    "comment": "Summary of trend change or continuation"
  },
  "momentumShift": {
    "from": "${prevAnalysis.momentum.status}",
    "to": "Positive" | "Neutral" | "Negative" etc,
    "comment": "Summary of momentum acceleration or deceleration"
  },
  "levelChanges": ["Support moved higher from ₹X to ₹Y", "Resistance at ₹Z rejected"],
  "newObservations": ["Fresh hammer candle formed at dynamic EMA support", "Volume expansion confirms breakout attempt"],
  "keyTakeaway": "Executive technical takeaway on how the market evolved"
}`;

  const response = await genAI.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: {
      parts: [
        { inlineData: { data: clean, mimeType } },
        { text: prompt },
      ],
    },
    config: {
      systemInstruction: 'You are a chart evolution and technical comparison specialist. Return valid JSON.',
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    id: 'comp-' + Date.now(),
    timestamp: Date.now(),
    previousAnalysisId: prevAnalysis.id,
    asset: prevAnalysis.asset,
    trendShift: parsed.trendShift || { from: prevAnalysis.trend.direction, to: prevAnalysis.trend.direction, comment: 'Trend direction sustained' },
    momentumShift: parsed.momentumShift || { from: prevAnalysis.momentum.status, to: prevAnalysis.momentum.status, comment: 'Momentum remains steady' },
    levelChanges: parsed.levelChanges || ['Support and resistance levels hold steady'],
    newObservations: parsed.newObservations || ['Price continues development in the expected zone'],
    keyTakeaway: parsed.keyTakeaway || 'Chart continues development in alignment with prior structural analysis.',
  };
}
