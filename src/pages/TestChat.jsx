/*import { useState } from "react";
import { connect, sendMessage } from "../services/WebSocket";


function TestChat() {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    function receiveMessage(chatMessage) {

        setMessages(prev => [...prev, chatMessage]);

    }

    function handleSend() {
        console.log("Send button clicked");
        sendMessage(message);

        setMessage("");

    }

    return (
        <div style={{ padding: "20px" }}>

            <h2>WebSocket Testing</h2>

            <button onClick={() => connect(receiveMessage)}>
                Connect
            </button>

            <br /><br />

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message"
            />

            <button onClick={handleSend}>
                Send
            </button>

            <hr />

            <h3>Messages</h3>

            {
                messages.map((msg, index) => (
                    <p key={index}>{msg.content}</p>
                ))
            }

        </div>
    );
}

export default TestChat;*/