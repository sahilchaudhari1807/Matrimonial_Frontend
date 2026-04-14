import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Dashboard({ setToken }) {
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem("profile"));

  useEffect(() => {
    if (!profile) {
      navigate("/profile", { replace: true });
    }
  }, [profile, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
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

        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 flex justify-between items-center">

          {/* Left */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-700">
              Welcome, {profile?.username} 👋
            </h2>
            <p className="text-gray-500 mt-2">
              Here is your profile overview and activity.
            </p>
          </div>

          {/* Right Button */}
          <button
            onClick={() => navigate("/matches")}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
          >
            Browse Matches ❤️
          </button>

        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Profile Card */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Your Profile
            </h3>

            <p><span className="font-semibold">Name:</span> {profile?.username}</p>
            <p><span className="font-semibold">Age:</span> {profile?.age}</p>
            <p><span className="font-semibold">City:</span> {profile?.city}</p>
            <p><span className="font-semibold">Bio:</span> {profile?.bio}</p>

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

            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-gray-600">
                See who viewed
              </summary>
              <ul className="mt-2 text-sm text-gray-700">
                <li>User A (Mumbai)</li>
                <li>User B (Pune)</li>
              </ul>
            </details>
          </div>

          {/* Matches */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-700">Matches</h3>
            <p className="text-3xl font-bold text-green-500 mt-2">35</p>

            <button
              onClick={() => navigate("/matches")}
              className="mt-3 w-full bg-green-500 text-white py-1 rounded hover:bg-green-600"
            >
              View Matches
            </button>
          </div>

          {/* Messages */}
          <div className="bg-white p-5 rounded-xl shadow md:col-span-3">
            <h3 className="text-lg font-semibold text-gray-700">Messages</h3>
            <p className="text-3xl font-bold text-purple-500 mt-2">12</p>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-gray-600">
                Open Messages
              </summary>
              <ul className="mt-2 text-sm text-gray-700">
                <li>Riya: Hi 👋</li>
                <li>Neha: Hello 😊</li>
              </ul>
            </details>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;