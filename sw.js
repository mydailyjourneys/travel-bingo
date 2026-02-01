const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = 'travel-bingo-v2';

// Core files that should use NETWORK-FIRST (always get latest)
const networkFirstFiles = [
    './',
    './index.html',
    './NEW BINGO PWA.html'
];

// Files to pre-cache on install
const STATIC_FILES = [
    './',
    './index.html',
    './NEW BINGO PWA.html',
    './manifest.json',
    './icons/icon-square-192.png',
    './icons/icon-square-512.png',
    './icons/icon-round-192.png',
    './icons/icon-round-512.png'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('[SW] Installing new version:', CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching core files');
                return cache.addAll(STATIC_FILES).catch((err) => {
                    console.log('[SW] Error caching static files:', err);
                });
            })
    );

    // Activate immediately - don't wait for old SW to stop
    self.skipWaiting();
});

// Activate event - clean old caches and take control
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating new version:', CACHE_VERSION);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Notify all clients about the update
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
                });
            });
        })
    );

    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Firebase and external API requests (they need to be live)
    if (url.hostname.includes('firebase') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('googletagmanager.com')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Determine caching strategy based on file type
    const isNetworkFirst = networkFirstFiles.some(file => url.pathname.endsWith(file) || url.pathname === file) ||
                           url.pathname.endsWith('.html') ||
                           url.pathname.endsWith('.js') ||
                           url.pathname.endsWith('.css') ||
                           url.pathname.endsWith('.json') ||
                           url.pathname === '/' ||
                           url.pathname === '';

    if (isNetworkFirst) {
        // NETWORK FIRST: Try network, fall back to cache
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Got fresh response - cache it
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed - try cache
                    return caches.match(request).then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If HTML request and nothing in cache, return main page
                        if (request.headers.get('accept')?.includes('text/html')) {
                            return caches.match('./NEW BINGO PWA.html') ||
                                   caches.match('./index.html') ||
                                   caches.match('./');
                        }
                    });
                })
        );
    } else {
        // CACHE FIRST: For images and static assets (performance)
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Not in cache - fetch and cache
                    return fetch(request).then(response => {
                        if (response && response.status === 200 && response.type === 'basic') {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseToCache);
                            });
                        }
                        return response;
                    });
                })
        );
    }
});

// Listen for skip waiting message from page
self.addEventListener('message', (event) => {
    if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'skipWaiting')) {
        self.skipWaiting();
    }
});
