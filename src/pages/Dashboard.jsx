import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard({ setToken }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);

  // ✅ FIX 1: define data BEFORE using
  const currentUserId = localStorage.getItem("currentUserId");
  const profiles = JSON.parse(localStorage.getItem("profiles")) || [];

  // ✅ FIX 2: type-safe comparison
  const currentUser = profiles.find(
    (p) => String(p.id) === String(currentUserId)
  );

  // =====================================================
  // ✅ MATCH LOGIC (FIXED)
  // =====================================================
  useEffect(() => {

    const interests = JSON.parse(localStorage.getItem("interests")) || [];

    if (!currentUser) return;

    // ✅ FIX 3: type-safe comparison
    const sent = interests.filter(
      (i) => String(i.from) === String(currentUser.id)
    );

    const received = interests.filter(
      (i) => String(i.to) === String(currentUser.id)
    );

    const mutual = sent.filter((s) =>
      received.some((r) => String(r.from) === String(s.to))
    );

    const matchedUsers = mutual
      .map((m) =>
        profiles.find((u) => String(u.id) === String(m.to))
      )
      .filter(Boolean);

    setMatches(matchedUsers);

  // ✅ FIX 4: prevent infinite loop
  }, [currentUserId]);

  // =====================================================
  // ✅ REDIRECT LOGIC (FIXED)
  // =====================================================
  useEffect(() => {

    // ✅ FIX 5: check login first
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    // ✅ FIX 6: then check profile
    if (!currentUser) {
      navigate("/profile", { replace: true });
    }

  // ✅ FIX 7: correct dependency
  }, [currentUserId, currentUser, navigate]);

  // =====================================================
  // ✅ LOGOUT
  // =====================================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUserId"); // ✅ important
    setToken(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          Matrimonial Dashboard
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/matches")}
            className="text-gray-700 hover:text-pink-500 font-medium"
          >
            Matches
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">

        {/* Welcome */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700">
              Welcome, {currentUser?.username} 👋
            </h2>
            <p className="text-gray-500 mt-2">
              Here is your profile overview and activity.
            </p>
          </div>

          <button
            onClick={() => navigate("/matches")}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
          >
            Browse Matches ❤️
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Profile */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Your Profile
            </h3>

            <p><span className="font-semibold">Name:</span> {currentUser?.username}</p>
            <p><span className="font-semibold">Age:</span> {currentUser?.age}</p>
            <p><span className="font-semibold">City:</span> {currentUser?.city}</p>
            <p><span className="font-semibold">Bio:</span> {currentUser?.bio}</p>

            <button
              onClick={() => navigate("/profile")}
              className="mt-4 w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </div>

          {/* Profile Views */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Profile Views
            </h3>
            <p className="text-3xl font-bold text-blue-500 mt-2">120</p>
          </div>

          {/* Matches Count */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-700">Matches</h3>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {matches.length}
            </p>

            <button
              onClick={() => navigate("/matches")}
              className="mt-3 w-full bg-green-500 text-white py-1 rounded hover:bg-green-600"
            >
              View Matches
            </button>
          </div>

          {/* MATCHES UI */}
          <div className="bg-white p-5 rounded-xl shadow md:col-span-3">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Your Matches ❤️
            </h3>

            {matches.length === 0 ? (
              <p className="text-gray-500 text-center">
                No matches yet 😢
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {matches.map((user) => (
                  <div
                    key={user.id}
                    className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                  >
                    <h4 className="text-lg font-bold text-gray-800">
                      {user.username}
                    </h4>

                    <p className="text-sm text-gray-600 mt-1">
                      🎂 {user.age} | 📍 {user.city}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      {user.bio}
                    </p>

                    <button className="mt-3 w-full bg-green-500 text-white py-1 rounded hover:bg-green-600">
                      Message 💬
                    </button>
                  </div>
                ))}

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;