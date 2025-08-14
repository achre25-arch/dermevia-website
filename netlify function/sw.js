/**
 * ===================================================================
 * DERMEVIA LABS - SERVICE WORKER
 * Enhanced Caching and Performance Optimization
 * ===================================================================
 */

const CACHE_NAME = 'dermevia-v3.0.0';
const STATIC_CACHE = 'dermevia-static-v3.0.0';
const DYNAMIC_CACHE = 'dermevia-dynamic-v3.0.0';
const API_CACHE = 'dermevia-api-v3.0.0';

// ===================================================================
// CACHE STRATEGIES
// ===================================================================

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/order.html',
  '/favicon.ico',
  '/robots.txt',
  // Add your images here
  // '/images/logo.png',
  // '/images/product.jpg'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/.netlify/functions/health-check',
  // Add other endpoints you want to cache
];

// Assets to cache on first access
const DYNAMIC_ASSETS = [
  // External fonts
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  // External images
  'https://picsum.photos',
  // External APIs (with careful caching)
  'https://api.ipify.org'
];

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
  static: 30 * 24 * 60 * 60 * 1000,    // 30 days
  dynamic: 7 * 24 * 60 * 60 * 1000,    // 7 days
  api: 60 * 60 * 1000,                 // 1 hour
  images: 14 * 24 * 60 * 60 * 1000     // 14 days
};

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Check if URL should be cached
 */
function shouldCache(url) {
  // Don't cache API functions (except health check)
  if (url.includes('/.netlify/functions/') && !url.includes('/health-check')) {
    return false;
  }
  
  // Don't cache admin or sensitive paths
  if (url.includes('/admin') || url.includes('/.env') || url.includes('/config')) {
    return false;
  }
  
  // Don't cache tracking pixels
  if (url.includes('facebook.com/tr') || url.includes('google-analytics.com')) {
    return false;
  }
  
  return true;
}

/**
 * Get cache name for URL
 */
function getCacheName(url) {
  if (STATIC_ASSETS.some(asset => url.endsWith(asset))) {
    return STATIC_CACHE;
  }
  
  if (API_ENDPOINTS.some(endpoint => url.includes(endpoint))) {
    return API_CACHE;
  }
  
  return DYNAMIC_CACHE;
}

/**
 * Check if cached response is still fresh
 */
function isCacheFresh(response, url) {
  if (!response) return false;
  
  const cachedTime = response.headers.get('sw-cached-time');
  if (!cachedTime) return false;
  
  const cacheAge = Date.now() - parseInt(cachedTime);
  
  if (url.includes('/.netlify/functions/')) {
    return cacheAge < CACHE_DURATIONS.api;
  }
  
  if (STATIC_ASSETS.some(asset => url.endsWith(asset))) {
    return cacheAge < CACHE_DURATIONS.static;
  }
  
  if (url.includes('picsum.photos') || url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    return cacheAge < CACHE_DURATIONS.images;
  }
  
  return cacheAge < CACHE_DURATIONS.dynamic;
}

/**
 * Add timestamp to response for cache validation
 */
async function addTimestamp(response) {
  const responseClone = response.clone();
  const headers = new Headers(responseClone.headers);
  headers.set('sw-cached-time', Date.now().toString());
  
  return new Response(responseClone.body, {
    status: responseClone.status,
    statusText: responseClone.statusText,
    headers: headers
  });
}

// ===================================================================
// CACHE STRATEGIES IMPLEMENTATION
// ===================================================================

/**
 * Cache First - For static assets
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse && isCacheFresh(cachedResponse, request.url)) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && shouldCache(request.url)) {
      const cache = await caches.open(getCacheName(request.url));
      const responseWithTimestamp = await addTimestamp(networkResponse.clone());
      cache.put(request, responseWithTimestamp);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('Cache first failed:', error);
    
    // Return cached version even if stale
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or error response
    return new Response('Service unavailable', { status: 503 });
  }
}

/**
 * Network First - For dynamic content and API calls
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (networkResponse.ok && shouldCache(request.url)) {
      const cache = await caches.open(getCacheName(request.url));
      const responseWithTimestamp = await addTimestamp(networkResponse.clone());
      cache.put(request, responseWithTimestamp);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('Network first failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For API calls, return a structured error response
    if (request.url.includes('/.netlify/functions/')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'offline',
        message: 'Service temporarily unavailable',
        cached: false
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Content unavailable offline', { status: 503 });
  }
}

/**
 * Stale While Revalidate - For images and fonts
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(getCacheName(request.url));
  const cachedResponse = await cache.match(request);
  
  // Always fetch in background to update cache
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok && shouldCache(request.url)) {
      const responseWithTimestamp = addTimestamp(networkResponse.clone());
      responseWithTimestamp.then(response => cache.put(request, response));
    }
    return networkResponse;
  }).catch(error => {
    console.warn('Background fetch failed:', error);
    return null;
  });
  
  // Return cached version immediately if available
  if (cachedResponse && isCacheFresh(cachedResponse, request.url)) {
    return cachedResponse;
  }
  
  // Wait for network if no cache or stale cache
  return fetchPromise || cachedResponse || new Response('Resource unavailable', { status: 404 });
}

// ===================================================================
// SERVICE WORKER EVENT HANDLERS
// ===================================================================

/**
 * Install event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error);
      })
  );
});

/**
 * Activate event - Clean old caches
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Activation failed:', error);
      })
  );
});

/**
 * Fetch event - Handle requests with appropriate strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other protocols
  if (!url.startsWith('http')) {
    return;
  }
  
  // Determine cache strategy based on request
  if (STATIC_ASSETS.some(asset => url.endsWith(asset))) {
    // Static assets: Cache First
    event.respondWith(cacheFirst(request));
    
  } else if (url.includes('/.netlify/functions/')) {
    // API endpoints: Network First (except health check)
    if (url.includes('/health-check')) {
      event.respondWith(staleWhileRevalidate(request));
    } else {
      event.respondWith(networkFirst(request));
    }
    
  } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf)$/)) {
    // Images and fonts: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
    
  } else if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    // Google Fonts: Cache First
    event.respondWith(cacheFirst(request));
    
  } else if (url.includes('picsum.photos')) {
    // External images: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
    
  } else {
    // Default: Network First for dynamic content
    event.respondWith(networkFirst(request));
  }
});

/**
 * Background sync for failed form submissions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'form-submission') {
    console.log('🔄 Attempting to sync failed form submission...');
    event.waitUntil(syncFormSubmissions());
  }
});

/**
 * Push notifications (if implemented later)
 */
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received:', event.data?.text());
  
  const options = {
    body: event.data?.text() || 'New notification from Dermevia',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'dermevia-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Dermevia Labs', options)
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Sync failed form submissions (placeholder for future implementation)
 */
async function syncFormSubmissions() {
  try {
    // Get failed submissions from IndexedDB
    // Attempt to resend them
    // Clear successful submissions
    console.log('📋 Form submission sync completed');
  } catch (error) {
    console.error('❌ Form submission sync failed:', error);
  }
}

/**
 * Clean up old cache entries
 */
async function cleanupCaches() {
  try {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response && !isCacheFresh(response, request.url)) {
          await cache.delete(request);
        }
      }
    }
    
    console.log('🧹 Cache cleanup completed');
  } catch (error) {
    console.error('❌ Cache cleanup failed:', error);
  }
}

// استبدل setInterval بهذا الكود الأكثر كفاءة:
let cleanupScheduled = false;

function scheduleCleanup() {
  if (cleanupScheduled) return;
  
  cleanupScheduled = true;
  
  // تنظيف عند تحديث Service Worker
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEANUP_CACHE') {
      cleanupCaches();
    }
  });
}

scheduleCleanup();

console.log('📱 Dermevia Service Worker loaded - Version 3.0.0');

console.log('📱 Dermevia Service Worker loaded - Version 3.0.0');