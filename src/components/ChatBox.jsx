import {useState} from "react";

//This is the most important logic contains socket logic 

function ChatBox({currentUser,targetUser}){

    const[messages,setMessages] = useState([]);
    const[input,setInput] = useState('');

    //get all the messages
    useEffect(async()=>{
        const res = await axios.get(`http://localhost:3000/api/messages/:${targetUser}?self=${currentUser}`);
        setMessages(res.data);
    },[targetUser,currentUser]);

    //socket
    useEffect(async()=>{
        socket.on('private_msg',msg=>{
            if(msg.from === targetUser){
                setMessages(prev => [...prev,msg]);
            }
        });

        return ()=>socket.off('private_msg');
    },[targetUser]);
    
    const handleSend = ()=>{
        socket.emit('private_msg', {to:targetUser, message:input});
        setMessages(prev => [...prev,{from:currentUser, message:input}]);
        setInput('');
    }

     <div>
    <h3>Chat with {targetUser}</h3>
    <div style={{ height: 200, overflowY: 'scroll', border: '1px solid #ccc' }}>
      {messages.map((m, i) => (
        <div key={i} style={{ textAlign: m.from === currentUser ? 'right' : 'left' }}>
          <b>{m.from}</b>: {m.message}
        </div>
      ))}
    </div>
    <input value={input} onChange={e => setInput(e.target.value)} />
    <button onClick={handleSend}>Send</button>
  </div>
}

export default ChatBox;