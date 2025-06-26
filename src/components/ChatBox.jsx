import { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../socket"; // adjust path if needed
import "./chatBox.css";

function ChatBox({ currentUser, targetUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history
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
      if (msg.from === targetUser || msg.to === targetUser) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('private_message', listener);
    return () => socket.off('private_message', listener);
  }, [targetUser, currentUser]);

  const handleSend = () => {
    if (!input.trim()) return;

    const msg = {
      from: currentUser,  // ✅ Important: Add sender info for local state
      to: targetUser,
      message: input,
    };

    socket.emit('private_message', msg);
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div>
      <h3>Chat with {targetUser}</h3>
      <div style={{
        height: 300,
        overflowY: 'scroll',
        border: '1px solid #ccc',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {messages.map((msg, i) => {
          const isSelf = msg.from === currentUser;
          return (
            <div
              key={i}
              style={{
                alignSelf: isSelf ? 'flex-end' : 'flex-start',
                background: isSelf ? '#dcf8c6' : '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '6px 10px',
                maxWidth: '70%',
                textAlign: isSelf ? 'right' : 'left',
              }}
            >
              {!isSelf && (
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '3px' }}>
                  {msg.from}
                </div>
              )}
              <div>{msg.message}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ marginTop: '10px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{ width: '80%', padding: '6px' }}
        />
        <button onClick={handleSend} disabled={!input.trim()} style={{ marginLeft: '5px' }}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
