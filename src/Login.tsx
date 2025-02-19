import React, { useState, ChangeEvent, useEffect } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css'; // ✅ Import Bootstrap
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const userToken = localStorage.getItem('token');
      if (userToken) {
        navigate('/dashboard');
      } else {
        console.log('User is not valid');
        navigate('/');
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

  const handleLogin = async () => {
    try {
      const data: any = await signInWithEmailAndPassword(auth, email, password);
      console.log(data, 'hello sagar what a sudden suprise');
      const userToken: string = await data?.user?.accessToken;
      localStorage.setItem('token', userToken);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.log('Error msg: ', error.message);
      alert(error.message);
    }
  };

  return (
    <>
      {success && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3 w-50">
          <Alert severity="success" className="text-center">
            Successfully Logged In.
          </Alert>
        </div>
      )}

      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow-lg" style={{ width: '350px' }}>
          <h3 className="card-title text-center mb-4">Login</h3>
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
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
            <p className="text-center mt-3">
              Don't have an account?{' '}
              {/* <a href="/register" className="text-primary text-decoration-none">
                Register
              </a> */}
              <Link
                to="/register"
                className="text-primary text-decoration-none"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
