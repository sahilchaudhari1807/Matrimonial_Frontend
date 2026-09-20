import { useEffect } from "react";
import {connectGlobal,disconnect} from "../services/WebSocket";
import { markMessagesAsDelivered } from "../services/MessageService";



function receiveGlobalMessage(message) {
    console.log("Global message:", message);
    
 const currentUserId=localStorage.getItem("currentUserId");
    console.log("Receiver ID:", message.receiverId);
    console.log("Current User ID:", currentUserId);
 if(String(message.receiverId)==String(currentUserId)){
        console.log("✅ Message is for me");
        console.log("Message ID:", message.id);

        markMessagesAsDelivered(message.id);
 }
  
}

function receiveGlobalSeen(messages) {
    console.log("Global seen:", messages);
}

function receiveGlobalStatus(status) {
    console.log("Global status:", status);
    console.log(" STATUS RECEIVED:", status);
console.log(" USER ID:", status.userId);
console.log(" ONLINE:", status.online);
}

function receiveGlobalTyping(status) {
    console.log("Global typing:", status);
}

function receiveGlobalDelivered(message) {
  //  console.log("Global delivered:", message);
   console.log(" GLOBAL DELIVERED RECEIVED:", message);
}
function GlobalWebSocket(){
 const currentUserId=localStorage.getItem("currentUserId");

    useEffect(()=>{
          connectGlobal(
            receiveGlobalMessage,
            receiveGlobalSeen,
            receiveGlobalStatus,
            receiveGlobalTyping,
            receiveGlobalDelivered
        );

        return ()=>{
            disconnect();
        }
    },[]);
    return null;
}

export default GlobalWebSocket;