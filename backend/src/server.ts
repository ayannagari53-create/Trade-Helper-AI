import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeChartImage, chatAboutChart, synthesizeMultiTimeframe, compareAnalyses } from './services/geminiService';
import { ChartAnalysisResult, WatchlistItem } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware for JSON body parsing with large payload limit for base64 screenshots
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory persistence store
const analysisStore: Map<string, ChartAnalysisResult> = new Map();
const watchlistStore: Map<string, WatchlistItem> = new Map();
const feedbackStore: Array<{
  id: string;
  timestamp: number;
  analysisId?: string;
  rating: 'helpful' | 'not_helpful';
  reason?: string;
  comment?: string;
}> = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
    version: '1.0.0',
    service: 'AI Trade Helper Backend',
  });
});

// Analyze single chart screenshot
app.post('/api/analyze-chart', async (req, res) => {
  try {
    const { imageBase64, mimeType, timeframeHint, assetHint, mode } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided. Please upload a valid chart screenshot.' });
    }

    const result = await analyzeChartImage(imageBase64, mimeType || 'image/png', {
      timeframeHint,
      assetHint,
      mode,
    });

    // Save to store
    analysisStore.set(result.id, result);

    res.json(result);
  } catch (error: any) {
    console.error('API /api/analyze-chart error:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze chart screenshot. Please check image clarity and try again.',
    });
  }
});

// Chat with your chart
app.post('/api/chart/chat', async (req, res) => {
  try {
    const { question, analysis, chatHistory, imageBase64 } = req.body;
    if (!question || !analysis) {
      return res.status(400).json({ error: 'Question and analysis context are required.' });
    }

    const answer = await chatAboutChart(question, analysis, chatHistory || [], imageBase64);
    res.json({ answer });
  } catch (error: any) {
    console.error('API /api/chart/chat error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate chart answer.',
    });
  }
});

// Multi-timeframe synthesis
app.post('/api/analyze-chart/multi-timeframe', async (req, res) => {
  try {
    const { analyses } = req.body;
    if (!analyses || !Array.isArray(analyses) || analyses.length < 2) {
      return res.status(400).json({ error: 'At least 2 timeframe screenshots are required for multi-timeframe synthesis.' });
    }

    const result = await synthesizeMultiTimeframe(analyses);
    res.json(result);
  } catch (error: any) {
    console.error('API /api/analyze-chart/multi-timeframe error:', error);
    res.status(500).json({
      error: error.message || 'Failed to perform multi-timeframe analysis.',
    });
  }
});

// Compare previous vs new screenshot
app.post('/api/analysis/compare', async (req, res) => {
  try {
    const { previousAnalysis, newImageBase64, mimeType } = req.body;
    if (!previousAnalysis || !newImageBase64) {
      return res.status(400).json({ error: 'Previous analysis and new chart image are required for comparison.' });
    }

    const comparison = await compareAnalyses(previousAnalysis, newImageBase64, mimeType || 'image/png');
    res.json(comparison);
  } catch (error: any) {
    console.error('API /api/analysis/compare error:', error);
    res.status(500).json({
      error: error.message || 'Failed to compare chart screenshots.',
    });
  }
});

// Analyses History CRUD
app.get('/api/analyses', (req, res) => {
  const list = Array.from(analysisStore.values()).sort((a, b) => b.timestamp - a.timestamp);
  res.json(list);
});

app.get('/api/analyses/:id', (req, res) => {
  const item = analysisStore.get(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Analysis not found.' });
  }
  res.json(item);
});

app.post('/api/analyses', (req, res) => {
  const analysis: ChartAnalysisResult = req.body;
  if (!analysis.id) {
    analysis.id = 'analysis-' + Date.now();
  }
  analysisStore.set(analysis.id, analysis);
  res.json(analysis);
});

app.delete('/api/analyses/:id', (req, res) => {
  const deleted = analysisStore.delete(req.params.id);
  res.json({ success: deleted });
});

// Watchlist CRUD
app.get('/api/watchlist', (req, res) => {
  const items = Array.from(watchlistStore.values()).sort((a, b) => b.lastUpdated - a.lastUpdated);
  res.json(items);
});

app.post('/api/watchlist', (req, res) => {
  const item: WatchlistItem = req.body;
  if (!item.id) {
    item.id = 'wl-' + Date.now();
  }
  item.lastUpdated = Date.now();
  watchlistStore.set(item.id, item);
  res.json(item);
});

app.delete('/api/watchlist/:id', (req, res) => {
  const deleted = watchlistStore.delete(req.params.id);
  res.json({ success: deleted });
});

// Feedback API
app.post('/api/feedback', (req, res) => {
  const { analysisId, rating, reason, comment } = req.body;
  const fb = {
    id: 'fb-' + Date.now(),
    timestamp: Date.now(),
    analysisId,
    rating: rating || ('helpful' as const),
    reason,
    comment,
  };
  feedbackStore.push(fb);
  res.json({ success: true, feedback: fb });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
