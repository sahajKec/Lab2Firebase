import React, { useState, ChangeEvent, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import ReusableInput from './components/ReusableInput';
import AlertMessage from './components/AlertMessage';
import { registerUser } from './services/authService';

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleAlertClose = () => setAlert(null);

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) navigate("/dashboard");
    else navigate("/register");
  }, [navigate]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const result = await registerUser(email, password);
      setAlert({ message: result.message, type: "success" });
      navigate("/");
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setAlert({ message: "Email is already in use!", type: 'info'});
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
        <h3 className="card-title text-center mb-4">Register</h3>
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
            <button type="button" className="btn btn-primary" onClick={handleRegister} disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <a href="/">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
