import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

type MessageType = 'info' | 'error' | 'success';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<{ message: string; type: MessageType }>({ 
    message: '', 
    type: 'info' 
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard");
  }, [navigate]);

  const handleRegister = async () => {
    setIsProcessing(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: 'user',
        isVerified: false,
        isLoggedIn: false,
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await sendEmailVerification(user);
      await signOut(auth);
      navigate("/", { state: { message: "Registration successful. Please verify your email." } });
    } catch (error: any) {
      setStatus({
        message: error.code === 'auth/email-already-in-use' 
          ? "Email already exists" 
          : error.message,
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMessageStyle = (type: MessageType) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'success':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
      <div className="max-w-md w-full m-4 p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
        {status.message && (
          <div className={`p-4 rounded-lg mb-6 ${getMessageStyle(status.type)} animate-fadeIn`}>
            {status.message}
          </div>
        )}
        
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Create Account</h2>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="Choose a password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <button
            onClick={handleRegister}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : 'Register'}
          </button>
          <div className="text-center mt-6">
            <a href="/" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
              Already have an account? Login here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
