const CACHE_NAME = 'brew-finder-cache-v1';
const OFFLINE_URL = '/index.html';

// Files to precache (keep minimal; Vite will fingerprint assets in production)
const PRECACHE = [
  '/',
  OFFLINE_URL,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // delete old caches if any
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => { if (k !== CACHE_NAME) return caches.delete(k); }));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // For navigation requests, try network then fallback to cache (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // For other requests (assets/images), use cache-first then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Put a copy in cache for future
        return caches.open(CACHE_NAME).then((cache) => {
          // Avoid caching opaque responses (cross-origin) to prevent errors
          if (response && response.status === 200 && response.type !== 'opaque') {
            cache.put(request, response.clone());
          }
          return response;
        });
      }).catch(() => {
        // final fallback to cached offline page
        return caches.match(OFFLINE_URL);
      });
    })
  );
});
