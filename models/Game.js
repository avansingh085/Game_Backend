import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    gameId: { type: String, required: true, unique: true },
    gameType: { type: String, enum: ['TIC', 'CHESS'], required: true },
    players: {
        X: { userId: String, User: Object },
        O: { userId: String, User: Object }
    },
    board: { type: Array, default: [] }, 
    currentTurn: String,
    status: { type: String, enum: ['active', 'completed', 'draw'], default: 'active' },
    winner: { type: String, default: null },
    history: [{
        symbol: String,
        board: Array,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export const Game = mongoose.model('Game', gameSchema);