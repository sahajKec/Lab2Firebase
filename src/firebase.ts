import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

 const firebaseConfig = {
    apiKey: "AIzaSyD05Y-094lLeJqLcqpHwXH7KOYGYmsP14U",

    authDomain: "connectfirebase-64127.firebaseapp.com",
  
    projectId: "connectfirebase-64127",
  
    storageBucket: "connectfirebase-64127.firebasestorage.app",
  
    messagingSenderId: "226150770351",
  
    appId: "1:226150770351:web:f63aae2069883173b1d65a",
  
    measurementId: "G-LKHV4F7K9X"
 };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth,db}