const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const cookie = require('cookie')


const socketAuthMiddleware = (socket, next) => {
    try {
        const cookies = (socket.handshake.headers.cookie || '');

        const token = cookies.token;
        if (!token) {
            return next(new Error('Authentication error: token required'));
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (error) {
        console.error('Socket auth failed:', error.message);
        next(new Error('Authentication error'));
    }
};

const initSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            credentials: true
        },
    });

    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        socket.join(socket.user.id);

        socket.on("play", (data) => {
            const musicId = data.musicId;
            socket.broadcast.to(socket.user.id).emit("play", { musicId })
        })

        socket.on("disconnect", () => {
            socket.leave(socket.user.id)
        })
    });

};

module.exports = initSocketServer;
