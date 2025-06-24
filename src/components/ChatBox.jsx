import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket"; // adjust path if needed

function ChatBox({ currentUser, targetUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Fetch messages
  useEffect(() => {
    if (!targetUser || !currentUser) return;
    axios.get(`http://localhost:3000/api/messages/${targetUser}?self=${currentUser}`, {
      withCredentials: true,
    })
      .then(res => {
        setMessages(res.data);
      })
      .catch(err => {
        console.error("❌ Failed to load messages:", err);
      });
  }, [targetUser, currentUser]);

  // Real-time listener
  useEffect(() => {
    const listener = (msg) => {
      if (msg.from === targetUser) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('private_message', listener);
    return () => socket.off('private_message', listener);
  }, [targetUser]);

  // Send message
  const handleSend = () => {
    if (!input.trim()) return;

    socket.emit('private_message', { to: targetUser, message: input });

    setMessages(prev => [...prev, { from: currentUser, message: input }]);
    setInput('');
  };

  return (
    <div>
      <h3>Chat with {targetUser}</h3>
      <div style={{ height: 200, overflowY: 'scroll', border: '1px solid #ccc', padding: '5px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.from === currentUser ? 'right' : 'left' }}>
            <b>{m.from}</b>: {m.message}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default ChatBox;
