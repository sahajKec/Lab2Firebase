import {
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './Styles.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null); // Store user data
  const [newName, setNewName] = useState<string>(''); // For updating the name
  const [emailSent, setEmailSent] = useState<boolean>(false); // Track if email is sent

  // Check for token and valid user
  useEffect(() => {
    const checkToken = () => {
      const userToken = localStorage.getItem('token');
      if (userToken) {
        console.log('User is valid');
      } else {
        console.log('User is not valid');
        navigate('/');
      }
    };
    checkToken();
  }, [navigate]);

  // Fetch and monitor user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUser({ ...userData, emailVerified: currentUser.emailVerified });
        } else {
          console.log('User document does not exist in Firestore');
        }
      } else {
        console.log('User not logged in.');
        navigate('/');
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);

  // Log out function
  const logOutUser = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      navigate('/');
    } catch (error: any) {
      console.log('Error msg: ', error.message);
      alert(error.message);
    }
  };

  // Update user name in Firestore
  const handleNameUpdate = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');
        await updateDoc(userDocRef, { name: newName });
        setUser((prev: any) => ({ ...prev, name: newName })); // Update locally
      } catch (error: any) {
        console.error('Error updating name:', error.message);
        alert(error.message);
      }
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      setEmailSent(true);
      alert('Mail sent');
    }
  };

  return (
    <div className='container mt-5'>
      <div className='card'>
        <div className='card-body'>
          <h1 className='card-title'>Dashboard</h1>
          {user ? (
            <>
              <h2 className='card-subtitle mb-3'>
                Welcome, {user.name || 'User'}!
              </h2>

              {!user.emailVerified ? (
                <div className='custom-alert' role='alert'>
                  <p className='custom-alert-text mb-2'>
                    Please verify your email to access all features, including
                    updating your name.
                  </p>
                  <button
                    className='btn btn-primary'
                    onClick={resendVerificationEmail}
                    disabled={emailSent}
                  >
                    {emailSent
                      ? 'Verification Email Sent'
                      : 'Resend Verification Email'}
                  </button>
                </div>
              ) : (
                <div className='mb-3'>
                  <h3>Update Name</h3>
                  <input
                    type='text'
                    className='form-control mb-2 mt-3'
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder='Enter new name'
                  />
                  <button
                    className='btn btn-primary mt-3'
                    onClick={handleNameUpdate}
                  >
                    Update Name
                  </button>
                </div>
              )}

              <button className='btn btn-error text-white' onClick={logOutUser}>
                Logout
              </button>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
