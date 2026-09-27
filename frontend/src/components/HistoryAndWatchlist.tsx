import React, { useState, useEffect } from 'react';
import { ChartAnalysisResult, WatchlistItem, PriceAlert } from '../types';
import {
  History,
  Bookmark,
  TrendingUp,
  TrendingDown,
  Compass,
  Trash2,
  Eye,
  Plus,
  Edit2,
  Check,
  Search,
  SlidersHorizontal,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  Zap,
  RotateCcw,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  getStoredAlerts,
  deletePriceAlert,
  toggleAlertStatus,
  simulateTriggerAlert,
  resetTriggeredAlert,
  ALERTS_EVENT_NAME,
} from '../utils/alertStore';
import { SetAlertModal } from './SetAlertModal';

interface HistoryAndWatchlistProps {
  history: ChartAnalysisResult[];
  watchlist: WatchlistItem[];
  onSelectAnalysis: (analysis: ChartAnalysisResult) => void;
  onDeleteHistoryItem: (id: string) => void;
  onRemoveWatchlistItem: (id: string) => void;
  onUpdateWatchlistNotes: (id: string, notes: string) => void;
  onAlertTriggered?: (alert: PriceAlert) => void;
}

export const HistoryAndWatchlist: React.FC<HistoryAndWatchlistProps> = ({
  history,
  watchlist,
  onSelectAnalysis,
  onDeleteHistoryItem,
  onRemoveWatchlistItem,
  onUpdateWatchlistNotes,
  onAlertTriggered,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'watchlist' | 'alerts'>('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [biasFilter, setBiasFilter] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
  const [alertStatusFilter, setAlertStatusFilter] = useState<'all' | 'Active' | 'Triggered' | 'Disabled'>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');
  
  // Alerts state from local store
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isNewAlertModalOpen, setIsNewAlertModalOpen] = useState(false);

  // Subscribe to alert store
  useEffect(() => {
    const syncAlerts = () => {
      setAlerts(getStoredAlerts());
    };

    syncAlerts();
    window.addEventListener(ALERTS_EVENT_NAME, syncAlerts);
    window.addEventListener('storage', syncAlerts);

    return () => {
      window.removeEventListener(ALERTS_EVENT_NAME, syncAlerts);
      window.removeEventListener('storage', syncAlerts);
    };
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.timeframe.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBias =
      biasFilter === 'all' ||
      (biasFilter === 'bullish' && item.trend.direction.toLowerCase().includes('bullish')) ||
      (biasFilter === 'bearish' && item.trend.direction.toLowerCase().includes('bearish')) ||
      (biasFilter === 'neutral' && item.trend.direction.toLowerCase().includes('neutral'));
    return matchesSearch && matchesBias;
  });

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.targetPrice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.levelType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = alertStatusFilter === 'all' || a.status === alertStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStartEditNotes = (item: WatchlistItem) => {
    setEditingNotesId(item.id);
    setNotesInput(item.notes);
  };

  const handleSaveNotes = (id: string) => {
    onUpdateWatchlistNotes(id, notesInput);
    setEditingNotesId(null);
  };

  const handleDeleteAlert = (id: string) => {
    const updated = deletePriceAlert(id);
    setAlerts(updated);
  };

  const handleToggleStatus = (id: string) => {
    const updated = toggleAlertStatus(id);
    setAlerts(updated);
  };

  const handleSimulateTrigger = (id: string) => {
    const result = simulateTriggerAlert(id);
    setAlerts(result.alerts);
    if (result.triggeredAlert && onAlertTriggered) {
      onAlertTriggered(result.triggeredAlert);
    }
  };

  const handleResetAlert = (id: string) => {
    const updated = resetTriggeredAlert(id);
    setAlerts(updated);
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'Active').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Analysis History ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Watchlist ({watchlist.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Price Alerts ({alerts.length})</span>
            {activeAlertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500/30 text-[10px] text-amber-300 font-bold flex items-center justify-center border border-amber-500/50">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'alerts' ? "Search alerts..." : "Search ticker..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {activeTab === 'alerts' ? (
            <select
              value={alertStatusFilter}
              onChange={(e: any) => setAlertStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Triggered">Triggered Only</option>
              <option value="Disabled">Disabled Only</option>
            </select>
          ) : (
            <select
              value={biasFilter}
              onChange={(e: any) => setBiasFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Biases</option>
              <option value="bullish">Bullish Only</option>
              <option value="neutral">Neutral Only</option>
              <option value="bearish">Bearish Only</option>
            </select>
          )}
        </div>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="bg-[#121821] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <History className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-300">No Analysis History Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload and analyze a chart screenshot or try our one-click demos to populate your historical log.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#121821] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-['Plus_Jakarta_Sans']">
                          {item.asset}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.timeframe}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.trend.direction.includes('Bullish')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.trend.direction.includes('Bearish')
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.trend.direction}
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div className="h-32 rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F14]">
                      <img
                        src={item.imageUrl}
                        alt={item.asset}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <strong className="text-slate-200 font-mono">{item.currentPrice}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="text-emerald-400 font-mono">{item.aiConfidence.score}%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 pt-1">
                        {item.beginnerSummary}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => onSelectAnalysis(item)}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Report</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          {watchlist.length === 0 ? (
            <div className="bg-[#121821] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <Bookmark className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-300">Watchlist is Empty</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Save active technical setups to your Watchlist from any analysis report to monitor levels and note thesis parameters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {watchlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#121821] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm font-['Plus_Jakarta_Sans']">
                        {item.asset.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{item.asset}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.timeframe}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.trendBias.includes('Bullish')
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : item.trendBias.includes('Bearish')
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {item.trendBias}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Last Analyzed: {item.lastPrice} • {new Date(item.lastAnalyzed).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onRemoveWatchlistItem(item.id)}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Key Levels & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        Observed Levels
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.keyLevels.map((lvl, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700"
                          >
                            {lvl}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Notes Box */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                          User Trading Plan Notes
                        </span>
                        {editingNotesId !== item.id && (
                          <button
                            type="button"
                            onClick={() => handleStartEditNotes(item)}
                            className="text-slate-400 hover:text-emerald-400 text-[10px] flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        )}
                      </div>

                      {editingNotesId === item.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={notesInput}
                            onChange={(e) => setNotesInput(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(item.id)}
                            className="p-1 rounded bg-emerald-600 text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-300 text-xs">{item.notes || 'No custom notes added.'}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRICE ALERTS MANAGEMENT (Persistent Browser Store) */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121821] border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Persistent Browser-Based Price Alerts
              </h3>
              <p className="text-xs text-slate-400">
                Monitors key structural price levels identified during vision analysis and persists across browser reloads.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNewAlertModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Custom Alert</span>
            </button>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="bg-[#121821] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-300">No Alerts Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Set alerts on any Key Price Level from your analysis reports or create a custom target level.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewAlertModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  Create Your First Alert
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const isActive = alert.status === 'Active';
                const isTriggered = alert.status === 'Triggered';
                const isSupport = alert.levelType.toLowerCase().includes('support');
                const isResistance = alert.levelType.toLowerCase().includes('resistance');

                return (
                  <div
                    key={alert.id}
                    className={`bg-[#121821] border rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 transition-all ${
                      isTriggered
                        ? 'border-emerald-500/50 bg-emerald-950/10 shadow-emerald-950/30'
                        : isActive
                        ? 'border-slate-800 hover:border-slate-700'
                        : 'border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm ${
                            isTriggered
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : isActive
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              : 'bg-slate-800 border-slate-700 text-slate-500'
                          }`}
                        >
                          {isTriggered ? (
                            <BellRing className="w-5 h-5 animate-pulse text-emerald-400" />
                          ) : isActive ? (
                            <Bell className="w-5 h-5 text-amber-400" />
                          ) : (
                            <BellOff className="w-5 h-5 text-slate-500" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-extrabold text-white font-['Plus_Jakarta_Sans']">
                              {alert.asset}
                            </h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {alert.timeframe}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isSupport
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : isResistance
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              }`}
                            >
                              {alert.levelType}
                            </span>
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                                isTriggered
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : isActive
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {alert.status}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xs text-slate-400">Target Level:</span>
                            <span className="text-base font-mono font-bold text-white">
                              {alert.targetPrice}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              • Created {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                        {/* Simulate Trigger Button */}
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => handleSimulateTrigger(alert.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer"
                            title="Simulate price touching this level to test trigger and audio chime"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Simulate Hit</span>
                          </button>
                        )}

                        {/* Reset Triggered Button */}
                        {isTriggered && (
                          <button
                            type="button"
                            onClick={() => handleResetAlert(alert.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                            title="Reactivate this alert"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reactivate</span>
                          </button>
                        )}

                        {/* Toggle Disable / Enable */}
                        {!isTriggered && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(alert.id)}
                            className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
                          >
                            {isActive ? 'Disable' : 'Enable'}
                          </button>
                        )}

                        {/* Delete Alert */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer"
                          title="Delete alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">
                          Execution Logic:
                        </span>
                        <p className="text-slate-200 font-medium mt-0.5">{alert.condition}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">
                          Thesis Notes:
                        </span>
                        <p className="text-slate-300 text-xs mt-0.5">
                          {alert.notes || 'No custom notes provided.'}
                        </p>
                      </div>

                      {isTriggered && alert.triggeredAt && (
                        <div className="md:col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                          <span>🔔 Triggered at {new Date(alert.triggeredAt).toLocaleTimeString()}</span>
                          {alert.simulatedPrice && <span>Market Price: {alert.simulatedPrice}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal for creating a custom alert from the Alerts tab */}
      <SetAlertModal
        isOpen={isNewAlertModalOpen}
        onClose={() => setIsNewAlertModalOpen(false)}
        asset={history[0]?.asset || 'NIFTY 50'}
        timeframe={history[0]?.timeframe || '15m'}
        onAlertCreated={() => {
          setAlerts(getStoredAlerts());
        }}
      />
    </div>
  );
};
