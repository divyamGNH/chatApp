import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
// import styles from './App.css';
import UserList from './components/sideChatlist.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ChatBox from './components/ChatBox.jsx';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/user/check-auth', {
          withCredentials: true,
        });
        setCurrentUser(res.data.user); // ✅ Keep user logged in after refresh
      } catch (err) {
        setCurrentUser(null);
      }
    };

    checkIfLoggedIn();
  }, []);

  if (!currentUser) {
    return showRegister ? (
      <Register onRegister={() => setShowRegister(false)} />
    ) : (
      <div>
        <Login onLogin={setCurrentUser} />
        <p>
          Don't have an account?{' '}
          <button onClick={() => setShowRegister(true)}>Register</button>
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="sideContainer">
        <UserList currentUser={currentUser} onSelect={setTargetUser} />
      </div>

      {targetUser ? (
        <div className="chatbox">
          <ChatBox currentUser={currentUser} targetUser={targetUser} />
        </div>
      ) : (
        <div className="chatbox cb1">Select a user to start chatting</div>
      )}
    </div>
  );
}

export default App;
