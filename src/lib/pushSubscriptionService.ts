/**
 * Wellness Diagnostic Center - Client Push Subscription Service
 * Subscribes mobile phones and desktop browsers to real Web Push notifications
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BFM_bW4TKwTStNxt4lfrvviHeug1NVRIQQ4KzCC3QtlLxt7g4pwPl-_SNFf8ZIja5x2VCkJI9hvMZdFyj7cWIIE';

/**
 * Register mobile phone or desktop with the server for remote Web Push alerts
 */
export async function registerPushDevice(userInfo?: { userId?: string; role?: string }): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Push notifications not supported on this device/browser');
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg) return false;

    // Check existing subscription
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as any,
      });
    }

    if (!subscription) return false;

    // Send subscription to server
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId: userInfo?.userId || 'admin',
        userRole: userInfo?.role || 'admin',
        userAgent: navigator.userAgent,
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn('[Push] Error subscribing device to push server:', err);
    return false;
  }
}
