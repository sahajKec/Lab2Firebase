import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { sendEmailVerification, signOut, updateProfile } from "firebase/auth";
import { auth } from './firebase'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const db = getFirestore();

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
            setIsVerified(user.emailVerified);
          } else {
            console.log("No such document!");
            
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              email: user.email,
              name: "user",
              isLoggedIn: false,
              lastLogin: new Date(),
            });
            setUser({
              uid: user.uid,
              email: user.email,
              name: "user",
              isLoggedIn: false,
              lastLogin: new Date(),
            });
            setIsVerified(user.emailVerified);
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      } else {
        navigate("/");
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleSendVerification = async () => {
    await sendEmailVerification(auth.currentUser);
    toast.success("Verification email sent");
  };

  const handleUpdateName = async () => {
    const user = auth.currentUser;
    try {
      await updateProfile(user, { displayName: newName });
      await updateDoc(doc(db, "users", user.uid), { name: newName });
      setUser({ ...user, name: newName });
      setIsEditing(false);
      toast.success("Name updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update name");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="animate-pulse text-xl text-gray-600 font-semibold">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <ToastContainer />
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {user ? `Welcome, ${user.name}!` : "Loading..."}
            </h1>
            <button 
              onClick={handleLogout} 
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
          {!isVerified ? (
            <div className="text-center space-y-6">
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                <h2 className="text-2xl font-semibold text-yellow-800">Your email is not verified</h2>
                <p className="text-yellow-600 mt-2">Please verify your email to access all features</p>
              </div>
              <button 
                onClick={handleSendVerification} 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md"
              >
                Send Verification Email
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">Hello, {user.name}!</h2>
              <p className="text-gray-600">What would you like to do today?</p>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-md"
                >
                  Update Name
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    placeholder="Enter new name"
                  />
                  <div className="flex justify-center space-x-4">
                    <button 
                      onClick={handleUpdateName} 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md"
                    >
                      Submit
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-2 rounded-lg hover:from-gray-500 hover:to-gray-600 transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 shadow-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;