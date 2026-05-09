import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard({ setToken }) {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [chats, setChats] = useState({});
  const [incomingRequest, setIncomingRequest] =
    useState([]);

  const currentUserId =
    localStorage.getItem("currentUserId");

  const myId = Number(currentUserId);

  const profiles =
    JSON.parse(localStorage.getItem("profiles")) || [];

  const currentUser = profiles.find(
    (p) => String(p.id) === String(currentUserId)
  );

  // =====================================================
  // REDIRECT LOGIC
  // =====================================================
  useEffect(() => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    if (!currentUser) {
      navigate("/profile", { replace: true });
    }
  }, [currentUserId, currentUser, navigate]);

  // =====================================================
  // INCOMING REQUESTS
  // =====================================================
  useEffect(() => {
    const interests =
      JSON.parse(localStorage.getItem("interests")) || [];

    const received = interests.filter(
      (i) =>
        String(i.to) === String(currentUserId) &&
        i.status === "pending"
    );

    const users = received.map((r) =>
      profiles.find(
        (p) => String(p.id) === String(r.from)
      )
    );

    setIncomingRequest(users.filter(Boolean));
  }, [currentUserId]);

  // =====================================================
  // MATCHES
  // =====================================================
  useEffect(() => {
    const interests =
      JSON.parse(localStorage.getItem("interests")) || [];

    const validUsers = interests.filter((item) => {
      return (
        String(item.from) === String(currentUserId) &&
        item.status === "accepted"
      );
    });

    const users = validUsers.map((item) => {
      return profiles.find((p) => {
        return String(p.id) === String(item.to);
      });
    });

    setMatches(users.filter(Boolean));
  }, [currentUserId]);

  // =====================================================
  // LOAD CHATS
  // =====================================================
  useEffect(() => {
    const allChats =
      JSON.parse(localStorage.getItem("allChats")) || {};

    setChats(allChats);
  }, []);


useEffect(() => {

  // 🔹 Fetch online users
  const onlineUsers =
    JSON.parse(localStorage.getItem("onlineUsers")) || [];

  // 🔹 Add current user if not already online
  if (!onlineUsers.includes(currentUserId)) {
    onlineUsers.push(currentUserId);
  }

  // 🔹 Save updated online users
  localStorage.setItem(
    "onlineUsers",
    JSON.stringify(onlineUsers)
  );

  // 🔹 Handle offline user
  const handleOffline = () => {

    const onlineUsers =
      JSON.parse(localStorage.getItem("onlineUsers")) || [];

    const updatedUsers = onlineUsers.filter(
      (userId) => userId !== currentUserId
    );

    localStorage.setItem(
      "onlineUsers",
      JSON.stringify(updatedUsers)
    );
  };

  // 🔹 Add browser event
  window.addEventListener(
    "beforeunload",
    handleOffline
  );

  // 🔹 Cleanup
  return () => {
    window.removeEventListener(
      "beforeunload",
      handleOffline
    );
  };

}, []);

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUserId");

    setToken(null);

    navigate("/login");
  };

  // =====================================================
  // ACCEPT REQUEST
  // =====================================================
  const handleAccept = (senderId) => {
    const interests =
      JSON.parse(localStorage.getItem("interests")) || [];

    const alreadyExists = interests.some((item) => {
      return (
        String(item.from) === String(currentUserId) &&
        String(item.to) === String(senderId)
      );
    });

    if (!alreadyExists) {
      interests.push({
        from: currentUserId,
        to: senderId,
        status: "accepted",

      });
    }

    const updatedInterests = interests.map((item) => {
      if (
        String(item.from) === String(senderId) &&
        String(item.to) === String(currentUserId)
      ) {
        return {
          ...item,
          status: "accepted",
        };
      }

      return item;
    });

    localStorage.setItem(
      "interests",
      JSON.stringify(updatedInterests)
    );

    const matchedUser = profiles.find((p) => {
      return String(p.id) === String(senderId);
    });

    if (matchedUser) {
      setMatches((prev) => [...prev, matchedUser]);
    }

    const updatedRequest =
      incomingRequest.filter((user) => {
        return (
          String(user.id) !== String(senderId)
        );
      });

    setIncomingRequest(updatedRequest);
  };

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
                Welcome, {currentUser?.username} 👋
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
                  {currentUser?.username}
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

                const otherId = Number(user.id);

                const chatId =
                  myId < otherId
                    ? `${myId}_${otherId}`
                    : `${otherId}_${myId}`;

                const messages =
                  chats[chatId] || [];

                const lastMessage =
                  messages[messages.length - 1];

                const isMe = String(lastMessage?.sender) === String(currentUserId);

                const unreadMessages = messages.filter(
                  (message) =>
                    String(message.sender) !== String(currentUserId)
                    &&
                    message.seen === false
                );

                // 🔹 Total unread count
                const unreadCount = unreadMessages.length;
                
                const onlineUsers=JSON.parse(localStorage.getItem("onlineUsers"))||[];
                const isOnline =
  onlineUsers.includes(String(user.id));


                return (

                  <div
                    key={user.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg border border-pink-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                  >

                    <img
                      src={`https://i.pravatar.cc/300?img=${user.id}`}
                      alt={user.username}
                      className="w-full h-56 object-cover"
                    />

                    <div className="p-5">

                      <div className="flex justify-between items-center">

                        <h4 className="text-xl font-bold text-gray-800">
                          {user.username}
                        </h4>

                        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-semibold">
                          ❤️ 92%
                        </span>

                      </div>

                      <p className="text-gray-500 mt-2">
                        🎂 {user.age} • 📍 {user.city}
                      </p>

                      <div className="flex items-center gap-2 mt-3">

                      
<div className="flex items-center gap-2 mt-3">

  <div
    className={`w-3 h-3 rounded-full ${
      isOnline
        ? "bg-green-500"
        : "bg-gray-400"
    }`}
  ></div>

  <span className="text-sm text-gray-500">
    {isOnline ? "Online" : "Offline"}
  </span>

</div>

                      </div>

                      <p className="text-gray-600 mt-3">
                        {user.bio}
                      </p>

                      {/* Interests */}
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

                      <div className="flex items-center gap-1 mt-4">
                            {/* 🔹 Last message */}
                        <p className="text-sm text-gray-400 italic truncate">
                          {lastMessage?.text || "No messages yet ✨"}
                        </p>
                        {/* 🔹 Show ticks only for my messages */}
                        {isMe && (

                          lastMessage?.seen === false ? (

                            // Single tick
                            <span className="text-gray-400 text-sm">
                              ✓
                            </span>

                          ) : (

                            // Double tick
                            <span className="text-gray-400 text-sm">
                              ✓✓
                            </span>

                          )

                        )}

                    

                      </div>

                      {/* 🔹 Unread count */}
                      {unreadCount > 0 && (
                        <div className="mt-3 inline-block bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                          {unreadCount} new
                        </div>
                      )}
                      <button
                        onClick={() =>
                          navigate("/chat", {
                            state: user,
                          })
                        }
                        className="mt-5 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
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
                    alt={user.username}
                    className="w-full h-56 object-cover"
                  />

                  <div className="p-5">

                    <h4 className="text-xl font-bold text-gray-800">
                      {user.username}
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