const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

//
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.connect('mongodb://localhost:27017/mydb',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))

app.post("/sign_up",(req,res)=>{
    var name = req.body.name;
    var email = req.body.email;
    var phno = req.body.phno;

    var data = {
        "name": name,
        "email" : email,
        "phno": phno
    }

    db.collection('users').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully");
    });

    return res.redirect('signup_success.html')

})
//
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname+'/public'));

app.get('/',(req,res)=>{
  res.sendFile(__dirname+'/index.html');
})

/* Socket.io Setup */

const io = require("socket.io")(server);
var users = {};

io.on("connection",(socket)=>{

  socket.on("new-user-joined",(username)=>{
    users[socket.id] = username;
    socket.broadcast.emit('user-connected',username);
    io.emit("user-list",users);
  });

  socket.on("disconnect",()=>{
    socket.broadcast.emit('user-disconnected',user = users[socket.id]);
    delete users[socket.id];
    io.emit("user-list",users);
  });

  socket.on('message',(data)=>{
    socket.broadcast.emit("message",{user: data.user,msg: data.msg});
  });

});

/* Socket.io Setup Ends */

server.listen(port,()=>{
  console.log("Server started at "+port);
});