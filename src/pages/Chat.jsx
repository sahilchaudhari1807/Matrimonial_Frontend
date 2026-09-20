/*This component does  main things:


Sends messages to backend.
Marks messages as seen when chat opens.
Shows online/last seen status every 3 seconds.
Auto scrolls to latest message.
Tracks typing state using setTimeout().*/

// Import React hooks
import React, { useEffect, useState, useRef } from "react";

// Import location for receiving user data from previous page
import { useLocation } from "react-router-dom";
import { connect, sendMessage, sendTypingStatus, disconnect } from "../services/WebSocket";

function Chat() {

  // Get data passed from previous page
  const location = useLocation();

  // Store users who are currently typing
  // const [typingUsers, setTypingUsers] = useState({});

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

  const [isTyping, setIsTyping] = useState(false);

  // Used for auto scrolling
  const bottomRef = useRef(null);

  // Current logged-in user id
  const currentUserId =
    localStorage.getItem("currentUserId");

  const myID = Number(currentUserId);

  // Receiver user id
  const otherId =
    user ? Number(user.userId) : null;

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

  function receiveMessage(chatMessage) {

    // Ignore messages from other chats
    if (chatMessage.chatId !== chatId) {
      return;
    }

    setMessages((prev) => {

      // Prevent duplicate messages
      if (prev.some(msg => msg.id === chatMessage.id)) {
        return prev;
      }

      return [...prev, chatMessage];

    });

    console.log("Receiver ID:", chatMessage.receiverId);
    console.log("Current User ID:", currentUserId);

    if (
      String(chatMessage.receiverId) === String(currentUserId)

    ) {




      console.log("✅ I am receiver");
      console.log("📨 Message ID:", chatMessage.id);
      markMessagesAsDelivered(chatMessage.id);

    }
  }

  /*function receiveTypingStatus(updatedTypingStatus) {

  console.log("Typing status received:", updatedTypingStatus);

}*/
  function receiveTypingStatus(updatedTypingStatus) {

    if (String(updatedTypingStatus.senderId) !== String(user.userId)) {
      return;
    }

    setIsTyping(updatedTypingStatus.typing);
  }
  useEffect(() => {



    connect(receiveMessage, receiveSeenMessage, receiveUpdateStatus, receiveTypingStatus, receiveDeliveredStatus);

    return () => {

      console.log("cleanup executed");

      disconnect();

    };

  }, []);


  // ======================================================
  // Updates the seen status of existing messages received
  // from the WebSocket without adding duplicate messages.
  // ======================================================
  // Update the seen status of messages received from WebSocket
  function receiveSeenMessage(updatedMessages) {

    console.log("Seen status received:", updatedMessages);

    if (updatedMessages.length === 0) {
      return;
    }

    setMessages((previousMessages) => {

      console.log("BEFORE SEEN UPDATE:", previousMessages);

      return previousMessages.map((msg) => {

        const updatedMessage = updatedMessages.find(
          updated => updated.id === msg.id
        );

        if (!updatedMessage) {
          return msg;
        }

        console.log(
          "Updating message:",
          msg.id,
          "delivered:",
          msg.delivered,
          "seen:",
          updatedMessage.seen
        );

        return {
          ...msg,
            delivered: updatedMessage.delivered,
          seen: updatedMessage.seen
        };
      });
    });
  }


  // ===================================
  // MARK MESSAGES AS SEEN
  // ===================================
  const markMessagesSeen = async () => {
    console.log(
      "markMessagesSeen()"

    );
    try {

      await fetch(
        `http://localhost:8081/messages/seen/${chatId}/${currentUserId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`

          }
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
  // MARK MESSAGES AS DELIVERED
  // ===================================
  const markMessagesAsDelivered = async (messageId) => {

    console.log("markMessagesAsDelivered()", messageId);

    try {

      await fetch(
        `http://localhost:8081/messages/delivered/${messageId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

    } catch (error) {

      console.log(
        "error updating Delivered status",
        error
      );

    }
  };

  function receiveDeliveredStatus(updatedMessage) {

    console.log("Delivered status received:", updatedMessage);

    setMessages((previousMessages) => {

      return previousMessages.map((msg) => {

        if (msg.id === updatedMessage.id) {
          return updatedMessage;
        }

        return msg;
      });

    });
  }
  // ===================================
  // LOAD CHAT MESSAGES
  // ===================================
  useEffect(() => {

    if (!user) return;

    const fetchMessages = async () => {

      try {

        const response = await fetch(
          `http://localhost:8081/messages/${chatId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
        );
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const data = await response.json();

        setMessages(data);

        const hasUnread = data.some(
          msg =>
            String(msg.receiverId) === String(currentUserId) &&
            msg.seen === false
        );

        if (hasUnread) {
          await markMessagesSeen();
        }

      } catch (error) {

        console.log(error);

      }

    };

    fetchMessages();

  }, [chatId, currentUserId]);



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
  const handleSend = () => {

    // Prevent empty message
    if (input.trim() === "") return;

    // Create message object
    const newMessage = {
      chatId: chatId,
      senderId: Number(currentUserId),
      receiverId: Number(user.userId),
      content: input,
    };




    try {

      // Send message through WebSocket
      sendMessage(newMessage);

      // Clear textbox
      setInput("");

    } catch (error) {

      console.log("Error sending message", error);

    }
  };
  // ===================================
  // HANDLE TYPING
  // ===================================
  const handleTyping = (e) => {

    // 1. Update textbox
    setInput(e.target.value);

    // 2. Create typing status

    const typingStatus = {
      senderId: Number(currentUserId),
      receiverId: Number(user.userId),
      typing: true
    };


    // 3. Send typing status
    sendTypingStatus(typingStatus);

    // 4. Reset previous timer
    clearTimeout(timerRef.current);

    // 5. After 2 seconds, tell receiver typing stopped
    timerRef.current = setTimeout(() => {

      const typingStopped = {
        senderId: Number(currentUserId),
        receiverId: Number(user.userId),
        typing: false
      };

      sendTypingStatus(typingStopped);

    }, 2000);
  };

  // ===================================
  // FETCH ONLINE / LAST SEEN STATUS
  // ===================================

  function receiveUpdateStatus(updatedStatus) {

    console.log("Received Status:", updatedStatus);

    // Ignore updates for users other than the one whose chat is open
    if (String(updatedStatus.userId) !== String(user.userId)) {
      return;
    }

    console.log("Updating Chat Header");

    // Update React state
    setUserStatus(updatedStatus);
  }
  useEffect(() => {

    const fetchStatus = async () => {

      try {

        const response =
          await fetch(

            `http://localhost:8081/status/${user.userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
          );


        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const status =
          await response.json();

          console.log("STATUS FROM API:", status);

        setUserStatus(status);

      } catch (error) {

        console.log(error);

      }
    };

    // Load status immediately
    console.log("Status useEffect executed from chat page");
    fetchStatus();



  }, [user.userId]);

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

          {isTyping ? (
            <span className="text-xs text-gray-500">
              {user.username} is typing...
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              {userStatus?.online
                ? "Online"
                : `Last seen ${userStatus?.lastSeen
                  ? new Date(userStatus.lastSeen).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "recently"
                }`}
            </span>
          )}

        </div>

      </div>

      {/* ===================================
          MESSAGE AREA
      =================================== */}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">

        {messages.map((msg,) => {

          /*  if (msg.id === 83) {
              console.log(msg);
            }*/

          // Check if message belongs to me
          const isMe =
            String(msg.senderId) ===
            String(currentUserId);

          return (

            <div
              // key={index}
              key={msg.id}
              className={`max-w-[60%] px-3 py-2 rounded-lg text-sm

              ${isMe
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-300 text-black self-start"
                }`}
            >

              <div className="flex flex-col">

                {/* Message text */}
                <span>
                  {msg.content}
                </span>

                {/* Time + Seen status */}
                <div className="flex items-center justify-end gap-1 text-[10px] mt-1 opacity-70">

                  {/* Message time */}
                  <span>

                    {msg.timestamp &&
                      new Date(
                        msg.timestamp
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit"
                        }
                      )}

                  </span>

                  {/* Show tick only for my messages */}

                  {/* Show Seen Status (Debug Version) */}
                  {isMe && (

                    <>



                      {!msg.delivered ? (
                        <span>✓</span>
                      ) : !msg.seen ? (
                        <span>✓✓</span>
                      ) : (
                        <span className="text-cyan-300 opacity-100">✓✓</span>
                      )}


                    </>

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