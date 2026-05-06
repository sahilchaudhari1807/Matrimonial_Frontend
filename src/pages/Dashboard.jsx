import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard({ setToken }) {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);

  // 🔹 Chats state
  const [chats, setChats] = useState({});

  const currentUserId =
    localStorage.getItem("currentUserId");

  const myId = Number(currentUserId);

  //for showing who liked you
  const [incomingRequest, setIncomingRequest] =
    useState([]);

  // ✅ FIX 1: define data BEFORE using
  const profiles =
    JSON.parse(localStorage.getItem("profiles")) || [];

  // ✅ FIX 2: type-safe comparison
  const currentUser = profiles.find(
    (p) => String(p.id) === String(currentUserId)
  );

  // =====================================================
  // ✅ MATCH LOGIC (FIXED)
  // =====================================================
  // this useEffect for showing who likes you

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

  // this useeffect for showing who likes you
  useEffect(() => {

    // 🔹 Step 1: Get current logged-in user ID
    const currentUserId =
      localStorage.getItem("currentUserId");

    // 🔹 Step 2: Get all interests (who liked whom)
    const interests =
      JSON.parse(localStorage.getItem("interests")) || [];

    // 🔹 Step 3: Get all user profiles
    const profiles =
      JSON.parse(localStorage.getItem("profiles")) || [];

    // 🔹 Step 4: Find users who liked current user
    // i.to === currentUserId → means "they liked me"
    const received = interests.filter(
      (i) =>
        String(i.to) === String(currentUserId) &&
        i.status === "pending"
    );

    // 🔹 Step 5: Convert IDs → full user profiles
    // r.from = user ID who liked me
    const users = received.map((r) =>
      profiles.find(
        (p) => String(p.id) === String(r.from)
      )
    );

    // 🔹 Step 6: Remove undefined values
    const validUsers = users.filter(Boolean);

    // 🔹 Step 7: Store in state → UI will update
    setIncomingRequest(validUsers);

  }, [currentUserId]);

  // =====================================================
  // ✅ MATCHES
  // =====================================================
  useEffect(() => {

    const currentUserId =
      localStorage.getItem("currentUserId");

    const interests =
      JSON.parse(localStorage.getItem("interests")) || [];

    const profiles =
      JSON.parse(localStorage.getItem("profiles")) || [];

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

    const finalUsers = users.filter(Boolean);

    setMatches(finalUsers);

  }, [currentUserId]);

  // =====================================================
  // ✅ LOAD ALL CHATS
  // =====================================================
  useEffect(() => {

    const allChats =
      JSON.parse(localStorage.getItem("allChats")) || {};

    setChats(allChats);

  }, []);

  // =====================================================
  // ✅ LOGOUT
  // =====================================================
  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("currentUserId");

    setToken(null);

    navigate("/login");
  };

  // =====================================================
  // ✅ ACCEPT REQUEST
  // =====================================================
  const handleAccept = (senderId) => {

    // 🔹 Step 1: Get current logged-in user ID
    const currentUserId =
      localStorage.getItem("currentUserId");

    // 🔹 Step 2: Get all interests from localStorage
    const interests =
      JSON.parse(localStorage.getItem("interests")) || [];

    console.log("currentUserId:", currentUserId);
    console.log("senderId:", senderId);
    console.log("Before Accept interests:", interests);

    // 🔹 Step 3: Check if reverse interest already exists
    const alreadyExists = interests.some((item) => {
      return (
        String(item.from) === String(currentUserId) &&
        String(item.to) === String(senderId)
      );
    });

    // 🔹 Step 4: If reverse interest does NOT exist
    if (!alreadyExists) {
      interests.push({
        from: currentUserId,
        to: senderId,
        status: "accepted"
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

    // 🔹 Update matches UI immediately
    if (matchedUser) {
      setMatches((prev) => [...prev, matchedUser]);
    }

    // 🔹 Step 7: Remove accepted user from UI instantly
    const updateRequest = incomingRequest.filter(
      (user) => {
        return (
          String(user.id) !== String(senderId)
        );
      }
    );

    // 🔹 Step 8: Update UI state
    setIncomingRequest(updateRequest);

    // 🔹 Step 9: Save updated request list
    localStorage.setItem(
      "updateRequest",
      JSON.stringify(updateRequest)
    );
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

            <p>
              <span className="font-semibold">
                Name:
              </span>{" "}
              {currentUser?.username}
            </p>

            <p>
              <span className="font-semibold">
                Age:
              </span>{" "}
              {currentUser?.age}
            </p>

            <p>
              <span className="font-semibold">
                City:
              </span>{" "}
              {currentUser?.city}
            </p>

            <p>
              <span className="font-semibold">
                Bio:
              </span>{" "}
              {currentUser?.bio}
            </p>

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

            <p className="text-3xl font-bold text-blue-500 mt-2">
              120
            </p>

          </div>

          {/* Matches Count */}
          <div className="bg-white p-5 rounded-xl shadow">

            <h3 className="text-lg font-semibold text-gray-700">
              Matches
            </h3>

            <p className="text-3xl font-bold text-green-500 mt-2">
              {matches.length}
            </p>

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

                {matches.map((user) => {

                  // 🔹 Get matched user ID
                  const otherId = Number(user.id);

                  // 🔹 Generate shared chat ID
                  const chatId =
                    myId < otherId
                      ? `${myId}_${otherId}`
                      : `${otherId}_${myId}`;

                  // 🔹 Get all messages of this chat
                  const messages =
                    chats[chatId] || [];

                  // 🔹 Get latest message
                  const lastMessage =
                    messages[messages.length - 1];

                  return (
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

                      {/* 🔹 LAST MESSAGE PREVIEW */}
                      <p className="text-sm text-gray-400 mt-2">
                        {lastMessage?.text ||
                          "Start chatting 💬"}
                      </p>

                      <button
                        onClick={() =>
                          navigate("/chat", {
                            state: user
                          })
                        }
                        className="mt-3 w-full bg-green-500 text-white py-1 rounded hover:bg-green-600"
                      >
                        Message 💬
                      </button>

                    </div>
                  );
                })}

              </div>
            )}
          </div>

          {/* ✅✅✅ ADDED THIS BLOCK BELOW MATCHES */}
          <div className="bg-white p-5 rounded-xl shadow md:col-span-3 mt-6">

            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              People who liked you ❤️
            </h3>

            {incomingRequest.length === 0 ? (

              <p className="text-gray-500 text-center">
                No one liked you yet 😢
              </p>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {incomingRequest.map((user) => (

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

                    <div className="flex gap-2 mt-3">

                      <button
                        onClick={() =>
                          handleAccept(user.id)
                        }
                        className="w-full bg-green-500 text-white py-1 rounded hover:bg-green-600"
                      >
                        Accept ❤️
                      </button>

                      <button className="w-full bg-gray-300 text-black py-1 rounded hover:bg-gray-400">
                        Ignore ❌
                      </button>

                    </div>

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