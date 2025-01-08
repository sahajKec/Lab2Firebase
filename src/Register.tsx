import React, { useState, ChangeEvent, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase/firebase";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      navigate("/dashboard"); // Redirect to dashboard if the token exists
    }
  }, [navigate]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);

  const handleRegister = async () => {
    try {
      const userData = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userData.user.uid) {
        // Send email verification
        await sendEmailVerification(userData.user);
        alert(
          "Registration Successful. Please check your email for verification."
        );

        // Create a Firestore document for the user with isVerified as false

        // Sign out after successful registration
        await signOut(auth);
        navigate("/"); // Redirect to login page after registration
      }
    } catch (error: any) {
      console.error("Error msg: ", error.message);
      alert(error.message); // Show error message if registration fails
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4">
        <h3 className="card-title text-center mb-4">Register</h3>
        <form>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="text-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>
        </form>
        <h3 className="d-flex justify-content-center align-items-center">
          <a href="/">Login</a>
        </h3>
      </div>
    </div>
  );
};

export default Register;
