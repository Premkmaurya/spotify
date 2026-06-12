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

  // Request synchronization state from other devices upon connection
  useEffect(() => {
    if (socket && connected) {
      socket.emit('requestSyncState');
      console.log('Emitted requestSyncState upon connection');
    }
  }, [socket, connected]);

  // Setup socket listeners for playback synchronization
  useEffect(() => {
    if (!socket || !connected) return;

    const handleSocketPlay = async (data: { musicId: string; progress?: number }) => {
      console.log('Received socket sync play event:', data);
      const { currentSong, audio, playSong } = usePlayerStore.getState();
      const targetProgress = data.progress ?? 0;

      const isDifferentSong = !currentSong || currentSong._id !== data.musicId;
      const isOutOfSync = currentSong && currentSong._id === data.musicId && Math.abs(audio.currentTime - targetProgress) > 2;

      if (isDifferentSong) {
        try {
          const songDetails = await getSongById(data.musicId);
          if (songDetails) {
            // Play song locally without passing the socket emitter callback to prevent loop feedback
            playSong(songDetails, [], undefined, targetProgress, true);
          }
        } catch (error) {
          console.error('Error fetching song details for socket sync play:', error);
        }
      } else {
        // Same song: update progress if out of sync, and force play if paused
        if (isOutOfSync) {
          audio.currentTime = targetProgress;
        }
        if (audio.paused) {
          audio.play()
            .then(() => {
              usePlayerStore.setState({ isPlaying: true });
            })
            .catch((err) => {
              console.error('Failed to auto-resume during socket sync play:', err);
            });
        }
      }
    };

    const handleSocketPause = (data: { musicId: string; progress?: number }) => {
      console.log('Received socket sync pause event:', data);
      const { currentSong, pauseSong } = usePlayerStore.getState();
      const targetProgress = data.progress ?? 0;

      if (currentSong && currentSong._id === data.musicId) {
        pauseSong(targetProgress);
      }
    };

    const handleRequestSyncState = (data: { requesterId: string }) => {
      console.log('Received requestSyncState from:', data.requesterId);
      const { currentSong, audio, isPlaying } = usePlayerStore.getState();
      if (currentSong) {
        socket.emit('sendSyncState', {
          requesterId: data.requesterId,
          musicId: currentSong._id,
          progress: audio.currentTime,
          isPlaying: isPlaying,
        });
      }
    };

    const handleSyncState = async (data: { musicId: string; progress: number; isPlaying: boolean }) => {
      console.log('Received syncState:', data);
      const { currentSong, playSong, pauseSong } = usePlayerStore.getState();

      const isDifferentSong = !currentSong || currentSong._id !== data.musicId;
      if (isDifferentSong) {
        try {
          const songDetails = await getSongById(data.musicId);
          if (songDetails) {
            playSong(songDetails, [], undefined, data.progress, data.isPlaying);
          }
        } catch (error) {
          console.error('Error fetching song details for syncState:', error);
        }
      } else {
        // Same song: sync play state and progress
        const { audio } = usePlayerStore.getState();
        if (data.isPlaying) {
          if (Math.abs(audio.currentTime - data.progress) > 2) {
            audio.currentTime = data.progress;
          }
          if (audio.paused) {
            audio.play()
              .then(() => {
                usePlayerStore.setState({ isPlaying: true });
              })
              .catch((err) => {
                console.error('Failed to play during syncState:', err);
              });
          }
        } else {
          pauseSong(data.progress);
        }
      }
    };

    socket.on('play', handleSocketPlay);
    socket.on('pause', handleSocketPause);
    socket.on('requestSyncState', handleRequestSyncState);
    socket.on('syncState', handleSyncState);

    return () => {
      socket.off('play', handleSocketPlay);
      socket.off('pause', handleSocketPause);
      socket.off('requestSyncState', handleRequestSyncState);
      socket.off('syncState', handleSyncState);
    };
  }, [socket, connected, playSong]);
};
