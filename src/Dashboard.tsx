import React, { useState, useEffect } from "react";
import { auth } from "./firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  updateLastLogout,
  getUserData,
  updateUsername,
} from "./firebase/firebaseUtils";
import { signOut, sendEmailVerification } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  // Set up Firebase authentication state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        navigate("/"); // Redirect to login page if the user is not authenticated
        return;
      }

      setUser(authUser); // Set authenticated user

      // Check if the email is verified
      setEmailVerified(authUser.emailVerified);

      // Fetch user data from Firestore when the user is authenticated
      try {
        const userData = await getUserData(authUser.uid);
        if (userData) {
          setUsername(userData.username || "user");
        } else {
          setUsername("user");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUsername("user");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const logoutUser = async () => {
    if (user) {
      await updateLastLogout(user.uid); // Update the last logout time
    }

    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/"); // Redirect to login page after logout
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
  };

  const handleProfileUpdate = async () => {
    if (user && newUsername.trim() !== "") {
      await updateUsername(user.uid, newUsername);
      setUsername(newUsername);
      setIsEditing(false);
      setNewUsername("");
    }
  };

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user); // Resend the verification email
        alert("Verification email sent. Please check your inbox.");
      } catch (error: any) {
        console.error("Error sending verification email:", error.message);
        alert("Error sending verification email.");
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-4">Dashboard</h2>

        {loading ? (
          <div className="text-center mb-4">
            <h3>Loading...</h3>
          </div>
        ) : (
          <>
            {/* Check if email is verified */}
            {!emailVerified ? (
              <div className="text-center mb-4 d-flex flex-column align-items-center">
                <h3>Email is not verified</h3>

                <button
                  className="btn btn-warning mb-2"
                  onClick={handleResendVerification}
                >
                  Resend Verification Email
                </button>

                <button className="btn btn-danger" onClick={logoutUser}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h3>Hello, {username || "user"}</h3>
                </div>

                <div className="d-flex justify-content-center mb-4">
                  <button className="btn btn-danger" onClick={logoutUser}>
                    Logout
                  </button>
                </div>

                {isEditing ? (
                  <div className="text-center">
                    <div className="form-group mb-3">
                      <input
                        type="text"
                        className="form-control w-50 mx-auto"
                        value={newUsername}
                        onChange={handleUsernameChange}
                        placeholder="Enter new username"
                      />
                    </div>
                    <button
                      className="btn btn-success"
                      onClick={handleProfileUpdate}
                    >
                      Update Profile
                    </button>
                    <button
                      className="btn btn-secondary ml-2"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Update Profile
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
