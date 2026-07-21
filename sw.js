const CACHE_NAME = 'vladivostok-guide-v6';
const ASSETS = [
    '/',
    '/index.html',
    '/sights.html',
    '/food.html',
    '/feedback.html',
    '/todo.html',
    '/css/style.css',
    '/js/todo.js',
    '/images/vladivostok.jpg',
    '/manifest.json'
];

// УСТАНОВКА
self.addEventListener('install', event => {
    console.log('SW: Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Кэширование ресурсов...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// АКТИВАЦИЯ
self.addEventListener('activate', event => {
    console.log('SW: Activate');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('SW: Удаляем старый кэш:', key);
                        return caches.delete(key);
                    })
            );
        })
    );
});

// ПЕРЕХВАТ ЗАПРОСОВ
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) {
                    return cached;
                }
                return fetch(event.request)
                    .then(response => {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            if (event.request.url.startsWith('http')) {
                                cache.put(event.request, clone);
                            }
                        });
                        return response;
                    });
            })
    );
});

// ===== ПРИЁМ СООБЩЕНИЙ ОТ СТРАНИЦЫ =====
self.addEventListener('message', function(event) {
    console.log('SW получил сообщение:', event.data);

    if (event.data && event.data.type === 'showNotification') {
        const data = event.data;
        self.registration.showNotification(data.title || 'Гид по Владивостоку', {
            body: data.body || 'Новое уведомление!',
            icon: data.icon || '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            data: {
                url: data.url || '/'
            }
        });
    }
});

// ===== PUSH-УВЕДОМЛЕНИЯ =====
self.addEventListener('push', function(event) {
    console.log('SW: Push получен!');

    let title = 'Гид по Владивостоку';
    let body = 'Новое уведомление!';
    let icon = '/icons/icon-192x192.png';
    let url = '/';

    if (event.data) {
        try {
            const data = event.data.json();
            if (data.title) title = data.title;
            if (data.body) body = data.body;
            if (data.icon) icon = data.icon;
            if (data.url) url = data.url;
        } catch (e) {
            body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: icon,
            badge: '/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            data: {
                url: url
            }
        })
    );
});

// ===== КЛИК ПО УВЕДОМЛЕНИЮ =====
self.addEventListener('notificationclick', function(event) {
    console.log('SW: Клик по уведомлению');
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                for (let client of windowClients) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});
