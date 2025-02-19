import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  signOut,
  updateProfile,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";

const db = getFirestore();

interface UserData {
  uid: string;
  email: string;
  name: string;
}

interface Message {
  type: "success" | "error";
  text: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<Message | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsEmailVerified(currentUser.emailVerified);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserData);
          } else {
            const newUser: UserData = {
              uid: currentUser.uid,
              email: currentUser.email ?? "",
              name: "User",
            };
            await setDoc(doc(db, "users", currentUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      } else {
        navigate("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleUpdateName = async () => {
    if (!user) return;
    try {
      await updateProfile(auth.currentUser as User, { displayName: newName });
      await updateDoc(doc(db, "users", user.uid), { name: newName });
      setUser((prevUser) => (prevUser ? { ...prevUser, name: newName } : null));
      setIsEditing(false);
      setMessage({ type: "success", text: "Your name was changed." });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update name." });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setMessage({ type: "success", text: "Verification email sent." });
      } catch (error) {
        console.error("Error sending verification email:", error);
        setMessage({
          type: "error",
          text: "Failed to resend verification email.",
        });
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg shadow-xl rounded-3xl p-10 border border-white/20 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name}!</h1>
        {!isEmailVerified ? (
          <div className="p-4 rounded-lg bg-yellow-500/20 text-yellow-300">
            <p>You need to verify your email.</p>
            <button
              onClick={handleResendVerification}
              className="mt-4 bg-purple-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
            >
              Resend Verification Email
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <button
              onClick={() => {
                setNewName(user?.name || "");
                setIsEditing(true);
              }}
              className="bg-green-500 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Update Name
            </button>
          </div>
        )}
        {isEditing && (
          <div className="mt-4 flex flex-col gap-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-3 border rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400"
              placeholder="Enter new name"
            />
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleUpdateName}
                className="bg-green-500 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Submit
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 hover:bg-red-800 text-white px-6 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
