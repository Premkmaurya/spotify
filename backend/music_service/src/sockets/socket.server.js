const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const socketAuthMiddleware = (socket, next) => {
  try {
    // Extract token from multiple possible locations
    const authHeader = socket.handshake.auth?.token || 
                      socket.handshake.headers?.authorization ||
                      socket.handshake.query?.token;

    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;

    if (!token) {
      const err = new Error('Authentication error: token required');
      err.data = { content: 'Please re-login' };
      return next(err);
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    socket.user = decoded;
    socket.userId = decoded.id || decoded._id;
    next();
  } catch (error) {
    console.error('Socket auth failed:', error.message);
    const err = new Error('Authentication error: invalid token');
    err.data = { content: error.message };
    next(err);
  }
};

const initSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'https://spotify-ebon-one.vercel.app',
                process.env.FRONTEND_URL || 'https://spotify-ebon-one.vercel.app'
            ],
            credentials: true,
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization']
        },
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        pingInterval: 25000,
        pingTimeout: 60000,
        maxHttpBufferSize: 1e6,
        allowUpgrades: true,
    });

    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected with socket id: ${socket.id}`);
        
        // Join user-specific room
        socket.join(socket.userId);

        // Play event - broadcast to user's other devices
        socket.on("play", (data) => {
            const musicId = data.musicId;
            const progress = data.progress !== undefined ? data.progress : 0;
            
            console.log(`User ${socket.userId} playing music ${musicId} at progress ${progress}`);
            
            socket.broadcast.to(socket.userId).emit("play", { musicId, progress })
        });

        // Pause event - broadcast to user's other devices
        socket.on("pause", (data) => {
            const musicId = data.musicId;
            const progress = data.progress !== undefined ? data.progress : 0;
            
            console.log(`User ${socket.userId} pausing music ${musicId} at progress ${progress}`);
            
            socket.broadcast.to(socket.userId).emit("pause", { musicId, progress })
        });

        // Request sync state from other devices
        socket.on("requestSyncState", () => {
            console.log(`User ${socket.userId} requesting sync state from other devices`);
            socket.broadcast.to(socket.userId).emit("requestSyncState", { requesterId: socket.id })
        });

        // Send sync state to requesting device
        socket.on("sendSyncState", (data) => {
            console.log(`User ${socket.userId} sending sync state to requester ${data.requesterId}`);
            io.to(data.requesterId).emit("syncState", {
                musicId: data.musicId,
                progress: data.progress,
                isPlaying: data.isPlaying
            })
        });

        socket.on("disconnect", () => {
            console.log(`User ${socket.userId} disconnected`);
            socket.leave(socket.userId)
        });

        socket.on("error", (error) => {
            console.error(`Socket error for user ${socket.userId}:`, error);
        });
    });

    return io;
};

module.exports = initSocketServer;
