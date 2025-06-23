import { useState } from "react";
import axios from "axios";

function Register({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post("/api/auth/register", { username, password });
      console.log("User registered successfully");
      
      //to tell how the frontend must be updated after a succesfull registration (can also pass the parameters if needed like in the login page we have passed the username)
      onRegister(); 
      
    } catch (err) {
      console.log("Error sending register data from frontend to backend", err);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
