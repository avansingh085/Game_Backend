const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');
const socketManager = require('./socket/socketManager');
const dotenv=require('dotenv');
dotenv.config();
connectDB();

const options = {
    key: fs.readFileSync('certs/server-key.pem'),
    cert: fs.readFileSync('certs/server-cert.pem'),
};

const server = http.createServer(options, app);
const io = new Server(server, {
    cors: { origin: '*' },
});

socketManager(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
