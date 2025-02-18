import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyA8GnhcsjMArD_lEpcqAqxjVOzp2i-Tw18",
  authDomain: "lab2firebasebct2077.firebaseapp.com",
  projectId: "lab2firebasebct2077",
  storageBucket: "lab2firebasebct2077.firebasestorage.app",
  messagingSenderId: "475061626743",
  appId: "1:475061626743:web:80cb68c3dc20cfc1652372",
  measurementId: "G-9HF2MT3GXJ",
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
