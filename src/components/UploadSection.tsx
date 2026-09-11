import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  Zap,
  Clock,
  Tag,
  CheckCircle2,
  Trash2,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { DEMO_CHARTS } from '../data/demoCharts';
import { DemoChartItem } from '../types';

interface UploadSectionProps {
  onAnalyze: (payload: {
    imageBase64: string;
    mimeType: string;
    timeframeHint?: string;
    assetHint?: string;
  }) => void;
  onSelectDemo: (demo: DemoChartItem) => void;
  isLoading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onAnalyze,
  onSelectDemo,
  isLoading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [imageWarning, setImageWarning] = useState<string | null>(null);
  
  // Optional hints
  const [assetHint, setAssetHint] = useState<string>('');
  const [timeframeHint, setTimeframeHint] = useState<string>('');
  const [showAdvancedHints, setShowAdvancedHints] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler for quick Ctrl+V screenshot paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              processFile(blob);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFile = (file: File) => {
    setImageWarning(null);

    // Validation 1: File format
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setImageWarning('Unsupported format. Please upload PNG, JPG, JPEG, or WEBP chart screenshots.');
      return;
    }

    // Validation 2: File size (limit to 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setImageWarning('File size too large (max 15MB). Please upload a compressed screenshot.');
      return;
    }

    setFileName(file.name);
    setFileSizeStr((file.size / 1024).toFixed(1) + ' KB');
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);

      // Validation 3: Image dimensions check
      const img = new Image();
      img.onload = () => {
        if (img.width < 300 || img.height < 200) {
          setImageWarning('⚠️ Screenshot resolution is low. The AI may struggle to read price scales or tiny indicators.');
        } else if (img.width / img.height > 3.5 || img.height / img.width > 3.5) {
          setImageWarning('⚠️ Unusual aspect ratio detected. Ensure the price axis and indicator panels are not cropped out.');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleTriggerAnalyze = () => {
    if (!selectedImage) return;
    onAnalyze({
      imageBase64: selectedImage,
      mimeType,
      assetHint: assetHint.trim() || undefined,
      timeframeHint: timeframeHint.trim() || undefined,
    });
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setFileName('');
    setFileSizeStr('');
    setImageWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="w-full space-y-6">
      {/* Hero Headline */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Multimodal Vision Technical Analysis Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Turn Your Chart Screenshot Into an{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Intelligent Market Analysis
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Upload any trading chart screenshot. The AI visually inspects candles, indicators, support/resistance, and market structure to construct explainable, scenario-based insights.
        </p>
      </div>

      {/* Main Upload Container */}
      <div className="max-w-4xl mx-auto bg-[#121821] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {!selectedImage ? (
          /* Drag & Drop Area */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
              dragActive
                ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                : 'border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-900/40 bg-slate-900/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-200">
                Drop your chart screenshot here, or{' '}
                <span className="text-emerald-400 underline underline-offset-4">browse files</span>
              </p>
              <p className="text-xs text-slate-400">
                Supports PNG, JPG, JPEG, WEBP • Max 15MB • <span className="text-slate-300 font-mono">Ctrl+V / ⌘+V</span> to paste
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Candlesticks & Price Action
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> EMAs, RSI, MACD & Volume
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Key Support / Resistance
              </span>
            </div>
          </div>
        ) : (
          /* Preview & Action Controls */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">{fileName || 'Chart Screenshot Preview'}</span>
                {fileSizeStr && (
                  <span className="text-xs text-slate-400 font-mono">({fileSizeStr})</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearImage}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Replace Screenshot</span>
              </button>
            </div>

            {/* Image Box */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F14] max-h-[380px] flex items-center justify-center group">
              <img
                src={selectedImage}
                alt="Selected chart preview"
                className="max-h-[380px] w-auto object-contain mx-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-3 left-3 text-[11px] bg-slate-900/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded backdrop-blur">
                Ready for AI Vision Extraction
              </span>
            </div>

            {/* Optional Context Drawer */}
            <div className="border border-slate-800/80 rounded-xl p-3 bg-slate-900/40 space-y-3">
              <div
                onClick={() => setShowAdvancedHints(!showAdvancedHints)}
                className="flex items-center justify-between text-xs font-medium text-slate-300 cursor-pointer hover:text-emerald-400 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Optional Chart Context (Asset Name, Timeframe)</span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  {showAdvancedHints ? 'Hide' : 'Add context (helps precision)'}
                </span>
              </div>

              {showAdvancedHints && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Asset / Ticker Symbol (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NIFTY 50, BTC/USDT, TSLA"
                      value={assetHint}
                      onChange={(e) => setAssetHint(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Timeframe (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5m, 15m, 1h, Daily"
                      value={timeframeHint}
                      onChange={(e) => setTimeframeHint(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quality Warning if any */}
            {imageWarning && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <p>{imageWarning}</p>
              </div>
            )}

            {/* Analyze Action Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClearImage}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleTriggerAnalyze}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'Scanning Chart...' : 'Analyze Chart Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Demo Chart Quick Launcher Section */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                Or Try One-Click Demo Charts
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Instant evaluation with real market archetypes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DEMO_CHARTS.slice(0, 5).map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => onSelectDemo(demo)}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-emerald-500/30">
                  <TrendingUp className={`w-4 h-4 ${
                    demo.bias === 'Bullish' ? 'text-emerald-400' : demo.bias === 'Bearish' ? 'text-red-400' : 'text-amber-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-200 truncate group-hover:text-emerald-300">
                      {demo.name}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      demo.bias === 'Bullish'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : demo.bias === 'Bearish'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {demo.bias}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{demo.pattern}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
