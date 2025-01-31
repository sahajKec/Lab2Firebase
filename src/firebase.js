import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfOn4idRiKPGPV-xjEmIqOXc4Ep5059sM",
  authDomain: "bctb2077-32dc4.firebaseapp.com",
  projectId: "bctb2077-32dc4",
  storageBucket: "bctb2077-32dc4.firebasestorage.app",
  messagingSenderId: "685932102019",
  appId: "1:685932102019:web:dddcb01fa400b509e9b6b6",
  measurementId: "G-71QKVCFQYK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);