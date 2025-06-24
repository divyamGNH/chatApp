import { useState, useEffect } from "react";
import axios from "axios";

// onSelect is a function in App.jsx that sets the target user
// currentUser is the logged-in user, passed from App.jsx

function sideChatlist({ currentUser, onSelect }) {
  const [sidelist, setSidelist] = useState([]);
  const [newTarget, setNewTarget] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    axios.get('http://localhost:3000/api/conversations', { withCredentials: true })
      .then((res) => {
        setSidelist(res.data);
      })
      .catch((err) => {
        console.log("Failed to fetch conversations:", err);
      });
  }, [currentUser]);

  const handleManualEntry = () => {
    if (newTarget.trim()) {
      onSelect(newTarget.trim());
      setNewTarget('');
    }
  };

  return (
    <div>
      <h3>Conversations</h3>
      {sidelist.map((targetUser) => (
        <div
          key={targetUser}
          onClick={() => onSelect(targetUser)}
        >
          {targetUser}
        </div>
      ))}

      <hr />
      <h4>Start New Chat</h4>
      <input
        value={newTarget}
        onChange={(e) => setNewTarget(e.target.value)}
        placeholder="Enter username"
      />
      <button onClick={handleManualEntry}>Chat</button>
    </div>
  );
}

export default sideChatlist;
