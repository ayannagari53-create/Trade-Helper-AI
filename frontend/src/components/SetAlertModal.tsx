import React, { useState, useEffect } from 'react';
import { PriceAlert, AlertTriggerCondition, KeyPriceLevel } from '../types';
import {
  createPriceAlert,
  playAlertAudioChime,
  findExistingAlert,
} from '../utils/alertStore';
import {
  Bell,
  CheckCircle2,
  X,
  Volume2,
  AlertCircle,
  Tag,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';

interface SetAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: string;
  timeframe: string;
  analysisId?: string;
  initialKeyLevel?: KeyPriceLevel | null;
  onAlertCreated?: (alert: PriceAlert) => void;
}

const TRIGGER_CONDITIONS: {
  value: AlertTriggerCondition;
  label: string;
  description: string;
  type: 'bullish' | 'bearish' | 'neutral';
}[] = [
  {
    value: 'Support Retest / Bounce',
    label: 'Support Retest / Bounce',
    description: 'Triggers when price pulls back into the support shelf and tests for demand.',
    type: 'bullish',
  },
  {
    value: 'Price Crosses Above',
    label: 'Price Crosses Above',
    description: 'Triggers immediately when market price surpasses this resistance ceiling.',
    type: 'bullish',
  },
  {
    value: 'Breakout Confirmation',
    label: 'Breakout Confirmation',
    description: 'Triggers when price sustains beyond the level on high volume.',
    type: 'bullish',
  },
  {
    value: 'Price Crosses Below',
    label: 'Price Crosses Below',
    description: 'Triggers when price falls through a support floor or breakdown level.',
    type: 'bearish',
  },
  {
    value: 'Resistance Rejection',
    label: 'Resistance Rejection',
    description: 'Triggers when price touches resistance and shows signs of upper wick rejection.',
    type: 'bearish',
  },
  {
    value: 'Price Touches Zone',
    label: 'Price Touches Zone (General)',
    description: 'Triggers as soon as the price enters this key structural zone.',
    type: 'neutral',
  },
];

export const SetAlertModal: React.FC<SetAlertModalProps> = ({
  isOpen,
  onClose,
  asset,
  timeframe,
  analysisId,
  initialKeyLevel,
  onAlertCreated,
}) => {
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [levelType, setLevelType] = useState<string>('Major Support');
  const [condition, setCondition] = useState<AlertTriggerCondition>('Price Touches Zone');
  const [notes, setNotes] = useState<string>('');
  const [soundNotification, setSoundNotification] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdAlert, setCreatedAlert] = useState<PriceAlert | null>(null);

  // Initialize form fields based on initialKeyLevel or defaults
  useEffect(() => {
    if (initialKeyLevel) {
      setTargetPrice(initialKeyLevel.price || '');
      setLevelType(initialKeyLevel.type || 'Key Level');
      setNotes(initialKeyLevel.significance ? `Key structural note: ${initialKeyLevel.significance}` : '');

      // Smart default condition based on level type
      if (initialKeyLevel.type.includes('Support')) {
        setCondition('Support Retest / Bounce');
      } else if (initialKeyLevel.type.includes('Resistance')) {
        setCondition('Price Crosses Above');
      } else {
        setCondition('Price Touches Zone');
      }
    } else {
      setTargetPrice('');
      setLevelType('Custom Level');
      setCondition('Price Touches Zone');
      setNotes('');
    }
    setIsSuccess(false);
    setCreatedAlert(null);
  }, [initialKeyLevel, isOpen]);

  if (!isOpen) return null;

  const handleTestChime = () => {
    playAlertAudioChime();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice.trim()) return;

    const alert = createPriceAlert({
      asset: asset || 'CURRENT ASSET',
      timeframe: timeframe || '15m',
      analysisId,
      keyLevelId: initialKeyLevel?.id,
      levelType,
      targetPrice: targetPrice.trim(),
      condition,
      notes: notes.trim(),
      soundNotification,
    });

    setCreatedAlert(alert);
    setIsSuccess(true);
    if (onAlertCreated) {
      onAlertCreated(alert);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#0F151F] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                Set Price Alert
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {asset} • {timeframe} timeframe
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isSuccess && createdAlert ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Price Alert Saved to Browser Store!</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Alert will actively monitor <strong className="text-white">{createdAlert.asset}</strong> at{' '}
                <strong className="text-emerald-400">{createdAlert.targetPrice}</strong> ({createdAlert.condition}).
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-400">
                <span>Trigger Condition:</span>
                <span className="font-semibold text-slate-200">{createdAlert.condition}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Level Type:</span>
                <span className="font-semibold text-slate-200">{createdAlert.levelType}</span>
              </div>
              {createdAlert.notes && (
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-500 font-bold">Notes: </span>
                  {createdAlert.notes}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Target Price & Level Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Target Price <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g. 24,840.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Level Category
                </label>
                <select
                  value={levelType}
                  onChange={(e) => setLevelType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="Major Support">Major Support</option>
                  <option value="Minor Support">Minor Support</option>
                  <option value="Major Resistance">Major Resistance</option>
                  <option value="Minor Resistance">Minor Resistance</option>
                  <option value="Current Pivot">Current Pivot / Equilibrium</option>
                  <option value="Custom Level">Custom Price Target</option>
                </select>
              </div>
            </div>

            {/* Trigger Condition Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Trigger Logic & Execution Condition
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRIGGER_CONDITIONS.map((cond) => {
                  const isSelected = condition === cond.value;
                  return (
                    <button
                      key={cond.value}
                      type="button"
                      onClick={() => setCondition(cond.value)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[12px]">{cond.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        {cond.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trade Thesis / Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Alert Notes & Decision Rule</span>
                <span className="text-[10px] text-slate-500 font-normal">Optional thesis reminder</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Check 15m RSI for bullish divergence upon test before executing entry."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 resize-none"
              />
            </div>

            {/* Notification Preference */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-white">Audio Chime Alert</span>
                  <p className="text-[10px] text-slate-400">Plays synthesized frequency chime when triggered</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestChime}
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  Test Chime
                </button>
                <input
                  type="checkbox"
                  checked={soundNotification}
                  onChange={(e) => setSoundNotification(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Save Alert to Store</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
