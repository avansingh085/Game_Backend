const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://gamezone-avan.netlify.app',
    methods: ['GET', 'POST'],
  },
});

const games = {}; // Store game data by room ID
const disconnectedPlayers = {}; // Track disconnected players with a timeout

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', () => {
    // Check if the player is reconnecting
    for (const [gameId, playerId] of Object.entries(disconnectedPlayers)) {
      if (playerId === socket.id) {
        clearTimeout(disconnectedPlayers[gameId].timeout);
        delete disconnectedPlayers[gameId];
        socket.join(gameId);
        console.log(`Player ${socket.id} rejoined game ${gameId}`);
        return;
      }
    }

    // Find an available game room or create a new one
    let gameId = null;
    for (const [id, game] of Object.entries(games)) {
      if (game.players.length < 2) {
        gameId = id;
        break;
      }
    }

    if (!gameId) {
      // Create a new game
      gameId = `game_${socket.id}`;
      games[gameId] = {
        players: [],
        board: Array(9).fill(null),
        currentTurn: 'X',
      };
    }

    const game = games[gameId];
    game.players.push(socket.id);
    const playerSymbol = game.players.length === 1 ? 'X' : 'O';

    socket.join(gameId);
    console.log(`Player ${socket.id} joined game ${gameId} as ${playerSymbol}`);

    // Notify the player of their symbol and game ID
    socket.emit('startGame', { symbol: playerSymbol, gameId });

    // If the game now has two players, notify them to start
    if (game.players.length === 2) {
      io.to(gameId).emit('readyToPlay', {
        message: 'Game ready. Start playing!',
      });
    }
  });

  socket.on('move', ({ gameId, board, symbol }) => {
    const game = games[gameId];
    if (!game) {
      socket.emit('error', 'Game not found.');
      return;
    }

    if (game.currentTurn !== symbol) {
      socket.emit('error', 'Not your turn.');
      return;
    }

    // Validate the move
    const isValidMove = board.every(
      (cell, idx) => cell === game.board[idx] || (game.board[idx] === null && cell !== null)
    );
    if (!isValidMove) {
      socket.emit('error', 'Invalid move.');
      return;
    }

    game.board = board;
    game.currentTurn = symbol === 'X' ? 'O' : 'X';

    // Broadcast the move to the other player
    socket.to(gameId).emit('move', { board, symbol });
  });

  socket.on('reset', ({ gameId }) => {
    const game = games[gameId];
    if (!game) {
      socket.emit('error', 'Game not found.');
      return;
    }

    game.board = Array(9).fill(null);
    game.currentTurn = 'X';
    io.to(gameId).emit('reset');
    console.log(`Game ${gameId} has been reset.`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);

    // Find the game the player was in
    for (const [gameId, game] of Object.entries(games)) {
      if (game.players.includes(socket.id)) {
        game.players = game.players.filter((id) => id !== socket.id);

        if (game.players.length === 0) {
          delete games[gameId]; // Delete the game if no players are left
          console.log(`Game ${gameId} deleted.`);
        } else {
          // Notify the remaining player and give a chance for the disconnected player to reconnect
          disconnectedPlayers[gameId] = {
            playerId: socket.id,
            timeout: setTimeout(() => {
              console.log(`Player ${socket.id} did not reconnect. Removing from game ${gameId}.`);
              delete games[gameId];
              delete disconnectedPlayers[gameId];
            }, 30000), // Timeout for 30 seconds
          };

          io.to(gameId).emit('opponentDisconnected', 'Your opponent disconnected.');
        }
        break;
      }
    }
  });
});

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
