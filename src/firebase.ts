import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// زانیارییەکانی پڕۆژەکەی تۆ
const firebaseConfig = {
  apiKey: "AIzaSyC8ndNIUCGUJ_jsIk3wi7JTENlMDbJ4TkA",
  authDomain: "kurdai-cb7e2.firebaseapp.com",
  projectId: "kurdai-cb7e2",
  storageBucket: "kurdai-cb7e2.firebasestorage.app",
  messagingSenderId: "126978980805",
  appId: "1:126978980805:web:b26c0ed4e952a5c92ce9ac"
};

// چالاککردنی فایەربەیس
const app = initializeApp(firebaseConfig);

// ئامادەکردنی بەشەکانی لۆگین و داتابەیس بۆ ئەوەی لە پەڕەکانی تر بەکاریان بهێنین
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();