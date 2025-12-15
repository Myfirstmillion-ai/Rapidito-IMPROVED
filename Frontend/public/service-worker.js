// Rapi-dito Service Worker
// Advanced caching strategies for optimal performance and offline capabilities

// Cache names with version suffix for easy updates
const CACHE_NAMES = {
  static: 'static-cache-v1',
  assets: 'assets-cache-v1',
  api: 'api-cache-v1',
  documents: 'documents-cache-v1'
};

// Assets to cache on install (critical resources)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Regular expressions for different cache strategies
const CACHE_STRATEGIES = {
  // Cache first - long-lived static assets
  cacheFirst: [
    /\/icons\//,
    /\/fonts\//,
    /\.woff2?$/,
    /\.ttf$/,
    /\.svg$/,
    /\.png$/,
    /\.jpe?g$/,
    /\.webp$/,
    /\.ico$/
  ],
  
  // Network first with fallback - API calls
  networkFirst: [
    /\/api\//,
    /\.json$/
  ],
  
  // Stale while revalidate - semi-dynamic content
  staleWhileRevalidate: [
    /\.css$/,
    /\.js$/,
    /\/branding\//
  ],
  
  // Never cache - dynamic or sensitive content
  noCache: [
    /\/socket\.io\//,
    /\/tracking\//,
    /\/ride\/status\//,
    /\/auth\//,
    /\/logout/
  ]
};

// Installation event - cache critical assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activation event - clean old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating');
  
  // Take control of all clients immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      
      // Remove old cache versions
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete any cache that doesn't match current versions
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Helper: Determine which strategy to use based on request URL
function getStrategyForRequest(request) {
  const url = new URL(request.url);
  
  // Don't cache cross-origin requests
  if (url.origin !== location.origin && !url.hostname.includes('maps.googleapis.com')) {
    return 'noCache';
  }
  
  // Socket.io and real-time data should never be cached
  if (CACHE_STRATEGIES.noCache.some(pattern => pattern.test(url.pathname))) {
    return 'noCache';
  }
  
  // Static assets use cache-first
  if (CACHE_STRATEGIES.cacheFirst.some(pattern => pattern.test(url.pathname))) {
    return 'cacheFirst';
  }
  
  // API calls use network-first
  if (CACHE_STRATEGIES.networkFirst.some(pattern => pattern.test(url.pathname))) {
    return 'networkFirst';
  }
  
  // Semi-dynamic content uses stale-while-revalidate
  if (CACHE_STRATEGIES.staleWhileRevalidate.some(pattern => pattern.test(url.pathname))) {
    return 'staleWhileRevalidate';
  }
  
  // Default to network-first
  return 'networkFirst';
}

// Helper: Select appropriate cache based on request type
function getCacheForRequest(request) {
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/api/')) {
    return CACHE_NAMES.api;
  }
  
  if (url.pathname.match(/\.(png|jpe?g|svg|webp|ico|gif)$/)) {
    return CACHE_NAMES.assets;
  }
  
  return CACHE_NAMES.static;
}

// Implement cache-first strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    
    // Only cache valid responses
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache first fetch failed:', error);
    // If offline and not in cache, return offline page for HTML requests
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Implement network-first strategy with timeout
async function networkFirst(request, cacheName) {
  const timeoutDuration = 5000; // 5 seconds
  
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Network timeout'));
      }, timeoutDuration);
    });
    
    // Race fetch vs timeout
    const networkResponse = await Promise.race([
      fetch(request),
      timeoutPromise
    ]);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network first falling back to cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If offline and not in cache, return offline page for HTML requests
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // Otherwise throw the error
    throw error;
  }
}

// Implement stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  // Fetch from network and update cache in the background
  const fetchPromise = fetch(request).then(async networkResponse => {
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.error('[Service Worker] Stale while revalidate fetch failed:', error);
    // Return undefined so we fall back to cached response
  });
  
  // Return cached response immediately if available, otherwise wait for fetch
  return cachedResponse || fetchPromise;
}

// Fetch event - apply appropriate caching strategy
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Determine strategy and cache based on request
  const strategy = getStrategyForRequest(event.request);
  const cacheName = getCacheForRequest(event.request);
  
  // Apply the appropriate strategy
  switch (strategy) {
    case 'cacheFirst':
      event.respondWith(cacheFirst(event.request, cacheName));
      break;
      
    case 'networkFirst':
      event.respondWith(networkFirst(event.request, cacheName));
      break;
      
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(event.request, cacheName));
      break;
      
    case 'noCache':
    default:
      // Pass through to network without caching
      // But still handle offline fallback for HTML
      event.respondWith(
        fetch(event.request).catch(() => {
          if (event.request.headers.get('Accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
          throw new Error('Network unavailable');
        })
      );
  }
});

// Background sync for critical operations
self.addEventListener('sync', event => {
  if (event.tag === 'sync-rides') {
    event.waitUntil(syncPendingRides());
  }
});

// Handle pending rides sync when back online
async function syncPendingRides() {
  try {
    // Get pending rides from IndexedDB
    // Implementation would depend on your data store
    console.log('[Service Worker] Syncing pending rides');
    
    // Process would involve sending stored ride data to server
    // This is a placeholder for the actual implementation
  } catch (error) {
    console.error('[Service Worker] Ride sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nueva actualización disponible',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      },
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Rapi-dito', options)
    );
  } catch (error) {
    console.error('[Service Worker] Push notification error:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // If there's already a window open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      
      // Otherwise open new window
      if (clients.openWindow) {
        clients.openWindow(urlToOpen);
      }
    })
  );
});
