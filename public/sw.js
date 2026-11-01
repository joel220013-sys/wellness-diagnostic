// Wellness Diagnostic Center - Service Worker for Web Push & Offline Alerts
const CACHE_NAME = 'wellness-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle clicks on native OS push notifications (Windows, Mac, Android, iOS)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If portal tab is already open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes('/admin') || client.url.includes('/driver')) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Otherwise open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle background Web Push events
self.addEventListener('push', (event) => {
  let title = '🔔 Wellness Diagnostic - New Order!';
  let options = {
    body: 'A new patient diagnostic order has just been placed.',
    icon: '/logo-192.png',
    badge: '/logo-48.png',
    vibrate: [250, 100, 250, 100, 250],
    tag: 'wellness-order-alert',
    renotify: true,
    requireInteraction: true,
    data: { url: '/admin/orders' },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      if (data.title) title = data.title;
      if (data.body) options.body = data.body;
      if (data.url) options.data.url = data.url;
      if (data.tag) options.tag = data.tag;
    } catch (e) {
      options.body = event.data.text();
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

