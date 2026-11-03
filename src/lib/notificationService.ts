/**
 * Wellness Diagnostic Center - Push Notifications & Audio Chime Service
 * Supports Web Audio API synthesis (works without external mp3 files)
 * and native Web Notification API with Service Worker fallback for Desktop and Mobile.
 */

export interface OrderNotificationPayload {
  id: string;
  reference: string;
  patientName: string;
  phone?: string;
  totalAmount: number;
  testName?: string;
  timeSlot?: string;
}

const STORAGE_KEY_SOUND = 'wellness_order_chime_enabled';
const STORAGE_KEY_SEEN_ORDERS = 'wellness_notified_orders_v2';
const BROADCAST_CHANNEL_NAME = 'wellness_order_notifications';

const CLIENT_TAB_ID = typeof window !== 'undefined' 
  ? `${Date.now()}_${Math.random().toString(36).substring(2, 9)}` 
  : 'server';

let globalAudioCtx: AudioContext | null = null;
let lastAlertTime = 0;
const MIN_ALERT_INTERVAL_MS = 2500; // Minimum interval between audible chimes

/**
 * Persistent deduplication: tracks which order IDs have already triggered an alert
 */
export function getSeenOrderIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEEN_ORDERS);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markOrderAsSeen(orderId: string): void {
  if (typeof window === 'undefined' || !orderId) return;
  try {
    const seen = getSeenOrderIds();
    seen.add(orderId);
    const arr = Array.from(seen).slice(-200); // Retain last 200 orders to keep storage light
    localStorage.setItem(STORAGE_KEY_SEEN_ORDERS, JSON.stringify(arr));
  } catch {}
}

export function isOrderAlreadySeen(orderId: string): boolean {
  if (!orderId) return true;
  return getSeenOrderIds().has(orderId);
}

/**
 * Initializes or resumes the Web Audio context after a user interaction
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
    globalAudioCtx = new AudioContextClass();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

/**
 * Play a high-clarity 4-tone ascending alert chime using native Web Audio API synthesis.
 * Fast attack with exponential harmonic bell decay.
 */
export function playOrderChime(): void {
  if (typeof window === 'undefined') return;

  // Check if sound alerts are enabled
  const soundPref = localStorage.getItem(STORAGE_KEY_SOUND);
  if (soundPref === 'false') return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Four musical chime tones: D5 (587.33 Hz) -> F#5 (739.99 Hz) -> A5 (880 Hz) -> High D6 (1174.66 Hz)
    const chimeTones = [
      { freq: 587.33, start: 0.0, dur: 0.35, gain: 0.35 },
      { freq: 739.99, start: 0.12, dur: 0.35, gain: 0.35 },
      { freq: 880.00, start: 0.24, dur: 0.45, gain: 0.45 },
      { freq: 1174.66, start: 0.38, dur: 0.8, gain: 0.55 },
    ];

    chimeTones.forEach(({ freq, start, dur, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      // Bell chime amplitude envelope
      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur);
    });

    // Mobile vibration pattern: buzz-pause-buzz
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([250, 100, 250, 100, 250]);
    }
  } catch (err) {
    console.warn('[NotificationService] Audio chime error:', err);
  }
}

/**
 * Register Service Worker for background push and notification click routing
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (e) {
    console.warn('[NotificationService] Service worker registration failed:', e);
    return null;
  }
}

/**
 * Request system notification permission (shows native prompt on Windows / Mac / Android / iOS)
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  // Ensure service worker is registered
  registerServiceWorker().catch(() => {});

  // Pre-unlock audio context on this user click
  getAudioContext();

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('[NotificationService] Permission request failed:', err);
    return 'denied';
  }
}

/**
 * Check current notification permission state
 */
export function getNotificationPermissionState(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Toggle sound chime alerts on/off
 */
export function setSoundAlertsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SOUND, enabled ? 'true' : 'false');
  if (enabled) {
    // Prime the audio context
    getAudioContext();
  }
}

/**
 * Get whether sound alerts are currently enabled (defaults to true)
 */
export function isSoundAlertsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY_SOUND) !== 'false';
}

/**
 * Trigger an OS-level push notification + chime sound for an order
 */
export async function triggerOrderNotification(
  order: OrderNotificationPayload,
  options?: { broadcast?: boolean; force?: boolean }
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const now = Date.now();
  const shouldBroadcast = options?.broadcast !== false;
  const isForce = options?.force === true;

  // Deduplication check: drop duplicate alert for the same order ID immediately
  if (!isForce && isOrderAlreadySeen(order.id)) {
    return false;
  }

  // Anti-spam throttling: enforce at least MIN_ALERT_INTERVAL_MS between audible chimes
  if (!isForce && (now - lastAlertTime < MIN_ALERT_INTERVAL_MS)) {
    return false;
  }

  lastAlertTime = now;
  markOrderAsSeen(order.id);

  // 1. Play the audio chime
  playOrderChime();

  // 2. Broadcast to other open tabs in real-time (with senderTabId to prevent echo loop)
  if (shouldBroadcast) {
    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({ 
        type: 'NEW_ORDER_ALERT', 
        order,
        senderTabId: CLIENT_TAB_ID 
      });
      channel.close();
    } catch {}
  }

  // 3. Show native OS notification banner on screen / phone lock-screen
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return true;
  }

  const cleanRef = order.reference || order.id;
  const title = `🔔 New Order Placed: #${cleanRef}`;
  const body = `Patient: ${order.patientName || 'New Patient'} • ₹${order.totalAmount || 0} • ${order.testName || 'Diagnostic Package'}\nSlot: ${order.timeSlot || 'Scheduled Home Collection'}`;
  const targetUrl = `/admin/orders`;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/logo-192.png',
          badge: '/logo-48.png',
          tag: `wellness-order-${cleanRef}`,
          renotify: true, // Trigger OS alert and chime for each order
          requireInteraction: true, // Keep notification pinned on desktop & phone lock-screen until acknowledged
          vibrate: [300, 100, 300, 100, 300],
          data: { url: targetUrl }
        } as any);
        return true;
      }
    }

    // Fallback if service worker not ready
    const n = new Notification(title, {
      body,
      icon: '/logo-192.png',
      badge: '/logo-48.png',
      tag: `wellness-order-${cleanRef}`,
      requireInteraction: true,
    } as any);
    n.onclick = () => {
      window.focus();
      window.location.href = targetUrl;
    };
  } catch (err) {
    console.warn('[NotificationService] Show notification error:', err);
  }
  return true;
}

/**
 * Broadcast channel listener for multi-tab synchronization
 */
export function listenForOrderAlerts(callback: (order: OrderNotificationPayload) => void): () => void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return () => {};
  }

  const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  channel.onmessage = (event) => {
    // Ignore message originating from the same tab to avoid self-echoes
    if (event.data?.senderTabId === CLIENT_TAB_ID) return;

    if (event.data?.type === 'NEW_ORDER_ALERT' && event.data.order) {
      const order = event.data.order;
      if (isOrderAlreadySeen(order.id)) return;
      callback(order);
    }
  };

  return () => {
    try {
      channel.close();
    } catch {}
  };
}

