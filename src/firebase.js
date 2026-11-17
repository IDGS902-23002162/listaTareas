// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGC-VbD16irL3imhLRGIk5KQUFxRTp2N0",
  authDomain: "pwatareas-23002162.firebaseapp.com",
  projectId: "pwatareas-23002162",
  storageBucket: "pwatareas-23002162.firebasestorage.app",
  messagingSenderId: "247493710639",
  appId: "1:247493710639:web:b064902f18a2d97c35c7da",
  measurementId: "G-ZLTF1G408K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
