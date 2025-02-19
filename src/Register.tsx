import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const Register = () => {
  const db = getFirestore();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) navigate("/dashboard");
  }, [navigate]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!email || !password) {
      setMessage({ text: "Please fill in all fields.", type: "error" });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters long.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      await updateProfile(user, { displayName: "User" });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: "User",
        isLoggedIn: false,
        lastLogin: new Date(),
      });

      setMessage({ text: "Check your email to verify your account!", type: "success" });
      setTimeout(() => navigate("/"), 2000);
    } catch (error: unknown) {
      setMessage({
        text: error instanceof Error ? error.message : "An unexpected error occurred.",
        type: "error",
      });
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1a1a2e]">
      <div className="w-full max-w-md bg-[#16213e] shadow-lg rounded-xl p-8 flex flex-col gap-8">
        <h2 className="text-center text-3xl font-bold text-[#f8f8f8]">Sign Up</h2>

        <form className="space-y-5" onSubmit={handleRegister}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#FFF]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border border-[#e94560] bg-[#0f3460] text-white rounded-md focus:ring-[#f8f8f8] focus:border-[#f8f8f8]"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#FFF]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border border-[#e94560] bg-[#0f3460] text-white rounded-md focus:ring-[#f8f8f8] focus:border-[#f8f8f8]"
              placeholder="Create a password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-md transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#e94560] to-[#903749] hover:opacity-75"
            }`}
          >
            {loading ? "Signing Up..." : "Register"}
          </button>

          {message.text && (
            <p className={`text-center mt-3 text-md font-medium ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {message.text}
            </p>
          )}
        </form>

        <div className="text-center">
          <Link to="/" className="text-[#e94560] hover:underline">
            Already have an account? <span className="font-semibold">Log in here.</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
