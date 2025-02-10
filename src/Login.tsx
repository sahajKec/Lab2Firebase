import React, { useState, ChangeEvent, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import ReusableInput from './components/ReusableInput';
import AlertMessage from './components/AlertMessage';
import { loginUser } from './services/authService';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleAlertClose = () => setAlert(null);

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) navigate("/dashboard");
    else {
      console.log("User is not valid");
      navigate("/");
    }
  }, [navigate]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginUser(email, password);
      if (result.success) {
        navigate('/dashboard', { state: { isVerified: true } });
      }
    } catch (error: any) {
      switch (error.code) {
        case "auth/invalid-login-credentials":
          setAlert({message: "Either Email or Password is incorrect!", type: "error"})
          break;
      
        default:
          setAlert({ message: error.message, type: "error" });
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
        {alert && <AlertMessage message={alert.message} type={alert.type} onClose={handleAlertClose} />}
        <h3 className="card-title text-center mb-4">Login</h3>
        <form>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <ReusableInput id="email" type="email" value={email} onChange={handleEmailChange} placeholder="Enter your email" />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <ReusableInput id="password" type="password" value={password} onChange={handlePasswordChange} placeholder="Enter your password" />
          </div>
          <div className="text-center">
            <button type="button" className="btn btn-primary w-100" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
          <div className="text-center mt-3">
            <a href="/register">Register</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
