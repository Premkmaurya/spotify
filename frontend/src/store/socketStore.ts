import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
  emitPlay: (musicId: string, progress?: number) => void;
  emitPause: (musicId: string, progress?: number) => void;
  emitRequestSyncState: () => void;
  emitSendSyncState: (requesterId: string, musicId: string, progress: number, isPlaying: boolean) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,

  connectSocket: () => {
    const { socket: existingSocket } = get();
    if (existingSocket) return;

    // Get Socket.IO server URL from environment variable
    // VITE_MUSIC_BACKEND_URL should be the full URL (e.g., https://my-render-backend.onrender.com)
    const musicUrl = import.meta.env.VITE_MUSIC_BACKEND_URL;
    
    if (!musicUrl) {
      console.error('Socket.IO URL not configured. Set VITE_MUSIC_BACKEND_URL environment variable.');
      set({ connected: false });
      return;
    }

    const token = localStorage.getItem('spotify_token');
    const socketInstance = io(musicUrl, {
      auth: {
        token: token || undefined,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    });

    socketInstance.on('connect', () => {
      set({ connected: true });
      console.log('Socket.IO connected');
    });

    socketInstance.on('disconnect', () => {
      set({ connected: false });
      console.log('Socket.IO disconnected');
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      set({ connected: false });
    });

    set({ socket: socketInstance });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },

  emitPlay: (musicId, progress) => {
    const { socket, connected } = get();
    if (socket && connected) {
      socket.emit('play', { musicId, progress: progress ?? 0 });
      console.log('Socket emit play:', musicId, 'at progress:', progress);
    }
  },

  emitPause: (musicId, progress) => {
    const { socket, connected } = get();
    if (socket && connected) {
      socket.emit('pause', { musicId, progress: progress ?? 0 });
      console.log('Socket emit pause:', musicId, 'at progress:', progress);
    }
  },

  emitRequestSyncState: () => {
    const { socket, connected } = get();
    if (socket && connected) {
      socket.emit('requestSyncState');
      console.log('Socket emit requestSyncState');
    }
  },

  emitSendSyncState: (requesterId, musicId, progress, isPlaying) => {
    const { socket, connected } = get();
    if (socket && connected) {
      socket.emit('sendSyncState', { requesterId, musicId, progress, isPlaying });
      console.log('Socket emit sendSyncState to', requesterId, 'with music:', musicId, 'progress:', progress, 'isPlaying:', isPlaying);
    }
  },
}));
export default useSocketStore;
