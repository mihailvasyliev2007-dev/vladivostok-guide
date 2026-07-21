const CACHE_NAME = 'v1';
const ASSETS = [
  '/vladivostok-guide/',
  '/vladivostok-guide/index.html',
  '/vladivostok-guide/sights.html',
  '/vladivostok-guide/food.html',
  '/vladivostok-guide/feedback.html',
  '/vladivostok-guide/todo.html',
  '/vladivostok-guide/css/style.css',
  '/vladivostok-guide/js/todo.js',
  '/vladivostok-guide/images/vladivostok.jpg',
  '/vladivostok-guide/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэшируем:', ASSETS);
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'showNotification') {
    self.registration.showNotification(
      event.data.title || 'Гид по Владивостоку',
      {
        body: event.data.body || 'Новое уведомление!',
        icon: '/vladivostok-guide/icons/icon-192x192.png',
        badge: '/vladivostok-guide/icons/icon-72x72.png'
      }
    );
  }
});
