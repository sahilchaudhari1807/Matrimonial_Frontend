/*This component does 6 main things:

Loads messages every 2 seconds.
Sends messages to backend.
Marks messages as seen when chat opens.
Shows online/last seen status every 3 seconds.
Auto scrolls to latest message.
Tracks typing state using setTimeout().*/ 


import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

function Chat() {
  const location = useLocation();
  const [typingUsers, setTypingUsers] = useState({});

  const [input, setInput] = useState("");
  const timerRef = useRef(null);
  const [userStatus, setUserStatus] = useState(null);
  const [profiles, setProfiles] = useState([]);






  const user = location.state || JSON.parse(localStorage.getItem("chatUser"));

  const bottomRef = useRef(null);


  const currentUserId = localStorage.getItem("currentUserId");
  const myID = Number(currentUserId);
  const otherId = user ? Number(user.id) : null;

  const chatId = otherId !== null
    ? (myID < otherId
      ? `${myID}_${otherId}`
      : `${otherId}_${myID}`)
    : null;


  const [messages, setMessages] = useState([]);

  const markMessageasSeen = async () => {
    try {
      await fetch(`http://localhost:8081/messages/seen/${chatId}/${currentUserId}`, {
        method: "PUT"
      });
    } catch (error) {
      console.log("error updating sees staus", error);
    }
  }


  // 🔹 Load messages
  useEffect(() => {

    if (!user) {
      return;
    }

    const fetchMessages = async () => {

      try {

        const response = await fetch(
          `http://localhost:8081/messages/${chatId}`
        );

        const data = await response.json();

        setMessages(data);

      } catch (error) {

        console.log(
          "Error fetching messages",
          error
        );

      }

    };

    fetchMessages();
    markMessageasSeen();
    const interval = setInterval(() => {
      fetchMessages();
    }, 2000)

    return () => {
      clearInterval(interval);
    };
  }, [user, chatId]);

  // 🔹 Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);



  const handleSend = async () => {

    if (input.trim() === "") return;

    // 🔹 Create message object
    const newMessage = {
      chatId: chatId,
      senderId: Number(currentUserId),
      receiverId: Number(user.id),
      text: input,
    };
    console.log(newMessage);
    try {

      // 🔹 Send message to backend
      const response = await fetch(
        "http://localhost:8081/messages/message",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(newMessage),
        }
      );

      // 🔹 Backend returns saved message
      const savedMessage =
        await response.json();

      // 🔹 Add message to UI
      setMessages((prev) => [
        ...prev,
        savedMessage,
      ]);

      // 🔹 Clear input
      setInput("");

    } catch (error) {

      console.log(
        "Error sending message",
        error
      );

    }

  };
  const handleTyping = (e) => {

    setInput(e.target.value);

    setTypingUsers((prev) => ({
      ...prev,
      [chatId]: currentUserId
    }));


    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {

      setTypingUsers((prev) => {

        const updated = { ...prev };

        delete updated[chatId];

        return updated;

      });

    }, 2000);

  };


  // last seen
  


  // show online user or lastseen

  useEffect(() => {

    const fetchStatus = async () => {

      try {

        const response = await fetch(
          `http://localhost:8081/status/${user.id}`
        );

        const status =
          await response.json();

        setUserStatus(status);

      } catch (error) {

        console.log(error);

      }

    };

    fetchStatus();

    const interval = setInterval(() => {

      fetchStatus();

    }, 3000);

    return () => {

      clearInterval(interval);

    };

  }, [user.id]);


  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* 🔹 Header */}
      {/* 🔹 Header */}
      <div className="flex items-center gap-3 bg-white shadow p-4">

        <button className="text-xl">←</button>

        <div className="flex flex-col">

          {/* Username */}
          <span className="font-semibold text-lg">
            {user?.username}
          </span>

          {/* Typing OR Last Seen */}
          <span className="text-xs text-gray-500">

            {userStatus?.online

              ? "Online"

              : `Last seen ${userStatus?.lastSeen
                ? new Date(
                  userStatus.lastSeen
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
                : "recently"
              }`
            }

          </span>



        </div>

      </div>

      {/* 🔹 Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">

        {messages.map((msg, index) => {
          const isMe =
            String(msg.senderId) === String(currentUserId);

          return (
            <div
              key={index}
              className={`max-w-[60%] px-3 py-2 rounded-lg text-sm 
              ${isMe
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-300 text-black self-start"
                }`}
            >
              {/* ✅ CHANGED HERE */}
              <div className="flex flex-col">
                <span>{msg.text}</span>

                <div className="flex items-center justify-end gap-1 text-[10px] mt-1 opacity-70">

                  {/* 🔹 Time */}
                  <span>
                    {msg.time &&
                      new Date(msg.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                  </span>

                  {/* 🔹 Show ticks only for my messages */}
                  {isMe && (

                    msg.seen === false ? (

                      // 🔹 Single tick
                      <span>✓</span>

                    ) : (

                      // 🔹 Double tick
                      <span>✓✓</span>

                    )

                  )}

                </div>
              </div>
            </div>
          );
        })}

        {/* 🔹 Scroll anchor */}
        <div ref={bottomRef}></div>

      </div>

      {/* 🔹 Input */}




      {/*typingUsers[chatId] === user.id && (
   <p>{user.username} is typing...</p>
)*/}
      <div className="flex p-3 bg-white border-t gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={handleTyping}
          className="flex-1 border rounded px-3 py-2 outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>

    </div>
  );
}

export default Chat;