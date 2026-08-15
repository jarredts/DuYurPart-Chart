importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const CACHE_NAME = 'chores-cache-v29';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './notification-badge.png'
];

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCd5n4y_rw13gaoqf7u5Z4rZVdj2TrHtGQ",
  authDomain: "duyurpahrt-chart.firebaseapp.com",
  projectId: "duyurpahrt-chart",
  storageBucket: "duyurpahrt-chart.firebasestorage.app",
  messagingSenderId: "1067394801456",
  appId: "1:1067394801456:web:79f4eb4879bd7e7f4ef2f5"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background Push Notification Handler
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Family Chores';
  const options = {
    body: payload.notification?.body || payload.data?.body || "You've been poked!",
    icon: './icon-192.png',
    badge: './notification-badge.png',
    color: '#8b5cf6',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: true
  };

  self.registration.showNotification(title, options);
});

// Cache & Offline Handlers
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          fetch(url, { cache: 'reload' })
            .then((res) => {
              if (!res.ok) throw new Error(`Failed to fetch ${url}`);
              return cache.put(url, res);
            })
            .catch((err) => console.warn(`Cache skip for ${url}:`, err))
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
