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
import toast from "react-hot-toast";
import { FiLogOut, FiEdit3, FiCheck, FiX } from "react-icons/fi";

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
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setIsEmailVerified(currentUser.emailVerified);
                try {
                    const userDoc = await getDoc(
                        doc(db, "users", currentUser.uid)
                    );
                    if (userDoc.exists()) {
                        setUser(userDoc.data() as UserData);
                    } else {
                        const newUser: UserData = {
                            uid: currentUser.uid,
                            email: currentUser.email ?? "",
                            name: "User",
                        };
                        await setDoc(
                            doc(db, "users", currentUser.uid),
                            newUser
                        );
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
        setIsUpdating(true);
        try {
            await updateProfile(auth.currentUser as User, {
                displayName: newName,
            });
            await updateDoc(doc(db, "users", user.uid), { name: newName });
            setUser((prevUser) =>
                prevUser ? { ...prevUser, name: newName } : null
            );
            setIsEditing(false);
            toast.success("Your name was updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update name.");
        }
        setIsUpdating(false);
    };

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem("token");
        navigate("/");
        toast.success("Logged out successfully.");
    };

    const handleResendVerification = async () => {
        if (auth.currentUser) {
            try {
                await sendEmailVerification(auth.currentUser);
                toast.success("Verification email sent!");
            } catch (error) {
                console.error("Error sending verification email:", error);
                toast.error("Failed to resend verification email.");
            }
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">
                <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-gray-500 border-solid"></div>
            </div>
        );

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <nav className="bg-gray-900 shadow p-4 flex justify-between items-center text-white">
                <h1 className="text-2xl font-bold">Portal</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700 cursor-pointer transition"
                >
                    <FiLogOut /> Logout
                </button>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="bg-gray-100 shadow-md rounded-lg p-6">
                    {!isEmailVerified ? (
                        <div>
                            <h2 className="text-gray-800 mb-2 text-lg font-semibold">
                                Warning!
                            </h2>
                            <p className="text-gray-700 text-lg mb-4">
                                Verify your email to access all features.
                            </p>
                            <button
                                onClick={handleResendVerification}
                                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition cursor-pointer"
                            >
                                Resend Verification Email
                            </button>
                        </div>
                    ) : (
                        <h2 className="text-gray-800 text-3xl font-semibold">
                            Welcome, {user?.name}!
                        </h2>
                    )}
                </div>

                {isEmailVerified && (
                    <div className="bg-gray-100 shadow-md rounded-lg p-6 mt-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            Actions
                        </h2>
                        {!isEditing ? (
                            <button
                                onClick={() => {
                                    setNewName(user?.name || "");
                                    setIsEditing(true);
                                }}
                                className="bg-blue-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-800 transition cursor-pointer"
                            >
                                <FiEdit3 /> Update Name
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="px-4 py-2 border border-gray-400 rounded focus:ring-gray-500 transition focus:ring-2 focus:outline-none"
                                    placeholder="Enter new name"
                                />
                                <button
                                    onClick={handleUpdateName}
                                    className="bg-green-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition cursor-pointer"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        "Updating..."
                                    ) : (
                                        <>
                                            <FiCheck /> Submit
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-red-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700 transition cursor-pointer"
                                >
                                    <FiX /> Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
