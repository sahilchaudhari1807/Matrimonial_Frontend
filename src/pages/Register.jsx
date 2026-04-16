import { useState } from "react";
import { registerUser } from "../api/authApi";
import {useNavigate,Link} from "react-router-dom";

function Register({ setPage }) {

  const navigate=useNavigate();
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
    const res = await registerUser(form);

    if (res.data) {

      const userId = Date.now();

      const newUser = {
        id: userId,
        username: form.username,
        password: form.password
      };

      const users = JSON.parse(localStorage.getItem("users")) || [];

      users.push(newUser);

      localStorage.setItem("users", JSON.stringify(users));

      navigate("/login");
    }

  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <input
          type="text"
          name="username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="password"
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
        />

        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Register
        </button>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
       <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;