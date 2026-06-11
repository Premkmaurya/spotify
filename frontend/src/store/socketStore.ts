import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
  emitPlay: (musicId: string, progress?: number) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,

  connectSocket: () => {
    const { socket: existingSocket } = get();
    if (existingSocket) return;

    // Connect to the same origin; Vite will proxy "/socket.io" correctly
    const socketInstance = io({
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
}));
export default useSocketStore;
