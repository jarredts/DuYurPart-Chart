importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCd5n4y_rw13gaoqf7u5Z4rZVdj2TrHtGQ",
  authDomain: "duyurpahrt-chart.firebaseapp.com",
  projectId: "duyurpahrt-chart",
  storageBucket: "duyurpahrt-chart.firebasestorage.app",
  messagingSenderId: "1067394801456",
  appId: "1:1067394801456:web:79f4eb4879bd7e7f4ef2f5",
  measurementId: "G-0PVJDWNJ90"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Family Chores';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new update!',
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: payload.data || {},
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
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
