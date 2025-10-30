const CACHE_NAME = 'intellipark-v1.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline access
const CACHE_URLS = [
  '/intelli.html',
  '/levels.html',
  '/booking.html',
  '/admin.html',
  '/logo.png',
  '/offline.html',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap'
];

// Install event - cache files
self.addEventListener('install', event => {
  console.log('✅ Service Worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Caching app shell');
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Firebase and API requests (always fetch fresh)
  if (event.request.url.includes('firebaseio.com') || 
      event.request.url.includes('intellipark-backend')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('📦 Serving from cache:', event.request.url);
        return cachedResponse;
      }

      // Fetch from network and cache it
      return fetch(event.request).then(response => {
        // Don't cache invalid responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // If offline and page not cached, show offline page
        return caches.match(OFFLINE_URL);
      });
    })
  );
});
