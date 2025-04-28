const { v4: uuidv4 } = require('uuid');
const games = {};
const playerTimers = {};

const socketManager = (io) => {
    
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
                io.to(gameId).emit("startGame", { gameId,players:games[gameId].players });
                startTurnTimer(gameId);
            } else {
                socket.emit("waiting", "Waiting for an opponent...");
            }
        });
        socket.on("checkMate",({gameId,turn,winner})=>{
             io.to(gameId).emit("checkMate",{gameId,turn,winner});
        })
        socket.on("Draw",({gameId,turn})=>{
          io.to(gameId).emit("Draw",{gameId,turn});
        })
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
    })
    
};

module.exports = socketManager;
