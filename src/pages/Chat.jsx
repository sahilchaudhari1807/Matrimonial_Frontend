/*This component does 6 main things:

Loads messages every 2 seconds.
Sends messages to backend.
Marks messages as seen when chat opens.
Shows online/last seen status every 3 seconds.
Auto scrolls to latest message.
Tracks typing state using setTimeout().*/ 

// Import React hooks
import React, { useEffect, useState, useRef } from "react";

// Import location for receiving user data from previous page
import { useLocation } from "react-router-dom";

function Chat() {

  // Get data passed from previous page
  const location = useLocation();

  // Store users who are currently typing
  const [typingUsers, setTypingUsers] = useState({});

  // Store current message input
  const [input, setInput] = useState("");

  // Used for typing timeout
  const timerRef = useRef(null);

  // Store online/last seen status
  const [userStatus, setUserStatus] = useState(null);

  // Unused currently
  const [profiles, setProfiles] = useState([]);

  // Get selected chat user
  // If page refreshes, load from localStorage
  const user =
    location.state ||
    JSON.parse(localStorage.getItem("chatUser"));

  // Used for auto scrolling
  const bottomRef = useRef(null);

  // Current logged-in user id
  const currentUserId =
    localStorage.getItem("currentUserId");

  const myID = Number(currentUserId);

  // Receiver user id
  const otherId =
    user ? Number(user.id) : null;

  // Create unique chat id
  // Example:
  // User 1 & User 2 -> 1_2
  // User 2 & User 1 -> 1_2
  const chatId =
    otherId !== null
      ? (
          myID < otherId
            ? `${myID}_${otherId}`
            : `${otherId}_${myID}`
        )
      : null;

  // Store all messages
  const [messages, setMessages] = useState([]);

  // ===================================
  // MARK MESSAGES AS SEEN
  // ===================================
  const markMessageasSeen = async () => {

    try {

      await fetch(
        `http://localhost:8081/messages/seen/${chatId}/${currentUserId}`,
        {
          method: "PUT"
        }
      );

    } catch (error) {

      console.log(
        "error updating seen status",
        error
      );

    }
  };

  // ===================================
  // LOAD CHAT MESSAGES
  // ===================================
  useEffect(() => {

    if (!user) {
      return;
    }

    const fetchMessages = async () => {

      try {

        const response = await fetch(
          `http://localhost:8081/messages/${chatId}`
        );

        const data =
          await response.json();

        setMessages(data);

      } catch (error) {

        console.log(
          "Error fetching messages",
          error
        );

      }
    };

    // Load messages immediately
    fetchMessages();

    // Mark messages as seen
    markMessageasSeen();

    // Poll every 2 seconds
    const interval = setInterval(() => {

      fetchMessages();

    }, 2000);

    return () => {

      clearInterval(interval);

    };

  }, [user, chatId]);

  // ===================================
  // AUTO SCROLL TO LATEST MESSAGE
  // ===================================
  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages]);

  // ===================================
  // SEND MESSAGE
  // ===================================
  const handleSend = async () => {

    // Prevent empty message
    if (input.trim() === "") return;

    // Create message object
    const newMessage = {

      chatId: chatId,

      senderId:
        Number(currentUserId),

      receiverId:
        Number(user.id),

      text: input,
    };

    console.log(newMessage);

    try {

      // Send message to backend
      const response = await fetch(
        "http://localhost:8081/messages/message",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            newMessage
          ),
        }
      );

      // Saved message from backend
      const savedMessage =
        await response.json();

      // Add message to UI
      setMessages((prev) => [
        ...prev,
        savedMessage,
      ]);

      // Clear textbox
      setInput("");

    } catch (error) {

      console.log(
        "Error sending message",
        error
      );

    }
  };

  // ===================================
  // HANDLE TYPING
  // ===================================
  const handleTyping = (e) => {

    // Update textbox
    setInput(e.target.value);

    // Mark current user as typing
    setTypingUsers((prev) => ({
      ...prev,
      [chatId]: currentUserId
    }));

    // Reset timer
    clearTimeout(timerRef.current);

    // Remove typing status after 2 sec
    timerRef.current =
      setTimeout(() => {

        setTypingUsers((prev) => {

          const updated = {
            ...prev
          };

          delete updated[chatId];

          return updated;

        });

      }, 2000);
  };

  // ===================================
  // FETCH ONLINE / LAST SEEN STATUS
  // ===================================
  useEffect(() => {

    const fetchStatus = async () => {

      try {

        const response =
          await fetch(
            `http://localhost:8081/status/${user.id}`
          );

        const status =
          await response.json();

        setUserStatus(status);

      } catch (error) {

        console.log(error);

      }
    };

    // Load status immediately
    fetchStatus();

    // Refresh every 3 seconds
    const interval =
      setInterval(() => {

        fetchStatus();

      }, 3000);

    return () => {

      clearInterval(interval);

    };

  }, [user.id]);

  // If no user selected
  if (!user) return null;

  return (

    <div className="flex flex-col h-screen bg-gray-100">

      {/* ===================================
          HEADER SECTION
      =================================== */}

      <div className="flex items-center gap-3 bg-white shadow p-4">

        {/* Back button */}
        <button className="text-xl">
          ←
        </button>

        <div className="flex flex-col">

          {/* Username */}
          <span className="font-semibold text-lg">
            {user?.username}
          </span>

          {/* Online / Last Seen */}
          <span className="text-xs text-gray-500">

            {userStatus?.online

              ? "Online"

              : `Last seen ${
                  userStatus?.lastSeen

                    ? new Date(
                        userStatus.lastSeen
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit"
                        }
                      )

                    : "recently"
                }`
            }

          </span>

        </div>

      </div>

      {/* ===================================
          MESSAGE AREA
      =================================== */}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">

        {messages.map((msg, index) => {

          // Check if message belongs to me
          const isMe =
            String(msg.senderId) ===
            String(currentUserId);

          return (

            <div
              key={index}
              className={`max-w-[60%] px-3 py-2 rounded-lg text-sm

              ${
                isMe
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-300 text-black self-start"
              }`}
            >

              <div className="flex flex-col">

                {/* Message text */}
                <span>
                  {msg.text}
                </span>

                {/* Time + Seen status */}
                <div className="flex items-center justify-end gap-1 text-[10px] mt-1 opacity-70">

                  {/* Message time */}
                  <span>

                    {msg.time &&
                      new Date(
                        msg.time
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit"
                        }
                      )}

                  </span>

                  {/* Show tick only for my messages */}
                  {isMe && (

                    msg.seen === false

                      ? (
                        // Single Tick
                        <span>✓</span>
                      )

                      : (
                        // Double Tick
                        <span>✓✓</span>
                      )

                  )}

                </div>

              </div>

            </div>

          );
        })}

        {/* Auto scroll target */}
        <div ref={bottomRef}></div>

      </div>

      {/* ===================================
          INPUT SECTION
      =================================== */}

      {/* Typing UI can be added here
      typingUsers[chatId] === user.id &&
      (
        <p>
          {user.username} is typing...
        </p>
      )
      */}

      <div className="flex p-3 bg-white border-t gap-2">

        {/* Message textbox */}
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={handleTyping}
          className="flex-1 border rounded px-3 py-2 outline-none"
        />

        {/* Send Button */}
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