import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard({ setToken }) {

  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [incomingRequest, setIncomingRequest] =
    useState([]);
  const [userStatuses, setUserStatuses] = useState({});
  const [dashBoardChats, setDashBoardChats] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const [receivedRequests, setReceivedRequests] = useState([]);


  const currentUserId =
    localStorage.getItem("currentUserId");


useEffect(() => {

  fetch("http://localhost:8081/users")
    .then((res) => res.json())
    .then((data) => setProfiles(data))
    .catch((err) => console.log(err));

}, []);
  

  const currentUser = profiles.find(
    (p) => String(p.id) === String(currentUserId)
  );

  // =====================================================
  // REDIRECT LOGIC
  // =====================================================
  useEffect(() => {
    console.log("currentUserId:", currentUserId);
    console.log("currentUser:", currentUser);
    if (!currentUserId) {
      navigate("/login");
      return;
    }

   /* if (!currentUser) {
      navigate("/profile", { replace: true });
    }*/
  }, [currentUserId, currentUser, navigate]);

  // =====================================================
  // INCOMING REQUESTS
  // =====================================================
  useEffect(() => {

  console.log(
    "currentUserId:",
    localStorage.getItem("currentUserId")
  );

  fetch(
    `http://localhost:8081/interests/incoming/${currentUserId}`
  )
    .then((res) => res.json())
    .then((data) => {

      console.log(
        "Incoming Requests:",
        data
      );

      setIncomingRequest(data);

    })
    .catch((err) => {
      console.log(err);
    });

}, [currentUserId]);
  // =====================================================
  // MATCHES
  // =====================================================
  useEffect(() => {
  

     fetch(`http://localhost:8081/GetMatches/${currentUserId}`)
     .then((res)=>res.json())
     .then((data)=>{
      console.log("Matches API:", data);
      setMatches(data);
     })
     .catch((err)=>console.log(err));
  }, [currentUserId]);

  // =====================================================
  // LOAD CHATS
  // =====================================================



  useEffect(() => {


    const updateOnlineStatus = async () => {

      console.log(
        "currentUserId:",
        currentUserId
      );

      console.log(
        "Number:",
        Number(currentUserId)
      );

      try {
        const response = await fetch(`http://localhost:8081/status/online/${Number(currentUserId)}/${true}`, {
          method: "PUT"
        })
        console.log("Status Code:", response.status);
        console.log("Response:", await response.text());
      } catch (error) {
        console.log("error", error);
      }
    }

    // 🔹 Handle offline user
    const handleOffline = async () => {

      console.log(
        "currentUserId:",
        currentUserId
      );

      console.log(
        "Number:",
        Number(currentUserId)
      );
      try {
        const response = await fetch(`http://localhost:8081/status/online/${Number(currentUserId)}/${false}`, {
          method: "PUT"
        })
      } catch (error) {
        console.log("error", error);
      }

    };

    // 🔹 Add browser event
    window.addEventListener(
      "beforeunload",
      handleOffline
    );

    updateOnlineStatus();
    // 🔹 Cleanup
    return () => {
      window.removeEventListener(
        "beforeunload",
        handleOffline
      );
    };



  }, []);





  // unread counts




  useEffect(() => {

    const fetchOnlineUsers = async () => {

      for (const chat of dashBoardChats) {

        const response = await fetch(
          `http://localhost:8081/status/${chat.otherUserId}`
        );

        const statusData = await response.json();

        setUserStatuses((prev) => ({
          ...prev,
          [chat.otherUserId]: statusData
        }));

      }

    };

    fetchOnlineUsers();

    const interval = setInterval(() => {
      fetchOnlineUsers();
    }, 3000);

    return () => clearInterval(interval);

  }, [dashBoardChats]);
  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = async () => {

    try {

      // 🔹 Update offline status in backend
      await fetch(
        `http://localhost:8081/status/online/${Number(currentUserId)}/${false}`,
        {
          method: "PUT"
        }
      );

    } catch (error) {

      console.log(
        "Offline update error",
        error
      );

    }

    // 🔹 Remove auth data
    localStorage.removeItem("token");
    localStorage.removeItem("currentUserId");

    setToken(null);

    // 🔹 Navigate to login
    navigate("/login");

  };


  /// getting all data last seen,last message etc
  useEffect(() => {
    const fetchDashBoardChats = async () => {
      try {
        const response = await fetch(`http://localhost:8081/messages/dashboard/${currentUserId}`);

        const data = await response.json();
        setDashBoardChats(data);
      } catch (error) {
        console.log("error while fetching data", error);
      }



    }
    fetchDashBoardChats();


    const interval=setInterval(()=>{
      fetchDashBoardChats();
    },10000)

    return () => clearInterval(interval);
  }, [currentUserId])



  // =====================================================
  // ACCEPT REQUEST
  // =====================================================
 const handleAccept = (senderId) => {
  fetch(
    `http://localhost:8081/accept?fromUserId=${senderId}&toUserId=${currentUserId}`,
    {
      method: "PUT",
    }
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to accept request");
      }

      // Fetch updated requests after accept
      return fetch(
        `http://localhost:8081/interests/AllRequest/${currentUserId}`
      );
    })
    .then((res) => res.json())
    .then((data) => {
      setReceivedRequests(data);
    })
    .catch((err) => {
      console.error(err);
    });
};

useEffect(() => {
  fetch(`http://localhost:8081/interests/AllRequest/${currentUserId}`)
    .then(res => res.json())
    .then(data => setReceivedRequests(data));
}, []);

    
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-100">

      {/* ================= NAVBAR ================= */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm px-6 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Matrimonial Dashboard
        </h1>

        <div className="flex items-center gap-5">

          {/* Notification */}
          <div className="relative cursor-pointer">
            <span className="text-2xl">
              🔔
            </span>

            <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
          </div>

          <button
            onClick={() => navigate("/matches")}
            className="font-medium text-gray-700 hover:text-pink-500 transition"
          >
            Matches
          </button>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Logout
          </button>

        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="p-6">

        {/* ================= HERO SECTION ================= */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row justify-between items-center text-white mb-8">

          <div className="flex items-center gap-5">

            <img
              src={`https://i.pravatar.cc/150?img=${currentUser?.id}`}
              alt="profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-xl"
            />

            <div>

              <h2 className="text-3xl font-bold">
                Welcome, {currentUser?.name} 👋
              </h2>

              <p className="mt-2 text-pink-100">
                Find your perfect life partner ❤️
              </p>

            </div>
          </div>

          <button
            onClick={() => navigate("/matches")}
            className="mt-5 md:mt-0 bg-white text-pink-500 px-8 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Browse Matches ❤️
          </button>

        </div>

        {/* ================= STATS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* PROFILE CARD */}
          <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-pink-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

            <div className="flex items-center gap-4 mb-5">

              <img
                src={`https://i.pravatar.cc/100?img=${currentUser?.id}`}
                alt="profile"
                className="w-20 h-20 rounded-full"
              />

              <div>

                <h3 className="text-xl font-bold text-gray-800">
                  {currentUser?.name}
                </h3>

                <p className="text-gray-500">
                  📍 {currentUser?.city}
                </p>

              </div>

            </div>

            <div className="space-y-2 text-gray-700">

              <p>
                <span className="font-semibold">
                  🎂 Age:
                </span>{" "}
                {currentUser?.age}
              </p>

              <p>
                <span className="font-semibold">
                  💬 Bio:
                </span>{" "}
                {currentUser?.bio}
              </p>

            </div>

            <button
              onClick={() => navigate("/profile")}
              className="mt-5 w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Edit Profile
            </button>

          </div>

          {/* PROFILE VIEWS */}
          <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-pink-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              👁️ Profile Views
            </h3>

            <p className="text-5xl font-bold text-blue-500 mt-5">
              120
            </p>

            <p className="text-gray-500 mt-2">
              People viewed your profile this week
            </p>

          </div>

          {/* MATCH COUNT */}
          <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-pink-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              ❤️ Matches
            </h3>

            <p className="text-5xl font-bold text-green-500 mt-5">
              {matches.length}
            </p>

            <p className="text-gray-500 mt-2">
              You have amazing connections ✨
            </p>

          </div>

        </div>

        {/* ================= MATCHES SECTION ================= */}
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-pink-100 mt-8">

          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            ❤️ Your Matches
          </h3>

          {matches.length === 0 ? (

            <div className="text-center py-10">

              <p className="text-6xl">
                💔
              </p>

              <p className="text-gray-500 text-lg mt-4">
                No matches yet. Start exploring ❤️
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {matches.map((user) => {

                // 🔹 Find dashboard chat for this user
                const dashboardChat =
                  dashBoardChats.find(
                    (chat) =>
                      String(chat.otherUserId) ===
                      String(user.id)
                  );

                // 🔹 Online status
                const status =
                  userStatuses[user.id];

                const isOnline =
                  status?.online;

                return (

                  <div
                    key={user.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg border border-pink-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                  >

                    <img
                      src={`https://i.pravatar.cc/300?img=${user.id}`}
                      alt={user.name}
                      className="w-full h-56 object-cover"
                    />

                    <div className="p-5">

                      {/* 🔹 Username */}
                      <div className="flex justify-between items-center">

                        <h4 className="text-xl font-bold text-gray-800">
                          {user.name}
                        </h4>

                        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-semibold">
                          ❤️ 92%
                        </span>

                      </div>

                      {/* 🔹 User Info */}
                      <p className="text-gray-500 mt-2">
                        🎂 {user.age} • 📍 {user.city}
                      </p>

                      {/* 🔹 Online Status */}
                      <div className="flex items-center gap-2 mt-3">

                        <div
                          className={`w-3 h-3 rounded-full ${isOnline
                              ? "bg-green-500"
                              : "bg-gray-400"
                            }`}
                        ></div>

                        <span className="text-sm text-gray-500">

                          {isOnline

                            ? "Online"

                            : status?.lastSeen

                              ? `Last seen ${new Date(
                                status.lastSeen
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`

                              : "Offline"}

                        </span>

                      </div>

                      {/* 🔹 Bio */}
                      <p className="text-gray-600 mt-3">
                        {user.bio}
                      </p>

                      {/* 🔹 Interests */}
                      <div className="flex flex-wrap gap-2 mt-4">

                        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs">
                          🎵 Music
                        </span>

                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                          ✈️ Travel
                        </span>

                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
                          ☕ Coffee
                        </span>

                      </div>

                      {/* 🔹 Last Message */}
                      <div className="flex items-center gap-1 mt-4">

                        <p className="text-sm text-gray-400 italic truncate">

                          {dashboardChat?.lastMessage ||
                            "No messages yet ✨"}

                        </p>

                      </div>

                      {/* 🔹 Unread Count */}
                      {dashboardChat?.unreadCount > 0 && (

                        <div className="mt-3 inline-block bg-red-500 text-white text-xs px-3 py-1 rounded-full">

                          {dashboardChat?.unreadCount} new

                        </div>

                      )}

                      {/* 🔹 Chat Button */}
                      <button
                        onClick={() =>
                          navigate("/chat", {
                            state: user,
                          })
                        }
                        className="mt-5 w-full bg-linear-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        Message 💬
                      </button>

                    </div>

                  </div>

                );

              })}

            </div>
          )}
        </div>

        {/* ================= PEOPLE WHO LIKED YOU ================= */}
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-pink-100 mt-8">

          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            💖 People who liked you
          </h3>

          {incomingRequest.length === 0 ? (

            <div className="text-center py-10">

              <p className="text-6xl">
                😢
              </p>

              <p className="text-gray-500 text-lg mt-4">
                No one liked you yet
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {incomingRequest.map((user) => (

                <div
                  key={user.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border border-pink-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >

                  <img
                    src={`https://i.pravatar.cc/300?img=${user.id}`}
                    alt={user.name}
                    className="w-full h-56 object-cover"
                  />

                  <div className="p-5">

                    <h4 className="text-xl font-bold text-gray-800">
                      {user.name}
                    </h4>

                    <p className="text-gray-500 mt-2">
                      🎂 {user.age} • 📍 {user.city}
                    </p>

                    <p className="text-gray-600 mt-3">
                      {user.bio}
                    </p>

                    <div className="flex gap-3 mt-5">

                      <button
                        onClick={() =>
                          handleAccept(user.id)
                        }
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        Accept ❤️
                      </button>

                      <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition">
                        Ignore ❌
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

      </div>

      {/* FLOATING BUTTON */}
      <button className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white w-16 h-16 rounded-full shadow-2xl text-2xl hover:scale-110 transition-all duration-300">
        💌
      </button>

    </div>
    
  );

}
export default Dashboard;