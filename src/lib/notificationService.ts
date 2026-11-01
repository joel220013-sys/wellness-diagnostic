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
const BROADCAST_CHANNEL_NAME = 'wellness_order_notifications';

let globalAudioCtx: AudioContext | null = null;

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
export async function triggerOrderNotification(order: OrderNotificationPayload): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Play the audio chime
  playOrderChime();

  // 2. Broadcast to other open tabs in real-time
  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    channel.postMessage({ type: 'NEW_ORDER_ALERT', order });
    channel.close();
  } catch {}

  // 3. Show native OS notification banner on screen / phone lock-screen
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const title = `🔔 New Order Placed: #${order.reference}`;
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
          tag: `wellness-order-${order.id}`,
          renotify: true,
          requireInteraction: true,
          data: { url: targetUrl }
        } as any);
        return;
      }
    }

    // Fallback if service worker not ready
    const n = new Notification(title, {
      body,
      icon: '/logo-192.png',
      tag: `wellness-order-${order.id}`
    });
    n.onclick = () => {
      window.focus();
      window.location.href = targetUrl;
    };
  } catch (err) {
    console.warn('[NotificationService] Show notification error:', err);
  }
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
    if (event.data?.type === 'NEW_ORDER_ALERT' && event.data.order) {
      callback(event.data.order);
    }
  };

  return () => {
    try {
      channel.close();
    } catch {}
  };
}

