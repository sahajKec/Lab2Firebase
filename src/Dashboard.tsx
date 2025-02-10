import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import AlertMessage from './components/AlertMessage';
import { fetchUserData, logoutUser, resendVerificationEmail, updateUserName } from './services/userService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>("");
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [editing, setEditing] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [updatingName, setUpdatingName] = useState<boolean>(false);
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const handleAlertClose = () => setAlert(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                localStorage.removeItem("token");
                navigate("/");
                return;
            }
            await user.reload();
            setIsVerified(user.emailVerified);
            if (user.emailVerified) {
                const data = await fetchUserData(user.uid);
                if (data) {
                    setUserName(data.name);
                    setNewName(data.name);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const resendVerification = async () => {
        try {
            const sent = await resendVerificationEmail();
            if (sent) {
                setAlert({ message: "Verification email sent!", type: "success" });
            }
        } catch (error: any) {
            setAlert({ message: error.message, type: "error" });
        }
    };

    const logoutuser = async () => {
        setIsLoggingOut(true);
        try {
            await logoutUser();
            navigate("/");
        } catch (error: any) {
            setAlert({ message: error.message, type: "error" });
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleUpdateName = async () => {
        setUpdatingName(true);
        const success = await updateUserName(newName);
        if (success) {
            setUserName(newName);
            setEditing(false);
        }
        setUpdatingName(false);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="border border-gray-300 p-6 rounded-lg text-center w-96">
                {alert && <AlertMessage message={alert.message} type={alert.type} onClose={handleAlertClose} />}
                <div className="mb-5 text-xl font-bold">Dashboard</div>
                {!isVerified ? (
                    <div>
                        <p>You need to verify your email.</p>
                        <div className="flex justify-between mt-3 space-x-4">
                            <button onClick={resendVerification} className="bg-blue-500 text-white px-4 py-2 rounded">
                                Resend Verification Email
                            </button>
                            <button onClick={logoutuser} className={`text-white px-4 py-2 rounded ${isLoggingOut ? 'bg-gray-500' : 'bg-red-500'}`} disabled={isLoggingOut}>
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl mb-4">Hello {userName}</h2>
                        {editing ? (
                            <div>
                                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="mb-3 p-2 border rounded w-full" />
                                <div className="flex justify-between mt-3 space-x-4">
                                    <button onClick={handleUpdateName} className={`text-white px-4 py-2 rounded ${updatingName ? 'bg-gray-500' : 'bg-green-500'}`} disabled={updatingName}>
                                        {updatingName ? "Updating..." : "Submit"}
                                    </button>
                                    <button onClick={logoutuser} className={`text-white px-4 py-2 rounded ${isLoggingOut ? 'bg-gray-500' : 'bg-red-500'}`} disabled={isLoggingOut}>
                                        {isLoggingOut ? "Logging out..." : "Logout"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between mt-3 space-x-4">
                                <button onClick={() => setEditing(true)} className="bg-yellow-500 text-white px-2 py-2 rounded">
                                    Update Name
                                </button>
                                <button onClick={logoutuser} className={`text-white px-4 py-2 rounded ${isLoggingOut ? 'bg-gray-500' : 'bg-red-500'}`} disabled={isLoggingOut}>
                                    {isLoggingOut ? "Logging out..." : "Logout"}
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
