import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification, signOut, updateProfile, User, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth } from "./firebase";

const db = getFirestore();

interface UserData {
  uid: string;
  email: string;
  name: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/");
        return;
      }

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
        console.error("Error fetching user data:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;

    try {
      await updateProfile(auth.currentUser as User, { displayName: newName });
      await updateDoc(doc(db, "users", user.uid), { name: newName });

      setUser((prev) => (prev ? { ...prev, name: newName } : null));
      setIsEditing(false);
      setMessage({ type: "success", text: "Name updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update name." });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setMessage({ type: "success", text: "Verification email sent!" });
      } catch (error) {
        console.error("Error sending verification email:", error);
        setMessage({ type: "error", text: "Failed to resend verification email." });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700">
          Logout
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10 grid gap-8">
        {!auth.currentUser?.emailVerified ? (
          <EmailVerificationSection handleResendVerification={handleResendVerification} message={message} />
        ) : (
          <UserProfileSection user={user} isEditing={isEditing} setIsEditing={setIsEditing} setNewName={setNewName} handleUpdateName={handleUpdateName} message={message} />
        )}
      </div>
    </div>
  );
};

const EmailVerificationSection = ({ handleResendVerification, message }: { handleResendVerification: () => void; message: { type: string; text: string } | null }) => (
  <div className="bg-white shadow-md rounded-lg p-6 text-center">
    <h2 className="text-yellow-600 text-lg font-semibold">Verify Your Email</h2>
    <p className="text-gray-600 mt-2">You need to verify your email before accessing the dashboard.</p>
    {message && <MessageDisplay message={message} />}
    <button onClick={handleResendVerification} className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md hover:bg-blue-700">
      Resend Verification Email
    </button>
  </div>
);

const UserProfileSection = ({
  user,
  isEditing,
  setIsEditing,
  setNewName,
  handleUpdateName,
  message,
}: {
  user: UserData | null;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setNewName: (value: string) => void;
  handleUpdateName: () => void;
  message: { type: string; text: string } | null;
}) => (
  <div className="bg-white shadow-md rounded-lg p-6">
    <h2 className="text-2xl font-semibold">Hello, {user?.name}!</h2>
    {message && <MessageDisplay message={message} />}
    {!isEditing ? (
      <button onClick={() => setIsEditing(true)} className="bg-green-500 text-white px-4 py-2 mt-4 rounded-md hover:bg-green-700">
        Edit Name
      </button>
    ) : (
      <EditNameSection setNewName={setNewName} handleUpdateName={handleUpdateName} setIsEditing={setIsEditing} />
    )}
  </div>
);

const EditNameSection = ({
  setNewName,
  handleUpdateName,
  setIsEditing,
}: {
  setNewName: (value: string) => void;
  handleUpdateName: () => void;
  setIsEditing: (value: boolean) => void;
}) => (
  <div className="mt-4">
    <input
      type="text"
      onChange={(e) => setNewName(e.target.value)}
      className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter new name"
    />
    <div className="flex gap-2 mt-2">
      <button onClick={handleUpdateName} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700">
        Save
      </button>
      <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700">
        Cancel
      </button>
    </div>
  </div>
);

const MessageDisplay = ({ message }: { message: { type: string; text: string } }) => (
  <div className={`p-3 mt-2 text-center rounded-md ${message.type === "success" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>
    {message.text}
  </div>
);

export default Dashboard;
