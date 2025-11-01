// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
import { getAuth } from "firebase/auth"; // ✅ import Firebase Auth

const firebaseConfig = {
  apiKey: "AIzaSyC-lzu1QNAu6ZeSFSdr5uxuTjPSmA2G-Zk",
  authDomain: "todo-angry.firebaseapp.com", // ✅ corrected domain
  projectId: "todo-angry",
  storageBucket: "todo-angry.appspot.com", // ✅ corrected bucket URL
  messagingSenderId: "270019803466",
  appId: "1:270019803466:web:11ad31dabcd98b1455a9b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);       // ✅ Authentication
export const db = getFirestore(app);    // ✅ Firestore Database
export const storage = getStorage(app); // ✅ Cloud Storage
