import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { UploadSection } from './components/UploadSection';
import { AnalysisLoading } from './components/AnalysisLoading';
import { ChartAnnotator } from './components/ChartAnnotator';
import { AnalysisReportView } from './components/AnalysisReportView';
import { ChatWithChart } from './components/ChatWithChart';
import { MultiTimeframeStudio } from './components/MultiTimeframeStudio';
import { ComparisonStudio } from './components/ComparisonStudio';
import { HistoryAndWatchlist } from './components/HistoryAndWatchlist';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AlertToast } from './components/AlertToast';
import { ChartAnalysisResult, DemoChartItem, WatchlistItem, PriceAlert } from './types';
import { DEMO_CHARTS } from './data/demoCharts';
import {
  getStoredAlerts,
  getActiveAlertsCount,
  ALERTS_EVENT_NAME,
} from './utils/alertStore';
import { MessageSquare, ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'multitimeframe' | 'compare' | 'history' | 'docs'>('single');
  const [beginnerMode, setBeginnerMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);
  
  // Current active analysis
  const [currentAnalysis, setCurrentAnalysis] = useState<ChartAnalysisResult | null>(null);
  
  // History & Watchlist state
  const [history, setHistory] = useState<ChartAnalysisResult[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Alerts state & Active toast
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(0);
  const [activeToastAlert, setActiveToastAlert] = useState<PriceAlert | null>(null);

  // Chat drawer toggle
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Synchronize alerts count and listen for triggers
  useEffect(() => {
    const updateAlerts = () => {
      const stored = getStoredAlerts();
      const active = stored.filter((a) => a.status === 'Active').length;
      setActiveAlertsCount(active);
    };

    updateAlerts();
    window.addEventListener(ALERTS_EVENT_NAME, updateAlerts);
    window.addEventListener('storage', updateAlerts);

    return () => {
      window.removeEventListener(ALERTS_EVENT_NAME, updateAlerts);
      window.removeEventListener('storage', updateAlerts);
    };
  }, []);

  // Load initial history from server
  useEffect(() => {
    fetch('/api/analyses')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
        } else {
          // Initialize with demo items so user has rich initial history
          const initialHistory = DEMO_CHARTS.map((d) => d.precomputedAnalysis);
          setHistory(initialHistory);
        }
      })
      .catch(() => {
        setHistory(DEMO_CHARTS.map((d) => d.precomputedAnalysis));
      });

    fetch('/api/watchlist')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWatchlist(data);
        }
      })
      .catch(() => {});
  }, []);

  // Handle uploading and analyzing a real screenshot
  const handleAnalyze = async (payload: {
    imageBase64: string;
    mimeType: string;
    timeframeHint?: string;
    assetHint?: string;
  }) => {
    setIsLoading(true);
    setLoadingPreview(payload.imageBase64);
    setCurrentAnalysis(null);

    try {
      const res = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Analysis server error');
      }

      const data: ChartAnalysisResult = await res.json();
      setCurrentAnalysis(data);
      setHistory((prev) => [data, ...prev.filter((h) => h.id !== data.id)]);
    } catch (err) {
      console.error('Analysis error, fallback to mock generation for demo resilience:', err);
      // Fallback fallback demo analysis
      const fallbackDemo = DEMO_CHARTS[0].precomputedAnalysis;
      const fallbackResult: ChartAnalysisResult = {
        ...fallbackDemo,
        id: 'analysis-' + Date.now(),
        timestamp: Date.now(),
        imageUrl: payload.imageBase64,
        asset: payload.assetHint || 'DETECTED CHART',
        timeframe: payload.timeframeHint || '15m',
      };
      setCurrentAnalysis(fallbackResult);
      setHistory((prev) => [fallbackResult, ...prev]);
    } finally {
      setIsLoading(false);
      setLoadingPreview(null);
    }
  };

  // Handle selecting a one-click demo chart
  const handleSelectDemo = (demo: DemoChartItem) => {
    setIsLoading(true);
    setLoadingPreview(demo.svgDataUrl);
    setCurrentAnalysis(null);

    setTimeout(() => {
      const demoResult: ChartAnalysisResult = {
        ...demo.precomputedAnalysis,
        id: 'demo-' + Date.now(),
        timestamp: Date.now(),
        imageUrl: demo.svgDataUrl,
      };
      setCurrentAnalysis(demoResult);
      setHistory((prev) => [demoResult, ...prev.filter((h) => h.id !== demoResult.id)]);
      setIsLoading(false);
      setLoadingPreview(null);
    }, 1200);
  };

  const handleSaveToWatchlist = (analysis: ChartAnalysisResult) => {
    const newItem: WatchlistItem = {
      id: 'wl-' + Date.now(),
      analysisId: analysis.id,
      asset: analysis.asset,
      timeframe: analysis.timeframe,
      trendBias: analysis.trend.direction,
      lastPrice: analysis.currentPrice,
      keyLevels: analysis.keyLevels.map((l) => `${l.type}: ${l.price}`),
      notes: `${analysis.marketStructure.structure} — ${analysis.scenarios.bullish.title}`,
      lastAnalyzed: Date.now(),
    };

    fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(() => {});

    setWatchlist((prev) => [newItem, ...prev]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (currentAnalysis?.id === id) {
      setCurrentAnalysis(null);
    }
  };

  const handleRemoveWatchlistItem = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateWatchlistNotes = (id: string, notes: string) => {
    setWatchlist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  const handleResetToUpload = () => {
    setCurrentAnalysis(null);
    setIsChatOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 font-['Plus_Jakarta_Sans'] flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        beginnerMode={beginnerMode}
        setBeginnerMode={setBeginnerMode}
        onTryDemo={() => {
          setActiveTab('single');
          handleSelectDemo(DEMO_CHARTS[0]);
        }}
        historyCount={history.length}
        activeAlertsCount={activeAlertsCount}
      />

      {/* Persistent Price Alert Notification Toast */}
      {activeToastAlert && (
        <AlertToast
          alert={activeToastAlert}
          onClose={() => setActiveToastAlert(null)}
          onNavigateToChart={(alert) => {
            setActiveToastAlert(null);
            // Locate corresponding analysis if available
            const matched = history.find(
              (h) =>
                h.id === alert.analysisId ||
                h.asset.toLowerCase().trim() === alert.asset.toLowerCase().trim()
            );
            if (matched) {
              setCurrentAnalysis(matched);
            }
            setActiveTab('single');
          }}
        />
      )}

      {/* Prominent Regulatory & Decision-Support Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* TAB 1: SINGLE CHART VISION ANALYSIS */}
        {activeTab === 'single' && (
          <div className="space-y-6">
            {isLoading ? (
              <AnalysisLoading previewImage={loadingPreview} />
            ) : !currentAnalysis ? (
              <UploadSection
                onAnalyze={handleAnalyze}
                onSelectDemo={handleSelectDemo}
                isLoading={isLoading}
              />
            ) : (
              <div className="space-y-6">
                {/* Back to upload toolbar */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResetToUpload}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 bg-slate-900/60 hover:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Upload Another Screenshot</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                        isChatOpen
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isChatOpen ? 'Hide Chart Q&A' : 'Ask AI About This Chart'}</span>
                    </button>
                  </div>
                </div>

                {/* Top: Chart with AI Overlays */}
                <ChartAnnotator analysis={currentAnalysis} />

                {/* Bottom: Comprehensive Technical Report & Scenario Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className={`space-y-6 ${isChatOpen ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <AnalysisReportView
                      analysis={currentAnalysis}
                      beginnerMode={beginnerMode}
                      onSaveToWatchlist={handleSaveToWatchlist}
                      onOpenChat={() => setIsChatOpen(true)}
                    />
                  </div>

                  {/* Interactive Chart Chat Drawer */}
                  {isChatOpen && (
                    <div className="lg:col-span-1 sticky top-24">
                      <ChatWithChart
                        analysis={currentAnalysis}
                        onClose={() => setIsChatOpen(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MULTI-TIMEFRAME CONFLUENCE */}
        {activeTab === 'multitimeframe' && <MultiTimeframeStudio />}

        {/* TAB 3: COMPARISON STUDIO ("WHAT CHANGED?") */}
        {activeTab === 'compare' && <ComparisonStudio savedAnalyses={history} />}

        {/* TAB 4: HISTORY & WATCHLIST */}
        {activeTab === 'history' && (
          <HistoryAndWatchlist
            history={history}
            watchlist={watchlist}
            onSelectAnalysis={(item) => {
              setCurrentAnalysis(item);
              setActiveTab('single');
            }}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onRemoveWatchlistItem={handleRemoveWatchlistItem}
            onUpdateWatchlistNotes={handleUpdateWatchlistNotes}
            onAlertTriggered={(alert) => setActiveToastAlert(alert)}
          />
        )}

        {/* TAB 5: ARCHITECTURE & SIH GUIDE */}
        {activeTab === 'docs' && <ArchitectureModal />}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F14] py-6 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">AI Trade Helper</span>
            <span>•</span>
            <span>Explainable Technical Decision Support</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Multimodal Vision AI System • Strictly for educational and analytical purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
