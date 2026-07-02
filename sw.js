const CACHE = 'sleep-trainer-v7';
const ASSETS = [
  'index.html',
  'trainer.html',
  'manifest.json',
  'css/common.css',
  'css/index.css',
  'css/trainer.css',
  'js/config.js',
  'js/time.js',
  'js/display.js',
  'js/version.js',
  'js/index.js',
  'js/trainer.js',
  'images/night.png',
  'images/dawn.png',
  'images/day.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request)),
  );
});
