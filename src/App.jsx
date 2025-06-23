import { useState } from 'react';
import './App.css';
import UserList from "./components/sideChatlist.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ChatBox from "./components/ChatBox.jsx";

function App() {

  const [currentUser, setCurrentUser] = useState([]);
  const [targetUser, setTargetUser] = useState([]);
  const [showRegister, setShowRegister] = useState(false);

  if(!currentUser){
    return(
      showRegister ? (<Register onRegister={()=>setShowRegister(false)}/> ): 
      (
        <div>
          <Login onLogin = {setTargetUser}/>
          <p>Don't have an account ? <button onClick={()=>setShowRegister(true)}>Register</button></p>
        </div>
      )
    )
  }

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <UserList currentUser={currentUser} onSelect={setTargetUser} />
      {targetUser && <ChatBox currentUser={currentUser} targetUser={targetUser} />}
    </div>
  );
}

export default App
