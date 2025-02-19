import React, { useState, ChangeEvent, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Import Bootstrap
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import { Alert } from "@mui/material";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const checkToken = () => {
      const userToken = localStorage.getItem("token");
      if (userToken) {
        navigate("/dashboard");
      }
    };
    checkToken();
  }, [navigate]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password).then(
        (userData) => {
          if (userData.user.uid) {
            sendEmailVerification(userData.user);
            setDoc(doc(db, "users", userData.user.uid), {
              uid: userData.user.uid,
              name: "user",
              email,
              lastlogin: serverTimestamp(),
              isVerified: userData.user.emailVerified,
              isActive: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setSuccess(true);
            signOut(auth);
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        }
      );
    } catch (error: any) {
      console.log("Error msg: ", error.message);
      alert(error.message);
    }
  };

  return (
    <>
      {success && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3 w-50">
          <Alert severity="success" className="text-center">
            Successfully registered. Check your email for verification.
          </Alert>
        </div>
      )}

      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow-lg" style={{ width: "350px" }}>
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
                className="btn btn-primary w-100"
                onClick={handleRegister}
              >
                Register
              </button>
            </div>
            <p className="text-center mt-3">
              Already have an account?{" "}
              <a href="/" className="text-primary text-decoration-none">
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
