const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);
app.use(cors({ 
    origin: 'https://game-application-blond.vercel.app',
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.get('/health', (req, res) => {
    return res.send("server health good!");
})

module.exports = app;
