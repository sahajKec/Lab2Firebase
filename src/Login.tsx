import { useState, useEffect, ChangeEvent } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false); // Add loading state
    const navigate = useNavigate();

    useEffect(() => {
        const userToken = localStorage.getItem("token");
        if (userToken) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleLogin = async () => {
        setLoading(true); // Set loading to true when login starts
        try {
            const data: UserCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const userToken: string = await data.user.getIdToken();
            if (userToken) {
                localStorage.setItem("token", userToken);
                navigate("/dashboard");
                toast.success("Logged in successfully.");
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An error occurred. Please try again later.");
            }
            setPassword("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-sm rounded-xl flex flex-col justify-center items-center border border-gray-200 bg-white shadow-2xl gap-4">
                <div className="w-full max-w-sm rounded-xl p-8 flex flex-col justify-center items-center border border-white/30 bg-white shadow-2xl gap-6">
                    <div>
                        <h2 className="text-center text-lg font-bold">
                            Sign in to the Portal
                        </h2>

                        <h6 className="text-sm text-gray-500">
                            Welcome back! Please login to continue.
                        </h6>
                    </div>

                    <form className="w-full space-y-6 flex flex-col">
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

                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={loading} // Disable the button during loading
                            className="w-full py-1 text-sm cursor-pointer text-white font-semibold rounded-md border border-gray-800 transition
               bg-gradient-to-b from-gray-700 to-gray-950 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_3px_6px_rgba(0,0,0,0.5)]
               hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_5px_10px_rgba(0,0,0,0.6)]
               active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                        >
                            {loading ? (
                                <span className="animate-spin">
                                    Logging in ...
                                </span> // Spinner while loading
                            ) : (
                                <>
                                    Continue{" "}
                                    <span className="text-xs pl-1">➤</span>{" "}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center text-gray-200 text-sm py-4">
                    <span className="text-gray-400">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="hover:underline text-gray-900"
                        >
                            Sign up
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
