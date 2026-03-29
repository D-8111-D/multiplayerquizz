import React, { useState } from "react";
import { useAuth } from "../context/UseAuth";

interface Props {
  goDashboard: () => void;
  close: () => void;
}
const API = "http://localhost:5000/api/auth";

const Login: React.FC<Props> = ({ goDashboard, close }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registerMode, setRegisterMode] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    let res;
    if (registerMode) {
      res = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: name,
          password,
        }),
      });
    } else {
      res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: name,
          password,
        }),
      });
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    const success = login(name, password, data.token);

    if (success) {
      goDashboard();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-white p-10 rounded-xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {registerMode ? "Register" : "Login"}
        </h2>

        <input
          className="w-full border p-3 rounded-lg mb-4 border-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded-lg mb-6 border-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex justify-between gap-4">
          <button
            onClick={close}
            className="flex-1 bg-gray-300 py-3 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => handleLogin()}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            {registerMode ? "Register" : "Login"}
          </button>
        </div>

        <p className="text-sm text-gray-400 text-center mt-4">
          Don’t have an account?{" "}
          <span
            className="text-indigo-400 cursor-pointer hover:underline"
            onClick={() => setRegisterMode(!registerMode)}
          >
            {registerMode ? "Login here" : "Register here"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
