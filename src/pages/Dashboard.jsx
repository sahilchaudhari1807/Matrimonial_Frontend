// =====================================================
// IMPORTS
// =====================================================

// Used for page navigation
import { useNavigate } from "react-router-dom";

// React Hooks
import { useEffect, useState } from "react";
import { connect, disconnectChat } from "../services/WebSocket";

function Dashboard({ setToken }) {

  // =====================================================
  // REACT ROUTER NAVIGATION
  // Used to move between pages
  // Example:
  // navigate("/login")
  // navigate("/matches")
  // =====================================================
  const navigate = useNavigate();

  // =====================================================
  // STATE VARIABLES
  // =====================================================

  // Stores accepted matches
  const [matches, setMatches] = useState([]);

  // Stores incoming interest requests
  const [incomingRequest, setIncomingRequest] =
    useState([]);

  // Stores online/offline status of users
  // Example:
  // {
  //   5:{online:true},
  //   6:{online:false}
  // }
  const [userStatuses, setUserStatuses] = useState({});

  // Stores dashboard chat information
  // last message, unread count etc.
  const [dashBoardChats, setDashBoardChats] = useState([]);

  // Stores all user profiles
  const [profiles, setProfiles] = useState([]);

  // Stores received requests
  const [receivedRequests, setReceivedRequests] =
    useState([]);

  // =====================================================
  // CURRENT LOGGED-IN USER ID
  // Stored during login
  // =====================================================
  const currentUserId =
    localStorage.getItem("currentUserId");

  const [userStatus, setUserStatus] = useState(null);



  // =====================================================
  // FETCH ALL USER PROFILES
  // Runs only once when component loads
  // =====================================================
  useEffect(() => {

    fetch("http://localhost:8081/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })

      // Convert response into JSON
      //  .then((res) => res.json())
      .then(res => {
        if (!res.ok) {
          throw new Error(`request failed :${res.status}`);
        }
        return res.json();
      })

      // Store profiles into state
      .then((data) => setProfiles(data))

      // Handle errors
      .catch((err) => console.log(err));

  }, []);



  // =====================================================
  // FIND CURRENT USER PROFILE
  // We already have currentUserId
  // Now find complete profile from profiles array
  //
  // Example:
  // currentUserId = 5
  //
  // profiles:
  // [
  //   {id:1,name:"Rahul"},
  //   {id:5,name:"Sahil"}
  // ]
  //
  // Returns:
  // {id:5,name:"Sahil"}
  // =====================================================
  const currentUser = profiles.find(
    (p) => String(p.userId) === String(currentUserId)
  );


  //



  // =====================================================
  // REDIRECT LOGIC
  // =====================================================
  useEffect(() => {


    // If no user is logged in
    // send user back to login page
    if (!currentUserId) {

      navigate("/login");

      return;
    }

    /*
    Future logic:

    If profile not created
    redirect to profile page

    if (!currentUser) {
      navigate("/profile", { replace: true });
    }
    */

  }, [currentUserId, currentUser, navigate]);

  // =====================================================
  // FETCH INCOMING REQUESTS
  // =====================================================
  useEffect(() => {




    // Call backend API
    fetch(
      `http://localhost:8081/interests/incoming/${currentUserId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
    )

      // Convert JSON
      .then(res => {
        if (!res.ok) {
          throw new Error(`request failed :${res.status}`);
        }
        return res.json();
      })

      // Store incoming requests
      .then((data) => {

        console.log(
          "Incoming Requests:",
          data
        );

        setIncomingRequest(data);

      })

      // Error handling
      .catch((err) => {
        console.log(err);
      });

  }, [currentUserId]);

  // =====================================================
  // FETCH MATCHES
  // =====================================================
  useEffect(() => {

    // Call matches API
    fetch(
      `http://localhost:8081/GetMatches/${currentUserId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
    )

      // Convert response
      .then(res => {
        if (!res.ok) {
          throw new Error(`request failed :${res.status}`);
        }
        return res.json();
      })

      // Store matches
      .then((data) => {



        setMatches(data);

      })

      // Handle error
      .catch((err) => console.log(err));

  }, [currentUserId]);
 

 
 
   
  // =====================================================
  // FETCH ONLINE STATUS OF MATCHED USERS
  // =====================================================

  useEffect(() => {


    if (dashBoardChats.length === 0) {
      console.log("No dashboard chats found.");
      return;
    }

    const fetchOnlineUsers = async () => {



      const statuses = {};

      for (const chat of dashBoardChats) {



        try {

          console.log(
            "Calling API:",
            `http://localhost:8081/status/${chat.otherUserId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`

            }
          }
          );

          const response = await fetch(
            `http://localhost:8081/status/${chat.otherUserId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`

            }
          }
          );



          if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
          }
          const statusData = await response.json();


          statuses[chat.otherUserId] = statusData;

        } catch (error) {

          console.log(
            "Error fetching status for",
            chat.otherUserId,
            error
          );

        }

      }



      setUserStatuses(statuses);

    };

    fetchOnlineUsers();

  }, [dashBoardChats]);

  // =====================================================
  // CHECK WHETHER STATE IS UPDATED
  // =====================================================



  // =====================================================
  // LOGOUT FUNCTION
  // =====================================================

  const handleLogout = async () => {

    try {

      // =====================================================
      // STEP 1:
      // Update user status to OFFLINE
      // =====================================================
      await fetch(
        `http://localhost:8081/status/online/${Number(currentUserId)}/${false}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

    } catch (error) {

      console.log(
        "Offline update error",
        error
      );

    }

    // =====================================================
    // STEP 2:
    // Remove authentication data
    // =====================================================

    localStorage.removeItem("token");

    localStorage.removeItem(
      "currentUserId"
    );

    // =====================================================
    // STEP 3:
    // Remove token from React state
    // =====================================================

    setToken(null);

    // =====================================================
    // STEP 4:
    // Redirect to Login page
    // =====================================================

    navigate("/login");

  };


  // =====================================================
  // FETCH DASHBOARD CHAT DATA
  // =====================================================
  function receiveMessage(chatMessage) {

    setDashBoardChats((previousChats) => {

      // Find the chat that received the new message
      const existingChat = previousChats.find(
        (chat) => chat.chatId === chatMessage.chatId
      );

      // If chat doesn't exist, do nothing for now
      if (!existingChat) {
        return previousChats;
      }

      // Create updated chat
      const updatedChat = {

        ...existingChat,

        lastMessage: chatMessage.content,

        lastMessageTime: chatMessage.timestamp,

        unreadCount:
          String(chatMessage.receiverId) === String(currentUserId)
            ? existingChat.unreadCount + 1
            : existingChat.unreadCount

      };

      // Keep all other chats
      const remainingChats = previousChats.filter(
        (chat) => chat.chatId !== chatMessage.chatId
      );

      // Move updated chat to top
      return [updatedChat, ...remainingChats];

    });

  }


  useEffect(() => {
    connect(receiveMessage, () => { });

    return () => {
    disconnectChat();
};

  }, []);

  useEffect(() => {

    const fetchDashBoardChats =
      async () => {

        try {

          // Fetch dashboard chat information
          const response =
            await fetch(
              `http://localhost:8081/messages/dashboard/${currentUserId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            }
            );

          if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
          }
          const data =
            await response.json();

          // Store chat data
          setDashBoardChats(data);

        } catch (error) {

          console.log(
            "error while fetching data",
            error
          );

        }

      };

    // First fetch
    fetchDashBoardChats();



  }, [currentUserId]);


  // =====================================================
  // ACCEPT REQUEST FUNCTION
  // =====================================================

  const handleAccept = (user) => {

    const currentUserId = localStorage.getItem("currentUserId");

    const senderId = user.userId;
    const receiverId = currentUserId;

    fetch(
      `http://localhost:8081/accept?fromUserId=${senderId}&toUserId=${receiverId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to accept request");
        }

        // Refresh incoming requests
        return fetch(
          `http://localhost:8081/interests/incoming/${currentUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
        );
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`request failed :${res.status}`);
        }
        return res.json();
      })
      .then((data) => {

        setIncomingRequest(data);

        // Refresh matches
        return fetch(
          `http://localhost:8081/GetMatches/${currentUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
        );

      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`request failed :${res.status}`);
        }
        return res.json();
      })
      .then((matchData) => {

        setMatches(matchData);

        alert(`You accepted ${user.name}'s interest ❤️`);

      })
      .catch((err) => {
        console.error(err);
      });

  };// =====================================================
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to reject request");
        }

        // Refresh incoming requests
        return fetch(
          `http://localhost:8081/interests/incoming/${currentUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
        );
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`request failed :${res.status}`);
        }
        return res.json();
      })
      .then((data) => {

        setIncomingRequest(data);

        // Refresh matches
        return fetch(
          `http://localhost:8081/GetMatches/${currentUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
        );

      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`request failed :${res.status}`);
        }
        return res.json();
      })
      .then((matchData) => {

        setMatches(matchData);

        alert(`You rejected ${user.name}'s interest.`);

      })
      .catch((err) => {
        console.error(err);
      });

  };

  // =====================================================
  // LOAD ALL RECEIVED REQUESTS
  // =====================================================

  useEffect(() => {

    fetch(
      `http://localhost:8081/interests/AllRequest/${currentUserId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
    )
      .then(res => {
        if (!res.ok) {
          throw new Error(`request failed :${res.status}`);
        }
        return res.json();
      })
      .then(data => {

        //  console.log("API Response:", data);

        setReceivedRequests(data);

      });

  }, []);

  useEffect(() => {

    /* console.log(
       "receivedRequests updated:",
       receivedRequests
     );*/

  }, [receivedRequests]);
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
                      String(user.userId)
                  );

                // 🔹 Online status


                const status =
                  userStatuses[user.userId];

                /* const isOnline =
                   status?.online;*/

                return (

                  <div
                    key={user.userId}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg border border-pink-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                  >

                    <img
                      src={`https://i.pravatar.cc/300?img=${user.userId}`}
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

                      {/* 🔹 Last Seen */}
                      <div className="mt-3">

                        <span className="text-sm text-gray-500">

                          {status?.lastSeen
                            ? `Last seen ${new Date(
                              status.lastSeen
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                            : "No activity yet"}

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

              {incomingRequest.map((user) => {

                console.log("Incoming User:", user);

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
                          onClick={() => handleAccept(user)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          Accept ❤️
                        </button>

                        <button
                          onClick={() => handleReject(user)}
                          className="w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition">
                          Ignore ❌
                        </button>

                      </div>

                    </div>

                  </div>
                );

              })}

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

