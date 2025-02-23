import { useState, useEffect, ChangeEvent } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const Register = () => {
  const navigate = useNavigate();
  const db = getFirestore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({
    text: "",
    type: "",
  });

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const updateField = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegistration = async () => {
    setNotification({ text: "", type: "" });

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: "New User",
        registeredAt: new Date(),
      });
      await updateProfile(user, { displayName: "New User" });

      setNotification({
        text: "Verification email sent! Please check your inbox.",
        type: "success",
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      setNotification({
        text: error.message || "Error registering.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-tr from-white to-blue-200">
      <div className="w-full max-w-md bg-black/10 backdrop-blur-lg shadow-xl rounded-3xl p-10 flex flex-col gap-8 border border-black/20">
        <h2 className="text-black text-center text-3xl font-bold mb-6">
          Create Your Account
        </h2>
        {notification.text && (
          <p
            className={`text-center p-2 mb-4 rounded ${
              notification.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {notification.text}
          </p>
        )}
        <div className="space-y-4">
          <label htmlFor="email" className="block text-black font-medium">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={updateField}
            className="mt-1 w-full p-3 border rounded-xl bg-black/20 placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
          <label htmlFor="password" className="block text-black font-medium">
            Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={updateField}
            className="mt-1 w-full p-3 border rounded-xl bg-black/20 placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 pr-10"
          />
          <button
            onClick={handleRegistration}
            className="w-full bg-blue-800 hover:opacity-80 text-white font-semibold py-3 rounded-xl transition shadow-lg"
          >
            Register
          </button>
        </div>
        <div className="text-center mt-6">
          <p className="text-black hover:underline">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-blue-700">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
