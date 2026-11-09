/*This component does  main things:


Sends messages to backend.
Marks messages as seen when chat opens.
Shows online/last seen status every 3 seconds.
Auto scrolls to latest message.
Tracks typing state using setTimeout().*/

// Import React hooks
import React, { useEffect, useLayoutEffect, useState, useRef } from "react";

// Import location for receiving user data from previous page
import { useLocation } from "react-router-dom";
import { connect, sendMessage, sendTypingStatus, disconnectChat } from "../services/WebSocket";

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

  const dropdownRef = useRef(null);

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
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0
  });







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

    //  console.log("Receiver ID:", chatMessage.receiverId);
    //console.log("Current User ID:", currentUserId);

    if (
      String(chatMessage.receiverId) === String(currentUserId)
    ) {
      //  console.log("I am receiver");
      markMessagesSeen();
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

      // console.log("cleanup executed");

      disconnectChat();

    };

  }, []);


  // ======================================================
  // Updates the seen status of existing messages received
  // from the WebSocket without adding duplicate messages.
  // ======================================================
  // Update the seen status of messages received from WebSocket

  function receiveSeenMessage(updatedMessages) {

    // console.log("========== SEEN UPDATE RECEIVED ==========");

    // LOG 1: What backend sends
    // console.log("SEEN EVENT DATA:", updatedMessages);

    if (!Array.isArray(updatedMessages) || updatedMessages.length === 0) {
      // console.log("No messages received");
      return;
    }

    setMessages((previousMessages) => {

      const updated = previousMessages.map((msg) => {

        const updatedMessage = updatedMessages.find(
          item => String(item.id) === String(msg.id)
        );

        if (!updatedMessage) {
          return msg;
        }

        // LOG 2: Compare old and new values
        // console.log("BEFORE UPDATE:", msg);
        // console.log("FROM BACKEND:", updatedMessage);

        return {
          ...msg,
          delivered: updatedMessage.delivered,
          seen: updatedMessage.seen
        };
      });

      // LOG 3: Check updated messages
      // console.log("UPDATED MESSAGE STATE:", updated);

      return updated;
    });
  }

  // ===================================
  // MARK MESSAGES AS SEEN
  // ===================================
  const markMessagesSeen = async () => {
    console.log("MARK SEEN CALLED", {
      chatId,
      currentUserId,
      time: new Date().toLocaleTimeString()
    });
    try {
      const response = await fetch(
        `http://localhost:8081/messages/seen/${chatId}/${currentUserId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      //  console.log("STEP 1 RESPONSE:", response.status);

    } catch (error) {
      //console.log("Error updating seen status:", error);
    }
  };
  //==================================
  //DELETE FOR ME//
  //==================================

  const DeleteForMe = async (messageId) => {
    try {
      const response = await fetch(
        `http://localhost:8081/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      setMessages(prevMessages =>
        prevMessages.filter(message => message.id !== messageId)
      );

    } catch (error) {
      console.error("Delete error:", error);
    }
  };



  //==================================
  //DELETE FOR EVERYONE
  //==================================

  const DeleteForEveryone = async (messageId) => {
    console.log("Delete for everyone clicked:", messageId);

    try {
      const response = await fetch(
        `http://localhost:8081/messages/everyone/${messageId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      console.log("Backend response:", response.status);

      if (!response.ok) {
        throw new Error("Failed to delete message for everyone");
      }

      setMessages(prevMessages =>
        prevMessages.map(message =>
          String(message.id) === String(messageId)
            ? { ...message, deletedForEveryone: true }
            : message
        )
      );

    } catch (error) {
      console.error("Delete for everyone error:", error);
    }
  };

  // ===================================
  // MARK MESSAGES AS DELIVERED
  // ===================================
  const markMessagesAsDelivered = async (messageId) => {

    // console.log("markMessagesAsDelivered()", messageId);

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

      /*console.log(
        "error updating Delivered status",
        error
      );*/

    }
  };

  function receiveDeliveredStatus(updatedMessage) {

    // console.log("Delivered status received:", updatedMessage);

    setMessages((previousMessages) => {

      return previousMessages.map((msg) => {

        if (String(msg.id) === String(updatedMessage.id)) {
          return {
            ...msg,
            ...updatedMessage,
            seen: msg.seen || updatedMessage.seen
          };
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
        setIsMessagesLoaded(true);
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



  /// DROPDOWN THE OPTIONS OF DELETE  COPY  FORWARD

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".message-dropdown") &&
        !event.target.closest(".message-dropdown-menu")
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // ===================================
  // AUTO SCROLL TO LATEST MESSAGE
  // ===================================
  /*useLayoutEffect(() => {
    if (isMessagesLoaded) {
      bottomRef.current?.scrollIntoView({
        behavior: "instant",
        block: "end"
      });
    }
  }, [isMessagesLoaded, messages]);*/

  useLayoutEffect(() => {
    if (activeDropdown === null || !dropdownRef.current) return;

    const menu = dropdownRef.current;

    const button = document.querySelector(
      `.message-dropdown[data-message-id="${activeDropdown}"] button`
    );

    if (!button) return;

    const rect = button.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const gap = 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openBelow = spaceBelow >= menuRect.height + gap;

    const top = openBelow
      ? rect.bottom + gap
      : Math.max(8, rect.top - menuRect.height - gap);

    const left = Math.max(
      8,
      Math.min(
        rect.right - menuRect.width,
        window.innerWidth - menuRect.width - 8
      )
    );

    setDropdownPosition({ top, left });
  }, [activeDropdown]);

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

    // console.log("Received Status:", updatedStatus);

    // Ignore updates for users other than the one whose chat is open
    if (String(updatedStatus.userId) !== String(user.userId)) {
      return;
    }

    // console.log("Updating Chat Header");

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

        // console.log("STATUS FROM API:", status);

        setUserStatus(status);

      } catch (error) {

        console.log(error);

      }
    };

    // Load status immediately
    //   console.log("Status useEffect executed from chat page");
    fetchStatus();



  }, [user.userId]);

  // If no user selected
  if (!user) return null;
  //console.log("USER STATUS:", userStatus);
  //console.log("IS TYPING:", isTyping)

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
                {!msg.deletedForEveryone && (
                  <div
                    className="flex justify-end relative message-dropdown"
                    data-message-id={msg.id}
                  >

                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();

                        setActiveDropdown(
                          activeDropdown === msg.id ? null : msg.id
                        );

                        setDropdownPosition({
                          top: rect.bottom + 8,
                          left: Math.max(8, rect.right - 192)
                        });
                      }}
                    >
                      ⋮
                    </button>

                    {/* Dropdown options */}
                    {activeDropdown === msg.id && (
                      <div
                        ref={dropdownRef}
                        style={{
                          position: "fixed",
                          top: dropdownPosition.top,
                          left: dropdownPosition.left,
                          width: "192px",
                          zIndex: 9999
                        }}
                        className="message-dropdown-menu bg-white text-black shadow-xl rounded-xl p-2"
                      >

                        <button className="block w-full text-left p-2 hover:bg-gray-100 whitespace-nowrap">
                          Reply
                        </button>

                        <button className="block w-full text-left p-2 hover:bg-gray-100 whitespace-nowrap">
                          Forward
                        </button>

                        <button className="block w-full text-left p-2 hover:bg-gray-100 whitespace-nowrap">
                          Copy
                        </button>

                        <button onClick={() => DeleteForMe(msg.id)} className="block w-full text-left p-2 hover:bg-gray-100 text-red-500 whitespace-nowrap">
                          Delete for me
                        </button>

                        <button onClick={() => DeleteForEveryone(msg.id)} className="block w-full text-left p-2 hover:bg-gray-100 text-red-500 whitespace-nowrap">
                          Delete for everyone
                        </button>

                      </div>
                    )}

                  </div>
                )}
                {/* Message text */}
                {/* Message text */}
                <span>
                  {msg.deletedForEveryone
                    ? "This message was deleted"
                    : msg.content}
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




                      {msg.seen ? (
                        <span className="text-cyan-300 opacity-100">✓✓</span>
                      ) : msg.delivered ? (
                        <span className="text-gray-300">✓✓</span>
                      ) : (
                        <span>✓</span>
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
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