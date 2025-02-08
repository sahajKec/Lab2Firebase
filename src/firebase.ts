import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBTWlnWg0majYWR1ReqN0LwZ0HeUyOWzds',
  authDomain: 'register-login-ec971.firebaseapp.com',
  projectId: 'register-login-ec971',
  storageBucket: 'register-login-ec971.firebasestorage.app',
  messagingSenderId: '125543200473',
  appId: '1:125543200473:web:a40cf533ea94da53c3b0c8',
  measurementId: 'G-SK6KR0B7KM',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
