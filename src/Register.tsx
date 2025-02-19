import { useState, useEffect, ChangeEvent } from "react";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    UserCredential,
} from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const Register = () => {
    const db = getFirestore();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false); // Track loading state
    const navigate = useNavigate();

    useEffect(() => {
        const userToken = localStorage.getItem("token");
        if (userToken) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true); // Set loading to true when registration starts

        try {
            const userCredential: UserCredential =
                await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                name: "user",
                isLoggedIn: false,
                lastLogin: new Date(),
            });

            try {
                await updateProfile(user, { displayName: "user" });
            } catch (updateError) {
                console.error("Error updating display name:", updateError);
            }

            toast.success(
                "Account created successfully! Please verify your email."
            );

            navigate("/");
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Registration error:", error.message);
                toast.error(error.message);

                if (error.message.includes("password")) {
                    setPassword("");
                }
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setPassword("");
            setLoading(false);
            setConfirmPassword("");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-sm rounded-xl flex flex-col justify-center items-center border border-gray-200 bg-white shadow-2xl gap-4">
                <div className="w-full max-w-sm rounded-xl py-8 flex flex-col justify-center items-center border border-white/30 bg-white shadow-2xl gap-6">
                    <div>
                        <h2 className="text-center text-lg font-bold">
                            Create your account
                        </h2>

                        <h6 className="text-sm text-gray-500">
                            Welcome! Please fill in the details to get started.
                        </h6>
                    </div>
                    <form className="w-full space-y-6 flex flex-col px-8">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setEmail(e.target.value)
                                }
                                className="mt-1 w-full h-8 px-2 border border-gray-300 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-500"
                                placeholder="Enter your email address"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setPassword(e.target.value)
                                }
                                className="mt-1 w-full h-8 px-2 border border-gray-300 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-500"
                                placeholder="Enter your password"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="confirm-password"
                                className="block text-sm font-semibold"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className="mt-1 w-full h-8 px-2 border border-gray-300 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-500"
                                placeholder="Enter your password again"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleRegister}
                            disabled={loading} // Disable the button when loading
                            className="w-full py-1 text-sm cursor-pointer text-white font-semibold rounded-md border border-gray-800 transition
               bg-gradient-to-b from-gray-700 to-gray-950 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_3px_6px_rgba(0,0,0,0.5)]
               hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_5px_10px_rgba(0,0,0,0.6)]
               active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                        >
                            {loading ? (
                                <span className="animate-spin">
                                    Registering ...
                                </span>
                            ) : (
                                <>
                                    Continue{" "}
                                    <span className="text-xs pl-1">➤</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center text-gray-200 text-sm py-4">
                    <span className="text-gray-400">
                        Already have an account?{" "}
                        <Link to="/" className="hover:underline text-gray-900">
                            Sign in
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Register;
