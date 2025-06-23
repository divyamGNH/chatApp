import {useState, useEffect} from "react";
import axios from "axios";

//onSelect is a function in app.jsx that sets the target user that is when i click on a contact it sets the target user as the selected user

function sideChatlist({currentUser,onSelect}){

    const[sidelist, setSidelist] = useState([]);

    useEffect(()=>{
        if(!currentUser) return;
        axios.get(`http://localhost:3000/api/conversations/:${currentUser}`)
        .then((res)=>{
            setSidelist(res.data);
        })
        .catch((err)=>{
          console.log("Failed to fetch conversations:", err);
        })
    },[currentUser])
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
    </div>
    );
}

export default sideChatlist;