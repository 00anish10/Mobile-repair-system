const CACHE_NAME = 'moon-mobile-repair-v1';
const PRECACHE_URLS = ['/', '/manifest.json'];

interface ExtendableEventLike extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

interface FetchEventLike extends ExtendableEventLike {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

const sw = self as unknown as {
  skipWaiting(): void;
  clients: { claim(): void };
  addEventListener(
    type: 'install' | 'activate' | 'fetch',
    listener: (event: ExtendableEventLike) => void
  ): void;
};

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve(false);
        })
      )
    )
  );
  sw.clients.claim();
});

sw.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEventLike;
  if (fetchEvent.request.method !== 'GET') {
    return;
  }

  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(fetchEvent.request);
    })
  );
});
