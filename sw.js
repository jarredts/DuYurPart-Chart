// sw.js - Combined Caching & Firebase Background Push
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const CACHE_NAME = 'chores-cache-v8';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Initialize Firebase Messaging in the main worker
const firebaseConfig = {
  apiKey: "AIzaSyCd5n4y_rw13gaoqf7u5Z4rZVdj2TrHtGQ",
  authDomain: "duyurpahrt-chart.firebaseapp.com",
  projectId: "duyurpahrt-chart",
  storageBucket: "duyurpahrt-chart.firebasestorage.app",
  messagingSenderId: "1067394801456",
  appId: "1:1067394801456:web:79f4eb4879bd7e7f4ef2f5"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || 'Family Chores';
    const options = {
      body: payload.notification?.body || payload.data?.body || 'You have a new chore update!',
      icon: './icon-192.png',
      badge: './icon-192.png',
      data: payload.data || {},
      vibrate: [200, 100, 200]
    };
    self.registration.showNotification(title, options);
  });
} catch (e) {
  console.log('Firebase background messaging setup:', e);
}

// 2. Service Worker Caching Lifecycle
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(CORE_ASSETS.map((url) =>
        fetch(url, { cache: 'reload' }).then((response) => cache.put(url, response)).catch(() => {})
      ))
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

// 3. Notification Click
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
