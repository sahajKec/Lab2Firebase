import { useState, useEffect, ChangeEvent } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    setMessage({ text: "", type: "" });
    try {
      const data: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userToken: string = await data.user.getIdToken();
      if (userToken) {
        localStorage.setItem("token", userToken);
        setMessage({
          text: "Login Successful! Redirecting...",
          type: "success",
        });
        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({ text: "An unexpected error occurred.", type: "error" });
      }
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-tr from-white to-blue-200">
      <div className="w-full max-w-md bg-black/10 backdrop-blur-lg shadow-xl rounded-3xl p-10 flex flex-col gap-8 border border-black/20">
        <h2 className="text-center text-3xl font-bold text-black">
          Welcome Back
        </h2>

        <form className="space-y-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-black font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="mt-1 w-full p-3 border rounded-xl bg-black/20 placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              placeholder="Enter your email"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-black font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="mt-1 w-full p-3 border rounded-xl bg-black/20 placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-blue-800 hover:opacity-80 text-white font-semibold py-3 rounded-xl transition shadow-lg"
          >
            Login
          </button>

          {message.text && (
            <p
              className={`text-center mt-3 text-md font-medium ${
                message.type === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {message.text}
            </p>
          )}
        </form>

        <div className="text-center">
          <Link to="/register" className="text-black hover:underline">
            Not registered yet?{" "}
            <span className="font-semibold text-blue-700">Register here.</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
