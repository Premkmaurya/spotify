import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import { usePlayerStore } from '../store/playerStore';
import { getSongById } from '../services/api/music';

export const useSocketSync = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { socket, connected, connectSocket, disconnectSocket } = useSocketStore();
  const { playSong } = usePlayerStore();

  // Manage socket connection lifecycle based on auth state
  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user, connectSocket, disconnectSocket]);

  // Setup socket listener for "play" synchronizations
  useEffect(() => {
    if (!socket || !connected) return;

    const handleSocketPlay = async (data: { musicId: string; progress?: number }) => {
      console.log('Received socket sync play event:', data);
      const { currentSong, audio } = usePlayerStore.getState();

      const targetProgress = data.progress ?? 0;

      const isDifferentSong = !currentSong || currentSong._id !== data.musicId;
      const isOutOfSync = currentSong && currentSong._id === data.musicId && Math.abs(audio.currentTime - targetProgress) > 2;

      if (isDifferentSong || isOutOfSync) {
        try {
          // Fetch full song details by ID
          const songDetails = await getSongById(data.musicId);
          if (songDetails) {
            // Play song locally without passing the socket emitter callback to prevent loop feedback
            playSong(songDetails, [], undefined, targetProgress);
          }
        } catch (error) {
          console.error('Error fetching song details for socket sync play:', error);
        }
      }
    };

    socket.on('play', handleSocketPlay);

    return () => {
      socket.off('play', handleSocketPlay);
    };
  }, [socket, connected, playSong]);
};
