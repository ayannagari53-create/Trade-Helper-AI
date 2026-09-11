import React from 'react';
import {
  TrendingUp,
  Layers,
  GitCompare,
  History,
  Info,
  Sparkles,
  BookOpen,
  Sliders,
  ShieldCheck,
  Flame,
  Bell,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'single' | 'multitimeframe' | 'compare' | 'history' | 'docs';
  setActiveTab: (tab: 'single' | 'multitimeframe' | 'compare' | 'history' | 'docs') => void;
  beginnerMode: boolean;
  setBeginnerMode: (val: boolean) => void;
  onTryDemo: () => void;
  historyCount: number;
  activeAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  beginnerMode,
  setBeginnerMode,
  onTryDemo,
  historyCount,
  activeAlertsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('single')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  AI Trade Helper
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  VISION AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Explainable Technical Chart Assistant
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'single'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Single Chart</span>
            </button>

            <button
              onClick={() => setActiveTab('multitimeframe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'multitimeframe'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Timeframe</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'compare'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Comparison Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History, Alerts & WL</span>
              {activeAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/25 border border-amber-500/40 text-[10px] text-amber-300 font-bold flex items-center gap-0.5">
                  <Bell className="w-2.5 h-2.5" />
                  {activeAlertsCount}
                </span>
              )}
              {activeAlertsCount === 0 && historyCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold flex items-center justify-center">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'docs'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Architecture & SIH Guide</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Beginner / Advanced Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setBeginnerMode(true)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  beginnerMode
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Simplified explanations with plain-English analogies"
              >
                Beginner
              </button>
              <button
                type="button"
                onClick={() => setBeginnerMode(false)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  !beginnerMode
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Institutional technical analysis, quantitative diagnostics and advanced metrics"
              >
                Advanced
              </button>
            </div>

            {/* Try Demo Button */}
            <button
              type="button"
              onClick={onTryDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Try Demo</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub Navigation */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/60 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === 'single' ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-slate-400'
            }`}
          >
            Single Chart
          </button>
          <button
            onClick={() => setActiveTab('multitimeframe')}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === 'multitimeframe' ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-slate-400'
            }`}
          >
            Multi-Timeframe
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === 'compare' ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-slate-400'
            }`}
          >
            Compare
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === 'history' ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-slate-400'
            }`}
          >
            History ({historyCount})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === 'docs' ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-slate-400'
            }`}
          >
            Architecture
          </button>
        </div>

      </div>
    </header>
  );
};
