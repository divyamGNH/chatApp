import { useState } from "react";
import axios from "axios";

function Login({onLogin}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async() => {
    try{
        const res = await axios.post("http://localhost:3000/api/auth/login",{username,password},{withCredentials: true});
        onLogin(res.data.username);
    }catch(err){
        console.log("Error sending data to backend",err);
        alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
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
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
