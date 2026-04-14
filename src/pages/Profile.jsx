import { useState } from "react";
import {useNavigate} from "react-router-dom";

function Profile() {
    const navigate=useNavigate();
  const [form, setForm] = useState({
    username: "",
    age: "",
    city: "",
    bio: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  // ✅ NEW: create user with unique id
  const newUser = {
    id: Date.now(),   // 🔥 CHANGE 1 (important)
    ...form
  };

  // 1. Save current profile
  localStorage.setItem("profile", JSON.stringify(newUser)); // 🔥 CHANGE 2

  // 2. Get existing users
  const existingUsers = localStorage.getItem("users");

  // 3. Parse or initialize empty array
  const users = existingUsers ? JSON.parse(existingUsers) : [];

  // 4. Add new user
  users.push(newUser); // 🔥 CHANGE 3

  // 5. Save updated users list
  localStorage.setItem("users", JSON.stringify(users));

  alert("Profile Saved!");

  navigate("/dashboard");
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create Your Profile
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Age */}
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* City */}
          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Bio */}
          <textarea
            name="bio"
            placeholder="Write something about yourself..."
            value={form.bio}
            onChange={handleChange}
            rows="4"
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Submit Button */}
          <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Save Profile
          </button>

        </form>
      </div>
    </div>
  );
}

export default Profile;