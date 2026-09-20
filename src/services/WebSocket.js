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
//let stompClient = null;

let chatStompClient = null;
let globalStompClient = null;

// Callback function that Chat.jsx passes.
// This function is called whenever a new message is received.
let receiveMessageCallback = null;
let seenMessageCallback = null;

let chatStatusCallback = null;
let chatTypingCallback = null;
let chatDeliveredCallback = null;



let globalMessageCallback = null;
let globalSeenCallback = null;
let globalStatusCallback = null;
let globalTypingCallback = null;
let globalDeliveredCallback = null;

// ======================================================
// CONNECT TO WEBSOCKET SERVER
// ======================================================
function connect(receiveMessage, receiveSeenMessage, receiveUpdateStatus, receiveTypingStatus, receiveDeliveredStatus) {

    // Debug: Check how many times connect() is called
    console.log("connect() called");

    if (chatStompClient && chatStompClient.active) {
        console.log("already connected");
        return;
    }
    // Store callback so we can use it later
    receiveMessageCallback = receiveMessage;
    seenMessageCallback = receiveSeenMessage;
   chatStatusCallback = receiveUpdateStatus;
chatTypingCallback = receiveTypingStatus;
chatDeliveredCallback = receiveDeliveredStatus;
    // Create STOMP client
    chatStompClient = new Client({


        // Create SockJS connection
        webSocketFactory: () =>
            new SockJS("http://localhost:8081/ws"),

          // Send JWT during STOMP connection
         connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    },

        // Runs automatically after successful connection
        onConnect: onConnected,

        // Runs if STOMP protocol reports an error
        onStompError: onError

    });

    // Debug: Verify activate() is executed


    // Start WebSocket connection
    chatStompClient.activate();
}

// ======================================================
// RUNS AFTER SUCCESSFUL CONNECTION
// ======================================================
function onConnected() {

    // Debug: Connection established successfully



    // Subscribe to backend topic
    chatStompClient.subscribe("/topic/public", (payload) => {

        // Debug: Raw message received from backend


        // Convert JSON string to JavaScript object
        const chatMessage = JSON.parse(payload.body);

        // Debug: Parsed message
        // console.log("Received Message:", chatMessage);

        // Send message to Chat.jsx
        receiveMessageCallback(chatMessage);

    });

    // console.log("Subscribed to /topic/seen");
    chatStompClient.subscribe("/topic/seen", (payload) => {

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

    chatStompClient.subscribe("/topic/status", (payload) => {

        const updatedStatus = JSON.parse(payload.body);

        if (chatStatusCallback) {
    chatStatusCallback(updatedStatus);
}

    });

   chatStompClient.subscribe("/topic/typingStatus", (payload) => {

        const updateTyping = JSON.parse(payload.body);
        //  console.log("Meesage send to backend",updateTyping);

        if (chatTypingCallback) {
    chatTypingCallback(updateTyping);
}
    })


    chatStompClient.subscribe("/topic/delivered", (payload) => {

        const updateDelivered = JSON.parse(payload.body);
        console.log("Meesage come from backend", updateDelivered);

        if (chatDeliveredCallback) {
    chatDeliveredCallback(updateDelivered);
}
    })
}

function connectGlobal(receiveGlobalMessage, receiveGlobalSeen,
    receiveGlobalStatus,
    receiveGlobalTyping,
    receiveGlobalDelivered) {


    globalSeenCallback = receiveGlobalSeen;
    globalStatusCallback = receiveGlobalStatus;
    globalTypingCallback = receiveGlobalTyping;
    globalDeliveredCallback = receiveGlobalDelivered;

    console.log("🔥 connectGlobal called");

    globalMessageCallback = receiveGlobalMessage;

    if (globalStompClient && globalStompClient.active) {
        console.log("❌ Existing WebSocket already active");
        return;
    }

    console.log("🟢 Creating Global WebSocket");


     console.log(
    "JWT TOKEN:",
    localStorage.getItem("token")
);
    // Create STOMP client
    globalStompClient = new Client({

        
        webSocketFactory: () =>
            new SockJS("http://localhost:8081/ws"),

        // Send JWT during STOMP connection
       
    connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    },

        onConnect: onGlobalConnected,

        onStompError: onError
    });

    // Start connection
    globalStompClient.activate();
}
function onGlobalConnected() {

    console.log("🟢 Global WebSocket connected");

    // MESSAGE
    const subscription=globalStompClient.subscribe("/topic/public", (payload) => {

        console.log("📩 /topic/public received");
        
          console.log("🔥🔥🔥 MESSAGE RECEIVED FROM BROKER 🔥🔥🔥");
            console.log("Payload:", payload);
            console.log("Body:", payload.body);

        const message = JSON.parse(payload.body);

        console.log("🌍 Global message:", message);

        if (globalMessageCallback) {
            globalMessageCallback(message);
        }
         console.log("✅ Global subscribed to /topic/public");
    });
    console.log("✅ Subscription created:", subscription);

    // SEEN
  globalStompClient.subscribe("/topic/seen", (payload) => {

        const messages = JSON.parse(payload.body);

        if (globalSeenCallback) {
            globalSeenCallback(messages);
        }
    });

    // STATUS
   globalStompClient.subscribe("/topic/status", (payload) => {

        const status = JSON.parse(payload.body);

        if (globalStatusCallback) {
            globalStatusCallback(status);
        }
    });

    // TYPING
  globalStompClient.subscribe("/topic/typingStatus", (payload) => {

        const status = JSON.parse(payload.body);

        if (globalTypingCallback) {
            globalTypingCallback(status);
        }
    });

    // DELIVERED
    globalStompClient.subscribe("/topic/delivered", (payload) => {

        const message = JSON.parse(payload.body);

        if (globalDeliveredCallback) {
            globalDeliveredCallback(message);
        }
    });
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



    // Publish message to backend
    chatStompClient.publish({

        destination: "/app/chat.sendMessage",

        body: chatMessage

    });

    //  console.log("Message Published");
}

function sendTypingStatus(typingStatus) {

    // console.log("send update status to backend");
   chatStompClient.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify(typingStatus)
    });

}
function disconnect() {

    //  console.log("Disconnect called");

    if (chatStompClient && chatStompClient.active) {

       chatStompClient.deactivate();

        // console.log("WebSocket disconnected");
    }

   chatStompClient = null;
}

// Export functions
export { connect, connectGlobal, sendMessage, sendTypingStatus, disconnect };