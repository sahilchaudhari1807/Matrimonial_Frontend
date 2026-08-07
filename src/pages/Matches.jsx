import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Matches() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();


  // =====================================================
  // Send Interest
  // =====================================================
  const handleInterest = (user) => {

    const currentUserId = localStorage.getItem("currentUserId");

    if (!currentUserId) return;

    fetch(
      `http://localhost:8081/send?fromUserId=${currentUserId}&toUserId=${user.userId}`,
      {
        method: "POST",
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to send interest");
        }

        alert(`Interest sent to ${user.name} ❤️`);

        return fetch(
          `http://localhost:8081/interests/profiles/${currentUserId}`
        );
      })
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // =====================================================
  // Accept Interest
  // =====================================================
  const handleAccept = (user) => {

    const currentUserId = localStorage.getItem("currentUserId");

    const senderId = user.userId;
    const receiverId = currentUserId;

    fetch(
      `http://localhost:8081/accept?fromUserId=${senderId}&toUserId=${receiverId}`,
      {
        method: "PUT",
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to accept request");
        }

        return fetch(
          `http://localhost:8081/interests/profiles/${currentUserId}`
        );
      })
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        alert(`You accepted ${user.name}'s interest ❤️`);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // =====================================================
  // Reject Interest
  // =====================================================
  const handleReject = (user) => {

    const currentUserId = localStorage.getItem("currentUserId");

    const senderId = user.userId;
    const receiverId = currentUserId;

    fetch(
      `http://localhost:8081/reject?fromUserId=${senderId}&toUserId=${receiverId}`,
      {
        method: "PUT",
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to reject request");
        }

        return fetch(
          `http://localhost:8081/interests/profiles/${currentUserId}`
        );
      })
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        alert(`You rejected ${user.name}'s interest.`);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {

    /* fetch("http://localhost:8081/users")*/
    const currentUserId = localStorage.getItem("currentUserId");

    fetch(`http://localhost:8081/interests/profiles/${currentUserId}`)
      .then((res) => res.json())
      .then((profiles) => {

      //  console.log("Profiles:", profiles);

        setMatches(profiles);

      })
      .catch((err) => {
        console.error(err);
      });

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
              key={user.userId}
              onClick={() => navigate(`/profile/${user.userId}`)}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            >
              <p><span className="font-semibold">Name:</span> {user.name}</p>
              <p><span className="font-semibold">Age:</span> {user.age}</p>
              <p><span className="font-semibold">City:</span> {user.city}</p>

              {/* first condition that if no one can send the interest then send interest button is visible */}
              {user.relationship === "NONE" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInterest(user);
                  }}
                  className="mt-4 w-full bg-pink-500 text-white py-1 rounded hover:bg-pink-600"
                >
                  Send Interest ❤️
                </button>
              )


              }

              {/* if user A send the request to B then user A already sent the request user a cannot send interest again till th user b reject */}
              {user.relationship === "SENT" && (
                <button
                  disabled
                  className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded-lg cursor-not-allowed font-semibold"
                >
                  ✓ Interest Sent
                </button>
              )}
              {/* now when when request is received */}
              {user.relationship === "RECEIVED" && (
                <div className="mt-4 flex gap-2">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(user);
                    }}
                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                  >
                    Accept
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(user);
                    }}
                    className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                  >
                    Reject
                  </button>

                </div>

              )}


              {user.relationship === "MATCHED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Later navigate to chat
                  }}
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  💬 Chat
                </button>
              )}
            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default Matches;