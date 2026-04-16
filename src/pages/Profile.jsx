import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    age: "",
    city: "",
    bio: ""
  });

  const currentUserId = localStorage.getItem("currentUserId");

  // ✅ Load existing profile (for update)
  useEffect(() => {
    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];

    const existingProfile = profiles.find(p => p.id == currentUserId);

    if (existingProfile) {
      setForm(existingProfile); // pre-fill form
    }
  }, [currentUserId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];

    const newProfile = {
      id: currentUserId,
      username: form.username,
      age: form.age,
      city: form.city,
      bio: form.bio
    };

    // ✅ Check if profile exists
    const index = profiles.findIndex(p => p.id == currentUserId);

    if (index !== -1) {
      // ✅ UPDATE
      profiles[index] = newProfile;
    } else {
      // ✅ CREATE
      profiles.push(newProfile);
    }

    // ✅ Save profiles
    localStorage.setItem("profiles", JSON.stringify(profiles));

    alert("Profile Saved!");

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {form.username ? "Update Profile" : "Create Your Profile"}
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full mb-4 p-2 border rounded"
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            className="w-full mb-4 p-2 border rounded"
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="w-full mb-4 p-2 border rounded"
          />

          <textarea
            name="bio"
            placeholder="Write something about yourself..."
            value={form.bio}
            onChange={handleChange}
            rows="4"
            className="w-full mb-4 p-2 border rounded"
          />

          <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Save Profile
          </button>

        </form>
      </div>
    </div>
  );
}

export default Profile;