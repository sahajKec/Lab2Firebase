import React, { useState, ChangeEvent, useEffect } from "react";
import { auth } from "./firebase/firebase";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();
  const db = getFirestore();

  // Check if the user is already logged in by checking for a token
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      navigate("/dashboard"); // Redirect to dashboard if token exists
    }
  }, [navigate]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const userData = await signInWithEmailAndPassword(auth, email, password);

      //create a collection doc

      if (exists()) {
        //create docs
        if (user) {
          // If email is verified, store token and navigate to dashboard
          const userToken = await userData.user.getIdToken();
          localStorage.setItem("token", userToken);
          navigate("/dashboard");
        } else {
          // If email is not verified, show alert
          setError("Please verify your email before logging in.");
        }
      } else {
        setError("User not found!");
      }
    } catch (err: any) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: "400px" }}>
        <h3 className="card-title text-center mb-4">Login</h3>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

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
              placeholder="Enter your email"
              required
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
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="text-center mb-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        {/* Center the register link */}
        <div className="text-center mb-4">
          <h3>
            <a href="/register">Don't have an account? Register</a>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Login;
