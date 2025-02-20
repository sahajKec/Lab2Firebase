import React, { useState, ChangeEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const db = getFirestore();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);

      // Add user data to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: 'user', // Default value
        isLoggedIn: false, // Default value
        lastLogin: serverTimestamp(), // Current timestamp
      });
      alert(
        'Registration successful! Please check your email to verify your account.'
      );

      await signOut(auth);
      navigate('/');
    } catch (error: any) {
      setError(error.message);
      console.error('Error during registration:', error.message);
    }
  };

  return (
    <div className='container'>
      <div>
        <h1 className='title'>Internet and Intranet Lab</h1>
        <div className='card'>
          <div className='card-body'>
            <h3 className='card-title'>Register</h3>
            <form>
              <div className='mb-3'>
                <label htmlFor='email' className='form-label'>
                  Email
                </label>
                <input
                  type='email'
                  className='form-control'
                  id='email'
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>
              <div className='mb-3'>
                <label htmlFor='password' className='form-label'>
                  Password
                </label>
                <input
                  type='password'
                  className='form-control'
                  id='password'
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
              {error && <div className='custom-alert'>{error}</div>}
              <div className='text-center'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handleRegister}
                  disabled={!!error || !email || !password}
                >
                  Register
                </button>
              </div>
            </form>
            <h6 className='d-flex justify-content-center align-items-center'>
              <a href='/'>Already registered? Login</a>
            </h6>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
