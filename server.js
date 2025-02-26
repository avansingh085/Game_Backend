const express = require("express");
const { Server } = require("socket.io");
const https = require("https");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs=require('fs');
const database=require('./Schema/database.js')
database();
const app = express();
const {login,register,verifyToken}=require('./Controller/authentication.js')
app.use(cors());
const options = {
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-cert.pem')
  };
  
  const httpsServer = https.createServer(options, (req, res) => {
    res.writeHead(200);
    res.end();
  });

const io = new Server( httpsServer, {
    cors: { origin: "*" },
});
const op=require('./Controller/authentication.js');
app.post("/register",register)
app.post("/login",login);
app.get("/verifyToken",verifyToken);
const games = {};
const playerTimers = {}; 
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on("join", ({ board }) => {
        const gameType = socket.handshake.query.gameType;
        let gameId = null;
        let playerSymbol = null;

        for (const [id, game] of Object.entries(games)) {
            if (!game.players.O && game.gameType === gameType) {
             
                gameId = id;
                playerSymbol =(gameType==="TIC" ? 'X': 'b');
                game.players.O = { socketId: socket.id, userId: socket.handshake.query.id };
                break;
            }
        }

        if (!gameId) {
            gameId = `game_${uuidv4()}`;
            games[gameId] = {
                players: { X: { socketId: socket.id, userId: socket.handshake.query.id }, O: null },
                board,
                gameId,
                currentTurn: (gameType==="TIC" ? 'X': 'b'),
                gameType,
            };
            playerSymbol = (gameType==="TIC" ? 'X': 'b');
        }

        socket.join(gameId);
        console.log(`Player ${socket.id} joined game ${gameId} as ${playerSymbol}`);

        if (games[gameId].players.X && games[gameId].players.O) {
            io.to(gameId).emit("startGame", { gameId, ...games[gameId] });
            startTurnTimer(gameId);
        } else {
            socket.emit("waiting", "Waiting for an opponent...");
        }
    });

    socket.on("move", ({ gameId, board, symbol }) => {
        console.log(board)
      try{
        
        const game = games[gameId];
        // if (!game) return socket.emit("error", "Game not found.");
        // if (game.currentTurn !== symbol) return socket.emit("error", "Not your turn.");
        game.board = board;
        if(game.gameType==="TIC")
        game.currentTurn = symbol === "X" ? "O" : "X";
        else
        game.currentTurn=symbol ;
        io.to(gameId).emit("move", { board, symbol });
        resetTurnTimer(gameId);
      }catch(err){
        console.log("erorr during move");
      }
    });

    socket.on("reset", ({ gameId, board }) => {
        if (!games[gameId]) return;
        games[gameId].board = board;
        games[gameId].currentTurn = "X";
        io.to(gameId).emit("reset");
    });
console.log(games)
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const [gameId, game] of Object.entries(games)) {
            const playerType = Object.keys(game.players).find((key) => game.players[key]?.socketId === socket.id);
            if (playerType) {
                io.to(gameId).emit("opponentDisconnected", "Your opponent disconnected.");
                setTimeout(() => {
                    delete games[gameId];
                }, 30000);
                break;
            }
        }
    });

    function startTurnTimer(gameId) {
        if (playerTimers[gameId]) clearTimeout(playerTimers[gameId]);
        playerTimers[gameId] = setTimeout(() => {
            io.to(gameId).emit("turnTimeout", "A player lost due to timeout.");
            delete games[gameId];
        }, 60000);
    }

    function resetTurnTimer(gameId) {
        if (playerTimers[gameId]) clearTimeout(playerTimers[gameId]);
        startTurnTimer(gameId);
    }
});

httpsServer.listen(3001, () => {
    console.log("Server is running on port 3001");
});
