import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

type MessageType = 'info' | 'error' | 'success';

interface DashboardState {
  name: string;
  isVerified: boolean;
  isEditing: boolean;
  isLoading: boolean;
  isBusy: boolean;
  message: string;
  messageType: MessageType;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<DashboardState>({
    name: '',
    isVerified: false,
    isEditing: false,
    isLoading: true,
    isBusy: false,
    message: '',
    messageType: 'info'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      await user.reload();
      if (user.emailVerified) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setState(prev => ({ 
            ...prev, 
            name: docSnap.data().name,
            isVerified: true,
            isLoading: false 
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          isVerified: false,
          isLoading: false 
        }));
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleVerificationEmail = async () => {
    setState(prev => ({ ...prev, isBusy: true }));
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setState(prev => ({ 
          ...prev, 
          message: 'Verification email sent!',
          messageType: 'info' 
        }));
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        message: error.message,
        messageType: 'error' 
      }));
    } finally {
      setState(prev => ({ ...prev, isBusy: false }));
    }
  };

  const handleLogout = async () => {
    setState(prev => ({ ...prev, isBusy: true }));
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          isLoggedIn: false,
          lastLogout: serverTimestamp()
        });
      }
      await signOut(auth);
      localStorage.removeItem("token");
      navigate("/");
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        message: error.message,
        messageType: 'error' 
      }));
    } finally {
      setState(prev => ({ ...prev, isBusy: false }));
    }
  };

  const handleNameUpdate = async (newName: string) => {
    if (!auth.currentUser) return;
    
    setState(prev => ({ ...prev, isBusy: true }));
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: newName,
        updatedAt: serverTimestamp()
      });
      setState(prev => ({ 
        ...prev, 
        name: newName,
        isEditing: false,
        message: 'Name updated successfully',
        messageType: 'info'
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        message: error.message,
        messageType: 'error' 
      }));
    } finally {
      setState(prev => ({ ...prev, isBusy: false }));
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

  if (state.isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-md w-full m-4 p-8 bg-white rounded-2xl shadow-xl">
        {state.message && (
          <div className={`p-4 rounded-lg mb-6 ${getMessageStyle(state.messageType)} animate-fadeIn`}>
            {state.message}
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Dashboard</h1>

        {!state.isVerified ? (
          <div className="space-y-6">
            <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-center text-yellow-800 font-medium mb-4">Please verify your email to continue</p>
              <button
                onClick={handleVerificationEmail}
                disabled={state.isBusy}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
              >
                Resend Verification Email
              </button>
            </div>
            <button
              onClick={handleLogout}
              disabled={state.isBusy}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              {state.isEditing ? (
                <input
                  type="text"
                  defaultValue={state.name}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg"
                  onBlur={e => handleNameUpdate(e.target.value)}
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl font-semibold text-center text-gray-800">
                  Welcome, {state.name}!
                </h2>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setState(prev => ({ ...prev, isEditing: !prev.isEditing }))}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {state.isEditing ? 'Cancel' : 'Edit Name'}
              </button>
              <button
                onClick={handleLogout}
                disabled={state.isBusy}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
