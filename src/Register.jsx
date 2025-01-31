import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from './firebase';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getFirestore, doc, setDoc } from "firebase/firestore";

const Register = () => {
  const db = getFirestore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationMessage, setVerificationMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const userToken = localStorage.getItem("token");
      if (userToken) {
        navigate("/dashboard");
      } else {
        console.log("User is not valid");
      }
    };
    checkToken();
  }, [navigate]);

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: "user",
        isLoggedIn: false,
        lastLogin: new Date(),
      });
      await updateProfile(user, { displayName: "user" });
      toast.success("Registration Success");
      setVerificationMessage(true);
      setTimeout(() => {
        navigate("/");
      }, 2000); 
    } catch (error) {
      console.log("Error msg: ", error.message);
      toast.error(error.message);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Internet and Intranet Lab
          </p>
        </div>
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleRegister}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              Create account
            </button>
          </div>
        </form>

        {verificationMessage && (
          <div className="mt-4 text-center text-sm text-green-600">
            A verification link has been sent to your email. Please activate your account.
          </div>
        )}

        <div className="text-center">
          <Link 
            to="/" 
            className="text-sm font-medium text-purple-600 hover:text-purple-500"
          >
            Already have an account? Sign in here
          </Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;