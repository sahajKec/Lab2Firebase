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
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      await updateProfile(user, { displayName: "user" });

      setVerificationMessage(
        "Registration Successful! Check your email to verify your account."
      );

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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg shadow-xl rounded-3xl p-10 flex flex-col gap-8 border border-white/20">
        <h2 className="text-center text-3xl font-bold text-white">
          Create an Account
        </h2>

        <form className="space-y-6 flex flex-col gap-4">
          {errorMessage && (
            <p className="text-center text-md font-medium text-red-400">
              {errorMessage}
            </p>
          )}
          <div>
            <label htmlFor="email" className="block text-white font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="mt-1 w-full p-3 border rounded-xl bg-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-white font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="mt-1 w-full p-3 border rounded-xl bg-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
              placeholder="Create a password"
            />
          </div>

          <button
            type="button"
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-80 text-white font-semibold py-3 rounded-xl transition shadow-lg"
          >
            Sign Up
          </button>

          {verificationMessage && (
            <p className="text-center mt-3 text-md font-medium text-green-400">
              {verificationMessage}
            </p>
          )}
        </form>

        <div className="text-center">
          <Link to="/" className="text-white hover:underline">
            Already have an account?{" "}
            <span className="font-semibold">Sign in here.</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
