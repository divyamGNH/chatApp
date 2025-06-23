import {useState, useEffect} from "react";
import axios from "axios";

//onSelect is a function in app.jsx that sets the target user that is when i click on a contact it sets the target user as the selected user

function sideChatlist({currentUser,onSelect}){

    const[sidelist, setSidelist] = useState([]);

    useEffect(()=>{
        if(!currentUser) return;
        axios.get("/api/conversations/:username")
        .then((res)=>{
            setSidelist(res.data);
        })
        .catch((err)=>{

        })
    },[currentUser])
    return (
        <div>
      <h3>Conversations</h3>
      {sidelist.map((u) => (
        <div 
        key={u}
        onClick={() => onSelect(u)}
        >
          {u}
        </div>
      ))}
    </div>
    );
}

export default sideChatlist;