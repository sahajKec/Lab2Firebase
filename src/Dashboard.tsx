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
import "bootstrap/dist/css/bootstrap.min.css";

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
    if (!user || newName === user.name) return;

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
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <div className="container py-5">
      <nav className="navbar navbar-light bg-light mb-4 px-3">
        <h1 className="navbar-brand">Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </nav>

      <div className="card p-4">
        {!isEmailVerified ? (
          <div className="alert alert-warning text-center">
            <h2>Warning!</h2>
            <p>You need to verify your email address.</p>
            <button onClick={handleResendVerification} className="btn btn-primary">Resend Verification Email</button>
          </div>
        ) : (
          <div className="text-center">
            <h2>Hello, {user?.name}!</h2>
            <p className="text-success">Your email is verified.</p>
          </div>
        )}
      </div>

      {isEmailVerified && (
        <div className="card p-4 mt-3">
          {message && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>{message.text}</div>
          )}

          {!isEditing ? (
            <button onClick={() => { setNewName(user?.name || ""); setIsEditing(true); }} className="btn btn-secondary">Update Name</button>
          ) : (
            <div className="mt-3">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="form-control mb-2" placeholder="Enter new name" />
              <div className="d-flex gap-2">
                <button onClick={handleUpdateName} className="btn btn-success">Submit</button>
                <button onClick={() => setIsEditing(false)} className="btn btn-outline-secondary">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
