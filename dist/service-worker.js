const CACHE_NAME = 'tegaki-prompt-v18';
const ROOT_URL = new URL('./', self.location.href);
const APP_SHELL = [
  './',
  './index.html',
  './prompt-config.js',
  './manifest.webmanifest',
  './images/style-samples-v1.webp',
  './icons/icon-192.png',
  './icons/icon-512.png'
].map(path => new URL(path, ROOT_URL).href);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return cache.match(new URL('./index.html', ROOT_URL).href);
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isCurrentContent = request.mode === 'navigate'
    || url.pathname.endsWith('/index.html')
    || url.pathname.endsWith('/prompt-config.js')
    || url.pathname.endsWith('/manifest.webmanifest');

  event.respondWith(isCurrentContent ? networkFirst(request) : cacheFirst(request));
});
