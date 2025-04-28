const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
