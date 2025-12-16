// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCT5kSOqkWZPxuxtNWhGHKCqeaIJNPgEws",
  authDomain: "feiyi-shop.firebaseapp.com",
  projectId: "feiyi-shop",
  storageBucket: "feiyi-shop.firebasestorage.app",
  messagingSenderId: "37475395232",
  appId: "1:37475395232:web:326ec0d4299c8778f0cbc5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

console.log('🔥 Firebase initialized');
