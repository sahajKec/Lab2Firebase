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

const Register = () => {
  const db = getFirestore();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleRegister = async () => {
    setErrorMessage(null);
    setVerificationMessage(null);
    setLoading(true);

    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: "user",
        isLoggedIn: false,
        lastLogin: new Date(),
      });
      await updateProfile(user, { displayName: "user" });

      setVerificationMessage("Registration Successful! Check your email to verify your account.");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-md bg-gray-800 shadow-lg rounded-2xl p-8 flex flex-col gap-8 border border-gray-700 text-white">
        
        <h2 className="text-center text-3xl font-bold">Create an Account</h2>

        <form className="space-y-5">
          {errorMessage && <p className="text-center text-sm text-red-400">{errorMessage}</p>}

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
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
              className="mt-1 w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Create a password"
            />
          </div>

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-3 rounded-md text-white font-semibold transition ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-600"}`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          {verificationMessage && <p className="text-center text-sm text-green-400">{verificationMessage}</p>}
        </form>

        <div className="text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-white">
            Already have an account? <span className="font-semibold">Sign in here.</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
