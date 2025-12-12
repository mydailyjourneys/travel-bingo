const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `travel-bingo-${CACHE_VERSION}`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install - שומרים את הקבצים הבסיסיים
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate - מוחקים קשים ישנים בגרסאות קודמות
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('travel-bingo-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch - לוגיקת קאש
self.addEventListener('fetch', event => {
  const request = event.request;

  // מעניין אותנו רק GET
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 1. ניווטים (HTML) - קודם רשת, אם אין - קאש
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2. קבצים מאותו origin - קודם קאש, אם אין - רשת
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          return cached;
        }

        return fetch(request)
          .then(response => {
            // שומרים בקאש רק תשובות תקינות
            if (response.status === 200 && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
      })
    );
  }
});
