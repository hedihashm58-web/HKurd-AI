/* eslint-disable */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-sw.js";

// ⚠️ ڕێکخستنەکانی فایربەیسەکەی خۆت لێرە دابنێ
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// وەرگرتنی نامەکان کاتێک ئەپەکە داخراوە
onBackgroundMessage(messaging, (payload) => {
  console.log('نامەیەک لە پاشبنەما وەرگیرا: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.jpg' // لۆگۆی ئەپەکەت بۆ سەر شاشەی مۆبایل
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});