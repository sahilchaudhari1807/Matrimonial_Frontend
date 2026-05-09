import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

function Chat() {
  const location = useLocation();
 const [typingUsers, setTypingUsers] = useState({});
 const [LastSeenUsers,SetLastSeenUsers]=useState({});
 const [input, setInput] = useState("");
 const timerRef = useRef(null);



 

const user = location.state || JSON.parse(localStorage.getItem("chatUser"));

const bottomRef = useRef(null);


const currentUserId=localStorage.getItem("currentUserId");
const myID = Number(currentUserId);
const otherId = user ? Number(user.id): null;

const chatId = otherId !== null
  ? (myID < otherId 
      ? `${myID}_${otherId}` 
      : `${otherId}_${myID}`)
  : null;


  const [messages, setMessages] = useState([]);
  

  // 🔹 Load messages
  useEffect(() => {
    if (!user) return;

    const allChats = JSON.parse(localStorage.getItem("allChats")) || {};
    const userMessages = allChats[chatId] || [];

    const updateMessage=userMessages.map(message=>{
      if(message.sender!==currentUserId && message.seen===false){
          return { ...message, seen: true };
      }
     else{
      return message;
     }
    })
    allChats[chatId]=updateMessage;
    localStorage.setItem("allChats",JSON.stringify(allChats));
  
    setMessages(updateMessage);
  }, [user,chatId]);

  // 🔹 Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  useEffect(()=>{
      const handlerStorageChange=(event)=>{
      if(event.key=="allChats"){
      const allChats = JSON.parse(localStorage.getItem("allChats")) || {};
    const userMessages = allChats[chatId] || [];


    setMessages(userMessages);
      }
    }
    window.addEventListener("storage",handlerStorageChange);

     return()=>{
      window.removeEventListener("storage",handlerStorageChange);
     };
     
    
  },[chatId])

  const handleSend = () => {
    if (input.trim() === "") return;

    const newMessage = {
      text: input,
      sender: currentUserId,
      time: Date.now(),
      seen:false
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    const allChats = JSON.parse(localStorage.getItem("allChats")) || {};
    allChats[chatId] = updatedMessages;
    localStorage.setItem("allChats", JSON.stringify(allChats));

    setInput("");

  
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

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* 🔹 Header */}
      <div className="flex items-center gap-3 bg-white shadow p-4">
        <button className="text-xl">←</button>
        <span className="font-semibold text-lg">{user?.username}</span>
      </div>

      {/* 🔹 Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">

        {messages.map((msg, index) => {
          const isMe =
            String(msg.sender) === String(currentUserId);

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
      
      

{typingUsers[chatId] && (
   <p className="text-sm text-gray-500 px-3">
      Typing...
   </p>
)}
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