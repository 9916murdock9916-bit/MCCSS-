// service-worker.js

const CACHE_NAME = "edenfield-v500";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/core/state.js",
  "/core/identity.js",
  "/core/storage.js",
  "/core/router.js",
  "/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
