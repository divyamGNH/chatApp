import { useState } from 'react';
import './App.css';
import UserList from "./components/sideChatlist.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ChatBox from "./components/ChatBox.jsx";

function App() {

  const [currentUser, setCurrentUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  if(!currentUser){
    return(
      showRegister ? (<Register onRegister={()=>setShowRegister(false)}/> ): 
      (
        <div>
          <Login onLogin = {setCurrentUser}/>
          <p>Don't have an account ? <button onClick={()=>setShowRegister(true)}>Register</button></p>
        </div>
      )
    )
  }

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <UserList currentUser={currentUser} onSelect={setTargetUser} />
      {targetUser ? (
        <ChatBox currentUser={currentUser} targetUser={targetUser} />
      ) : (
        <div style={{ marginTop: '50px' }}>Select a user to start chatting</div>
      )}
    </div>
  );
}

export default App;
