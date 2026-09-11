import { PriceAlert, AlertTriggerCondition, AlertStatus } from '../types';

const STORAGE_KEY = 'ai_trade_helper_price_alerts_v1';
const ALERTS_EVENT_NAME = 'ai_trade_alerts_changed';

// Initial sample alerts to provide immediate utility out-of-the-box
const INITIAL_DEMO_ALERTS: PriceAlert[] = [
  {
    id: 'alert-sample-1',
    asset: 'NIFTY 50',
    timeframe: '15m',
    levelType: 'Major Support',
    targetPrice: '24,840.00',
    numericPrice: 24840,
    condition: 'Support Retest / Bounce',
    notes: 'Primary multi-week demand shelf. Look for bullish pin-bar or lower wick rejection before considering pullback longs.',
    soundNotification: true,
    createdAt: Date.now() - 3600000 * 4,
    status: 'Active',
  },
  {
    id: 'alert-sample-2',
    asset: 'BTC/USDT',
    timeframe: '4H',
    levelType: 'Major Resistance',
    targetPrice: '$68,400.00',
    numericPrice: 68400,
    condition: 'Price Crosses Above',
    notes: 'Range high breakout level. Wait for 4H candle close with expanding volume for breakout confirmation.',
    soundNotification: true,
    createdAt: Date.now() - 3600000 * 12,
    status: 'Active',
  },
  {
    id: 'alert-sample-3',
    asset: 'RELIANCE',
    timeframe: '1D',
    levelType: 'Minor Resistance',
    targetPrice: '₹3,020.00',
    numericPrice: 3020,
    condition: 'Price Touches Zone',
    notes: 'Descending trendline supply zone. Monitor for momentum slowdown.',
    soundNotification: false,
    createdAt: Date.now() - 3600000 * 24,
    status: 'Triggered',
    triggeredAt: Date.now() - 3600000 * 2,
    simulatedPrice: '₹3,022.50',
  },
];

/**
 * Reads alerts from persistent browser localStorage.
 */
export function getStoredAlerts(): PriceAlert[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_ALERTS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial sample data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ALERTS));
      return INITIAL_DEMO_ALERTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse alerts from localStorage, resetting:', err);
  }

  return INITIAL_DEMO_ALERTS;
}

/**
 * Saves a list of alerts to localStorage and emits an update event.
 */
function persistAlerts(alerts: PriceAlert[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    window.dispatchEvent(new CustomEvent(ALERTS_EVENT_NAME, { detail: alerts }));
  } catch (err) {
    console.error('Failed to persist alerts in localStorage:', err);
  }
}

/**
 * Creates and saves a new Price Alert.
 */
export function createPriceAlert(
  data: Omit<PriceAlert, 'id' | 'createdAt' | 'status'> & Partial<PriceAlert>
): PriceAlert {
  const current = getStoredAlerts();
  
  const newAlert: PriceAlert = {
    id: data.id || `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    asset: data.asset || 'UNKNOWN',
    timeframe: data.timeframe || '15m',
    levelType: data.levelType || 'Key Level',
    targetPrice: data.targetPrice,
    numericPrice: data.numericPrice || parseNumericPrice(data.targetPrice),
    condition: data.condition || 'Price Touches Zone',
    notes: data.notes || '',
    soundNotification: data.soundNotification !== undefined ? data.soundNotification : true,
    keyLevelId: data.keyLevelId,
    analysisId: data.analysisId,
    createdAt: Date.now(),
    status: 'Active',
  };

  const updated = [newAlert, ...current];
  persistAlerts(updated);
  return newAlert;
}

/**
 * Updates an existing alert by ID.
 */
export function updatePriceAlert(id: string, updates: Partial<PriceAlert>): PriceAlert[] {
  const current = getStoredAlerts();
  const updated = current.map((a) => (a.id === id ? { ...a, ...updates } : a));
  persistAlerts(updated);
  return updated;
}

/**
 * Deletes an alert by ID.
 */
export function deletePriceAlert(id: string): PriceAlert[] {
  const current = getStoredAlerts();
  const updated = current.filter((a) => a.id !== id);
  persistAlerts(updated);
  return updated;
}

/**
 * Toggles an alert status between Active and Disabled.
 */
export function toggleAlertStatus(id: string): PriceAlert[] {
  const current = getStoredAlerts();
  const updated: PriceAlert[] = current.map((a) => {
    if (a.id === id) {
      const nextStatus: AlertStatus = a.status === 'Active' ? 'Disabled' : 'Active';
      return { ...a, status: nextStatus };
    }
    return a;
  });
  persistAlerts(updated);
  return updated;
}

/**
 * Returns count of currently active alerts.
 */
export function getActiveAlertsCount(): number {
  return getStoredAlerts().filter((a) => a.status === 'Active').length;
}

/**
 * Simulates triggering an alert with test price action.
 */
export function simulateTriggerAlert(id: string, testPrice?: string): { alerts: PriceAlert[]; triggeredAlert: PriceAlert | null } {
  const current = getStoredAlerts();
  let triggeredAlert: PriceAlert | null = null;

  const updated = current.map((a) => {
    if (a.id === id) {
      triggeredAlert = {
        ...a,
        status: 'Triggered',
        triggeredAt: Date.now(),
        simulatedPrice: testPrice || a.targetPrice,
      };
      return triggeredAlert;
    }
    return a;
  });

  persistAlerts(updated);

  // Play audio chime if sound is enabled
  if (triggeredAlert && (triggeredAlert as PriceAlert).soundNotification) {
    playAlertAudioChime();
  }

  return { alerts: updated, triggeredAlert };
}

/**
 * Resets a triggered alert back to Active.
 */
export function resetTriggeredAlert(id: string): PriceAlert[] {
  const current = getStoredAlerts();
  const updated = current.map((a) => {
    if (a.id === id) {
      return {
        ...a,
        status: 'Active' as const,
        triggeredAt: undefined,
        simulatedPrice: undefined,
      };
    }
    return a;
  });
  persistAlerts(updated);
  return updated;
}

/**
 * Helper to check if an active alert already exists for a specific asset & key level price.
 */
export function findExistingAlert(asset: string, targetPrice: string): PriceAlert | undefined {
  const alerts = getStoredAlerts();
  return alerts.find(
    (a) =>
      a.asset.toLowerCase().trim() === asset.toLowerCase().trim() &&
      a.targetPrice.replace(/[^0-9.]/g, '') === targetPrice.replace(/[^0-9.]/g, '') &&
      a.status === 'Active'
  );
}

/**
 * Synthesizes a pleasant audio chime using the Web Audio API without requiring external audio files.
 */
export function playAlertAudioChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Note 1: E6 (1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Note 2: B6 (1975.5 Hz) - higher harmonic chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1975.53, now + 0.09);
    gain2.gain.setValueAtTime(0.12, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.debug('Audio chime synthesis skipped or blocked by browser gesture policy:', err);
  }
}

/**
 * Extracts raw numeric value from price string (e.g. "₹24,840.50" -> 24840.5).
 */
export function parseNumericPrice(priceStr: string): number | undefined {
  if (!priceStr) return undefined;
  const cleaned = priceStr.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

export { ALERTS_EVENT_NAME };
