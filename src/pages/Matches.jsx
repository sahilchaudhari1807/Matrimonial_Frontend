import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Matches() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Get all users safely
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // ✅ Get current user safely
    const currentUser = JSON.parse(localStorage.getItem("profile"));

    // ✅ If no current user → stop
    if (!currentUser) return;

    // ✅ Filter out current user (better using id instead of username)
    const filtered = users.filter(
      (user) => user.id !== currentUser.id
    );

    setMatches(filtered);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Browse Matches ❤️
      </h2>

      {/* Empty State */}
      {matches.length === 0 ? (
        <p className="text-center text-gray-500">No matches found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {matches.map((user) => (
            <div
              key={user.id || user.username} // ✅ fallback safety
              onClick={() => navigate(`/profile/${user.id}`)}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            >
              {/* User Info */}
              <p><span className="font-semibold">Name:</span> {user.username}</p>
              <p><span className="font-semibold">Age:</span> {user.age}</p>
              <p><span className="font-semibold">City:</span> {user.city}</p>
              <p><span className="font-semibold">Bio:</span> {user.bio}</p>

              {/* Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // ❗ prevent navigation
                  alert(`Interest sent to ${user.username} ❤️`);
                }}
                className="mt-4 w-full bg-pink-500 text-white py-1 rounded hover:bg-pink-600"
              >
                Send Interest ❤️
              </button>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default Matches;