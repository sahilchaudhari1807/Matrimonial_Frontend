import { useState } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";

function Login({ setToken }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(form);

    if (res.data && res.data.token) {

  localStorage.setItem("token", res.data.token);
  setToken(res.data.token);

  // ✅ Get users
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // ✅ Find current user
  const user = users.find(
  (u) => u.username === form.username
);

  if (!user) {
    alert("User not found");
    return;
  }

  // ✅ Store current user ID
  localStorage.setItem("currentUserId", user.id);

const currentUserId = user.id;

  // ✅ Get profiles
  const profiles = JSON.parse(localStorage.getItem("profiles")) || [];

  // ✅ Find profile using ID
  const userProfile = profiles.find((p) => String(p.id) === String(currentUserId));

  if (userProfile) {
    navigate("/dashboard");
  } else {
    navigate("/profile");
  }
} else {
        alert("Invalid response from server");
      }

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
        />

        <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Login
        </button>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;