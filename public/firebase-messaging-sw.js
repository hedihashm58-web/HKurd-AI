/* eslint-disable */
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyC8ndNIUCGUJ_jsIk3wi7JTENlMDbJ4TkA",
  authDomain: "kurdai-cb7e2.firebaseapp.com",
  projectId: "kurdai-cb7e2",
  storageBucket: "kurdai-cb7e2.firebasestorage.app",
  messagingSenderId: "126978980805",
  appId: "1:126978980805:web:b26c0ed4e952a5c92ce9ac"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('نامەیەک لە پاشبنەما وەرگیرا:', payload);
  const notificationTitle = payload?.notification?.title || "KurdAI PRO";
  const notificationOptions = {
    body: payload?.notification?.body || "پەیامێکی نوێ لە KurdAI وەرگیرا",
    icon: '/logo.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});