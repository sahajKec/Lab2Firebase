import { useState, useEffect, ChangeEvent } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    setMessage({ text: "", type: "" });
    setLoading(true);

    try {
      const data: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const userToken: string = await data.user.getIdToken();

      if (userToken) {
        localStorage.setItem("token", userToken);
        setMessage({ text: "Login Successful! Redirecting...", type: "success" });

        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({ text: "An unexpected error occurred.", type: "error" });
      }
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-md bg-gray-800 shadow-lg rounded-2xl p-8 flex flex-col gap-8 border border-gray-700 text-white">
        
        <h2 className="text-center text-3xl font-bold">Welcome Back</h2>

        <form className="space-y-5">
          {message.text && (
            <p className={`text-center text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {message.text}
            </p>
          )}

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-md text-white font-semibold transition ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center">
          <Link to="/register" className="text-sm text-gray-400 hover:text-white">
            Don't have an account? <span className="font-semibold">Register here.</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
