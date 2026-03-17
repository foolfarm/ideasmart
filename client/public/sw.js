// IDEASMART Service Worker — PWA offline-first caching
// In development mode (Vite dev server), this SW self-unregisters to prevent
// caching issues with @vite/client HMR WebSocket connections.
const CACHE_NAME = 'ideasmart-v5';

// Self-unregister in dev mode: check if the server is Vite dev server
// by verifying that /@vite/client responds with JavaScript (not HTML fallback).
// In production, Express serves index.html (text/html) for unknown paths.
// In dev, Vite serves the real @vite/client (text/javascript).
fetch('/@vite/client', { method: 'HEAD' }).then((res) => {
  const ct = res.headers.get('content-type') || '';
  const isDevMode = res.ok && ct.includes('javascript');
  if (isDevMode) {
    // We're in dev mode — unregister this SW and clear all caches
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => {
      return self.registration.unregister();
    }).then(() => {
      // Force reload all controlled clients so they get the fresh @vite/client
      return self.clients.matchAll({ type: 'window' });
    }).then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    });
  }
}).catch(() => {
  // Network error — keep the SW active
});

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and API requests
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // Skip Vite dev server assets — must always be fetched fresh
  // so that the HMR hostname patch is applied on every request
  if (
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@fs/') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/__manus__/')
  ) return;

  // For navigation requests: network-first, fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match('/') || caches.match(event.request))
    );
    return;
  }

  // For static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
