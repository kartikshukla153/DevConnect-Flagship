import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, setUser } = useAuth();

  const navigate = useNavigate();

  const loginUser = async () => {
    console.log("========== LOGIN START ==========");
    console.log("Email:", email);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("LOGIN SUCCESS:", res.data);

      login(res.data.token);
setUser(res.data.user);

localStorage.setItem(
  "user",
  JSON.stringify(res.data.user)
);

      // Connect socket
console.log("Connecting socket with:", res.data.user.id);

navigate("/feed");
    } catch (err) {
      console.log("LOGIN FAILED:", err);

      alert(
        err.response?.data?.message ||
        err.message ||
        "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070A12] text-white">
      <div className="w-full max-w-md p-6 bg-white/5 border border-white/10 rounded-xl">

        <h1 className="text-xl font-semibold mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 bg-black/30 border border-white/10 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 bg-black/30 border border-white/10 rounded"
        />

        <button
          onClick={loginUser}
          className="w-full bg-cyan-500 text-black py-3 rounded font-semibold"
        >
          Login
        </button>

        <p
          onClick={() => navigate("/register")}
          className="mt-5 text-center cursor-pointer text-gray-400 hover:text-white"
        >
          Don't have an account? Register
        </p>

      </div>
    </div>
  );
}

export default Login;