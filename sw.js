// PVHS Tools — Service Worker
// Provides: offline caching + notification delivery support
const CACHE = 'pvhs-v2';
const PRECACHE = [
  './index.html',
  './countdown.html',
  './extension_search.html',
  './PV_Logo.png',
  './PV_AppIcon.png',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => cached);
    })
  );
});

// Receive notification requests from the page
self.addEventListener('message', e => {
  if (e.data?.type === 'PVHS_NOTIFY') {
    const { title, body, tag } = e.data;
    e.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon:  './PV_AppIcon.png',
        badge: './PV_AppIcon.png',
        tag:   tag || 'pvhs',
        renotify:            true,
        requireInteraction:  false,
        vibrate: [180, 80, 180]
      })
    );
  }
});
