const express = require("express");
const socket = require("socket.io");
const http = require("http");
const{ Chess } = require("chess.js");   //importing packages
const path = require("path");

const app = express();       //instance of express application

const server = http.createServer(app);  //server is created
const io = socket(server); //connected to socter via server for real time movement

const chess = new Chess();   //created chess instance to use all the chess.com functionalities
let players = {};    //player object
let currentPlayer = "W"; //first player to join is white

app.set("view engine", "ejs"); //can use ejs similar to HTML
app.use(express.static(path.join(__dirname, "public")));  //can use static files images videos fonts

app.get("/", (req, res) => {
    res.render("index", {title : "Chess Game"});  //gives render our first index page
});

io.on("connection", function(uniquesocket){
    console.log("connected");

    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }else{
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnet", function(){
        if(uniquesocket.id === players.white){
            delete players.white; 
        }else if(uniquesocket.id === players.black){
            delete players.black;
        }
    });

    uniquesocket.on("move",(move)=>{
        try{
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if(chess.turn() === "b" && uniquesocket.id !== players.black) return;

            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen())
            }else{
                console.log("Invalid move : ",move);
                uniquesocket.emit("invalidMove",move);
            }
        }catch(err){
            console.log(err);
            uniquesocket.emit("Invalid move: ", move);
        }
    });
});

server.listen(3000, function(){
   console.log("listening on port 3000");
});
