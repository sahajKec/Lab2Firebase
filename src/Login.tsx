import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) navigate("/dashboard");
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!email || !password) {
      setMessage({ text: "Please fill in all fields.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const data: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const userToken: string = await data.user.getIdToken();
      localStorage.setItem("token", userToken);

      setMessage({ text: "Login Successful! Redirecting...", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: unknown) {
      setMessage({ text: error instanceof Error ? error.message : "An unexpected error occurred.", type: "error" });
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 flex flex-col gap-8">
        <h2 className="text-center text-3xl font-bold text-gray-800">Sign In</h2>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-75"
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {message.text && (
            <p className={`text-center mt-3 text-md font-medium ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
              {message.text}
            </p>
          )}
        </form>

        <div className="text-center">
          <Link to="/register" className="text-blue-600 hover:underline">
            Don't have an account? <span className="font-semibold">Register here.</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
