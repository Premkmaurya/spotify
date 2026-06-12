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

    // Connect using MUSIC_BACKEND_URL environment variable
    const musicUrl = import.meta.env.MUSIC_BACKEND_URL || '';
    const socketInstance = io(musicUrl, {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling'],
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
