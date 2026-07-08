import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const registerUser = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      console.log("REGISTER SUCCESS:", res.data);

      alert("Registration successful");
      navigate("/login");

    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data);

      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070A12] text-white">

      <div className="w-full max-w-md p-6 bg-white/5 border border-white/10 rounded-xl">

        <h1 className="text-xl font-semibold mb-6">Register</h1>

        <input
          placeholder="Name"
          className="w-full mb-3 p-3 bg-black/30 border border-white/10 rounded"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="w-full mb-3 p-3 bg-black/30 border border-white/10 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full mb-4 p-3 bg-black/30 border border-white/10 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={registerUser}
          className="w-full py-3 bg-cyan-500 text-black rounded hover:opacity-90"
        >
          Register
        </button>

        <p
          onClick={() => navigate("/login")}
          className="text-xs text-center mt-4 text-white/50 cursor-pointer hover:text-white"
        >
          Already have an account? Login
        </p>

      </div>
    </div>
  );
}

export default Register;