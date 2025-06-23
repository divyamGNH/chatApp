import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import connectDB from "./db.js";
import Message from "./dbModels/message.js";
import cookieParser from "cookie-parser";
import auth from "./routes/auth.js";
import dotenv from "dotenv";


dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

// TODO: Add your auth routes
app.use("/api/auth", auth); // Placeholder

const users= {};       // socket.id -> username
const userSockets = {}; // username -> socket.id

io.on('connection', (socket) => {
  console.log("User is connected");

  try {
    // Extract token from cookie header
    const token = socket.handshake.headers.cookie
      ?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) return;

    // Verify and decode the token
    const decoded = jwt.verify(token, 'your-secret-key');
    const username = decoded.username;

    //Store the username and socketid for further use
    //for temporary use later we have to use a db for these too
    users[socket.id] = username;
    userSockets[username] = socket.id;

  } catch (err) {
    console.log("Error fetching username for sockets", err);
  }


  //recieve socket private messages
  socket.on('private_msg',async(to,message)=>{
    const from = users[socket.id];
    const targetSocket = userSockets[to];

    //send and store the message in the db 
    await Message.create({from,to, message});

    //if the targetSocket is online and connected 
    if(targetSocket){
        io.to(targetSocket).emit('private_msg',{from, message});
    }
  })
  

  //disconnect a user or socket
  socket.on('disconnect', ()=>{
    const username = users[socket.id];
    delete users[socket.id];
    delete userSockets[username];

    //this is the temporary appraoch as we store users and userSockets locally but later we will use databases for them too then we have to change the logic here
  })
});


//get all the messages that a user has recieved from the database
app.get("/api/messages/:username", async(req,res)=>{
    try{
        //first get the sender and reciever info soo
        const user = req.query.self;
        const reciever = req.params.username;

        const messages = await Message.find({
            $or :[
                {from:user, to:reciever},
                {from:reciever, to:user}   
            ]
        }).sort({timestamp:1});
        //timestamp means sort all the messages ascencding according to the time 

        res.send(messages);
    }catch(err){
        console.log("Error fetching messages from the database",err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


//get all the user's chat list that is all the other users that the user has chatted to 
app.get("/api/conversations/:username", async(req,res)=>{
    //now simply we want all the users that our logged in user has sent the messages to 

    const username = req.params
})

server.listen(3000, () => {
  console.log("Server is listening at PORT: 3000");
});
