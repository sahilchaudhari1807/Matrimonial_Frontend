// ===============================
// WebSocket Flow
// ===============================

// 1. Chat.jsx calls connect()

// 2. Create STOMP Client

// 3. activate() starts WebSocket connection

// 4. Connection established

// 5. onConnect() executes

// 6. Subscribe to /topic/public

// 7. Ready to receive messages

// 8. User clicks Send

// 9. publish() sends message to backend

// 10. Spring Boot receives message (@MessageMapping)

// 11. Save message in database

// 12. Spring Boot broadcasts message (@SendTo)

// 13. Subscriber receives payload

// 14. receiveMessage() updates React state

// 15. React re-renders and displays the new message

// Import SockJS (fallback WebSocket implementation)
import SockJS from "sockjs-client";

// Import STOMP client
import { Client } from "@stomp/stompjs";

// Global STOMP client object
let stompClient = null;

// Callback function that Chat.jsx passes.
// This function is called whenever a new message is received.
let receiveMessageCallback = null;
let  seenMessageCallback=null;
let  updateStatusCallback=null;

// ======================================================
// CONNECT TO WEBSOCKET SERVER
// ======================================================
function connect(receiveMessage,receiveSeenMessage,receiveUpdateStatus) {

    // Debug: Check how many times connect() is called
    console.log("connect() called");

       if(stompClient && stompClient.active){
       console.log("already connected");
         return;
        }
    // Store callback so we can use it later
    receiveMessageCallback = receiveMessage;
    seenMessageCallback = receiveSeenMessage;
    updateStatusCallback=receiveUpdateStatus;

    // Create STOMP client
    stompClient = new Client({

       
        // Create SockJS connection
        webSocketFactory: () =>
            new SockJS("http://localhost:8081/ws"),

        // Runs automatically after successful connection
        onConnect: onConnected,

        // Runs if STOMP protocol reports an error
        onStompError: onError

    });

    // Debug: Verify activate() is executed
   

    // Start WebSocket connection
    stompClient.activate();
}

// ======================================================
// RUNS AFTER SUCCESSFUL CONNECTION
// ======================================================
function onConnected() {

    // Debug: Connection established successfully
   

    
    // Subscribe to backend topic
    stompClient.subscribe("/topic/public", (payload) => {

        // Debug: Raw message received from backend
      //  console.log("Payload:", payload);

        // Convert JSON string to JavaScript object
        const chatMessage = JSON.parse(payload.body);

        // Debug: Parsed message
      //  console.log("Received Message:", chatMessage);

        // Send message to Chat.jsx
        receiveMessageCallback(chatMessage);

    });

   // console.log("Subscribed to /topic/seen");
    stompClient.subscribe("/topic/seen", (payload) => {

    // Raw payload from backend
   // console.log("Seen Payload:", payload);

    // Convert JSON array to JavaScript array
    const updatedMessages = JSON.parse(payload.body);

   // console.log("Seen Messages:", updatedMessages);

    // Verify it is an array
  //  console.log("Is Array:", Array.isArray(updatedMessages));

    // Send to Chat.jsx
    seenMessageCallback(updatedMessages);

});

    stompClient.subscribe("/topic/status", (payload) => {

    const updatedStatus = JSON.parse(payload.body);

    updateStatusCallback(updatedStatus);

});



    

    console.log("Subscribed successfully");
}

// ======================================================
// STOMP ERROR
// ======================================================
function onError(error) {

    console.log("STOMP Error:", error);

}

// ======================================================
// SEND MESSAGE TO BACKEND
// ======================================================
function sendMessage(message) {

    // Convert object into JSON string
    const chatMessage = JSON.stringify(message);

    // Debug: Message before sending
    console.log("Sending Message:", message);

    // Debug: Verify client state before publish
    console.log("Connected:", stompClient.connected);
    console.log("Active:", stompClient.active);

    // Publish message to backend
    stompClient.publish({

        destination: "/app/chat.sendMessage",

        body: chatMessage

    });

    console.log("Message Published");
}

function disconnect() {

    console.log("Disconnect called");

    if (stompClient && stompClient.active) {

        stompClient.deactivate();

        console.log("WebSocket disconnected");
    }

    stompClient = null;
}

// Export functions
export { connect, sendMessage,disconnect };