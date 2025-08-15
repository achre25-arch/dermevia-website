/**
 * DERMEVIA LABS - SERVICE WORKER v3.0.1
 * Caching tuned to avoid stale app.js
 */

const CACHE_NAME = 'dermevia-v3.0.1';
const STATIC_CACHE = 'dermevia-static-v3.0.1';
const DYNAMIC_CACHE = 'dermevia-dynamic-v3.0.1';
const API_CACHE = 'dermevia-api-v3.0.1';

// Static assets to cache immediately (لاحظ: أزلنا /app.js من هنا)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/order.html',
  '/favicon.ico',
  '/robots.txt'
];

const API_ENDPOINTS = [
  '/.netlify/functions/health-check'
];

const CACHE_DURATIONS = {
  static: 30 * 24 * 60 * 60 * 1000,
  dynamic: 7 * 24 * 60 * 60 * 1000,
  api: 60 * 60 * 1000,
  images: 14 * 24 * 60 * 60 * 1000
};

function shouldCache(url) {
  if (url.includes('/.netlify/functions/') && !url.includes('/health-check')) return false;
  if (url.includes('/admin') || url.includes('/.env') || url.includes('/config')) return false;
  if (url.includes('facebook.com/tr') || url.includes('google-analytics.com')) return false;
  return true;
}
function getCacheName(url) {
  if (STATIC_ASSETS.some(asset => url.endsWith(asset))) return STATIC_CACHE;
  if (API_ENDPOINTS.some(endpoint => url.includes(endpoint))) return API_CACHE;
  return DYNAMIC_CACHE;
}
function isCacheFresh(response, url) {
  if (!response) return false;
  const cachedTime = response.headers.get('sw-cached-time');
  if (!cachedTime) return false;
  const age = Date.now() - parseInt(cachedTime);
  if (url.includes('/.netlify/functions/')) return age < CACHE_DURATIONS.api;
  if (STATIC_ASSETS.some(asset => url.endsWith(asset))) return age < CACHE_DURATIONS.static;
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return age < CACHE_DURATIONS.images;
  return age < CACHE_DURATIONS.dynamic;
}
async function addTimestamp(response) {
  const clone = response.clone();
  const headers = new Headers(clone.headers);
  headers.set('sw-cached-time', Date.now().toString());
  return new Response(clone.body, { status: clone.status, statusText: clone.statusText, headers });
}

async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached && isCacheFresh(cached, request.url)) return cached;
    const net = await fetch(request);
    if (net.ok && shouldCache(request.url)) {
      const cache = await caches.open(getCacheName(request.url));
      cache.put(request, await addTimestamp(net.clone()));
    }
    return net;
  } catch {
    const fallback = await caches.match(request);
    return fallback || new Response('Service unavailable', { status: 503 });
  }
}
async function networkFirst(request) {
  try {
    const net = await fetch(request, { headers: { 'Cache-Control': 'no-cache' } });
    if (net.ok && shouldCache(request.url)) {
      const cache = await caches.open(getCacheName(request.url));
      cache.put(request, await addTimestamp(net.clone()));
    }
    return net;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.url.includes('/.netlify/functions/')) {
      return new Response(JSON.stringify({ success: false, error: 'offline', message: 'Service temporarily unavailable', cached: false }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Content unavailable offline', { status: 503 });
  }
}
async function staleWhileRevalidate(request) {
  const cache = await caches.open(getCacheName(request.url));
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(async net => {
    if (net.ok && shouldCache(request.url)) cache.put(request, await addTimestamp(net.clone()));
    return net;
  }).catch(() => null);
  if (cached && isCacheFresh(cached, request.url)) return cached;
  return fetchPromise || cached || new Response('Resource unavailable', { status: 404 });
}

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.map(name => {
        if (![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(name)) {
          return caches.delete(name);
        }
      })
    )).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  if (request.method !== 'GET') return;
  if (!url.startsWith('http')) return;

  // مهم: دائماً Network-First لـ app.js لتفادي النسخ القديمة
  if (url.endsWith('/app.js') || url.includes('/app.js?')) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (STATIC_ASSETS.some(asset => url.endsWith(asset))) {
    event.respondWith(cacheFirst(request));
  } else if (url.includes('/.netlify/functions/')) {
    if (url.includes('/health-check')) event.respondWith(staleWhileRevalidate(request));
    else event.respondWith(networkFirst(request));
  } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf)$/)) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Optional cleanup trigger
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEANUP_CACHE') {
    (async () => {
      const names = await caches.keys();
      for (const name of names) {
        const cache = await caches.open(name);
        const reqs = await cache.keys();
        for (const req of reqs) {
          const res = await cache.match(req);
          if (res && !isCacheFresh(res, req.url)) await cache.delete(req);
        }
      }
    })();
  }
});

console.log('📱 Dermevia Service Worker loaded - Version 3.0.1');