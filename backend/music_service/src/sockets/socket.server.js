const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const cookie = require('cookie')


const socketAuthMiddleware = (socket, next) => {
    try {
        const cookieHeader = (socket.handshake.headers.cookie || '');
        const cookies = cookie.parse(cookieHeader);
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
            origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
            credentials: true
        },
    });

    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        socket.join(socket.user.id);

        socket.on("play", (data) => {
            const musicId = data.musicId;
            const progress = data.progress !== undefined ? data.progress : 0;
            socket.broadcast.to(socket.user.id).emit("play", { musicId, progress })
        })

        socket.on("pause", (data) => {
            const musicId = data.musicId;
            const progress = data.progress !== undefined ? data.progress : 0;
            socket.broadcast.to(socket.user.id).emit("pause", { musicId, progress })
        })

        socket.on("requestSyncState", () => {
            socket.broadcast.to(socket.user.id).emit("requestSyncState", { requesterId: socket.id })
        })

        socket.on("sendSyncState", (data) => {
            io.to(data.requesterId).emit("syncState", {
                musicId: data.musicId,
                progress: data.progress,
                isPlaying: data.isPlaying
            })
        })

        socket.on("disconnect", () => {
            socket.leave(socket.user.id)
        })
    });

};

module.exports = initSocketServer;
