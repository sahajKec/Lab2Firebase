import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

type MessageType = 'info' | 'error' | 'success';

const Login = () => {
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

  const handleLogin = async () => {
    setIsProcessing(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      if (!user.emailVerified) {
        throw new Error("Please verify your email before logging in");
      }

      const token = await user.getIdToken();
      localStorage.setItem("token", token);

      await updateDoc(doc(db, 'users', user.uid), {
        isVerified: true,
        isLoggedIn: true,
        lastLogin: serverTimestamp()
      });

      navigate('/dashboard');
    } catch (error: any) {
      setStatus({
        message: error.code === 'auth/invalid-login-credentials' 
          ? "Invalid email or password" 
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-md w-full m-4 p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
        {status.message && (
          <div className={`p-4 rounded-lg mb-6 ${getMessageStyle(status.type)} animate-fadeIn`}>
            {status.message}
          </div>
        )}
        
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Welcome Back</h2>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : 'Login'}
          </button>
          <div className="text-center mt-6">
            <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Need an account? Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
