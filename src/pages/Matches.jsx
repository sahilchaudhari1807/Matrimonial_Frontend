import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Matches() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  // =====================================================
  // ✅ HANDLE INTEREST (FIXED)
  // =====================================================
  const handleInterest = (user) => {

    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) return;

    const newInterest = {
      from: currentUserId,
      to: user.id,
      status: "pending"
    };

    const interests = JSON.parse(localStorage.getItem("interests")) || [];

    // ✅ FIX: type-safe comparison
    const alreadySent = interests.some(
      (i) =>
        String(i.from) === String(currentUserId) &&
        String(i.to) === String(user.id)
    );

    if (alreadySent) {
      alert("Already sent interest ❗");
      return;
    }

    interests.push(newInterest);
    localStorage.setItem("interests", JSON.stringify(interests));

    alert(`Interest sent to ${user.username} ❤️`);
  };

  // =====================================================
  // ✅ LOAD MATCHES (FIXED)
  // =====================================================
  useEffect(() => {

    const currentUserId = localStorage.getItem("currentUserId");
    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];

    // ✅ FIX: type-safe find
    const currentUser = profiles.find(
      (p) => String(p.id) === String(currentUserId)
    );

    if (!currentUser) return;

    // ✅ FIX: type-safe filter
    const filtered = profiles.filter(
      (user) => String(user.id) !== String(currentUserId)
    );

    setMatches(filtered);

  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Browse Matches ❤️
      </h2>

      {matches.length === 0 ? (
        <p className="text-center text-gray-500">No matches found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {matches.map((user) => (
            <div
              key={user.id}
              onClick={() => navigate(`/profile/${user.id}`)}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            >
              <p><span className="font-semibold">Name:</span> {user.username}</p>
              <p><span className="font-semibold">Age:</span> {user.age}</p>
              <p><span className="font-semibold">City:</span> {user.city}</p>
              <p><span className="font-semibold">Bio:</span> {user.bio}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInterest(user);
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