import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase"; 
import { signOut, sendEmailVerification, updateProfile, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { User } from 'firebase/auth';
import './dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [userName, setUserName] = useState("");
    const [newName, setNewName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                navigate("/");
                return;
            }

            setUser(currentUser);
            setIsVerified(currentUser.emailVerified);

            try {
                const userRef = doc(db, "users", currentUser.uid); 
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserName(userSnap.data().name);
                    setNewName(userSnap.data().name);
                } else {
                    // If user doesn't exist in Firestore, create the document
                    console.log("User data not found in Firestore. Creating new document...");
                    await setDoc(userRef, {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        name: "user", // Default name
                        isLoggedIn: true,
                        lastLogin: Timestamp.now()
                    });
                    setUserName("user");
                    setNewName("user");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        });

        return () => unsubscribe(); 
    }, [navigate]);

    const handleNameUpdate = async () => {
        if (!newName.trim()) {
            alert("Name cannot be empty.");
            return;
        }

        if (!user || !user.uid) {
            alert("User not found.");
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            
            await updateDoc(userRef, { name: newName });

            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: newName });
            }

            setUserName(newName);
            setIsEditing(false);
            alert("Name updated successfully!");
        } catch (error) {
            console.error("Error updating name:", error);
            alert(error);
        }
    };

    const resendVerificationEmail = async () => {
        if (!auth.currentUser) {
            alert("User not found. Please log in again.");
            return;
        }

        try {
            await sendEmailVerification(auth.currentUser);
            alert("Verification email sent!");
        } catch (error) {
            console.error("Error sending verification email:", error);
            alert(error);
        }
    };

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            {isVerified ? (
                <>
                    <h2>Hello, {userName}!</h2>
                    {isEditing ? (
                        <div className="edit-name-container">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <div className="button-container">
                                <button className="save-button" onClick={handleNameUpdate}>Save</button>
                                <button className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button className="update-name-button" onClick={() => setIsEditing(true)}>Update Name</button>
                    )}
                </>
            ) : (
                <div>
                    <p>Please verify your email to access all features.</p>
                    <button className="resend-button" onClick={resendVerificationEmail}>Resend Verification Email</button>
                </div>
            )}
            <button className="logout-button" onClick={async () => { await signOut(auth); navigate("/"); }}>Logout</button>
        </div>
    );
};

export default Dashboard;
