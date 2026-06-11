import { create } from 'zustand';
import type { Song } from '../types';

interface PlayerState {
  isPlaying: boolean;
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  history: Song[];
  volume: number;
  isMuted: boolean;
  progress: number;
  duration: number;
  isShuffle: boolean;
  isRepeat: 'none' | 'all' | 'one';
  audio: HTMLAudioElement;

  playSong: (song: Song, queueContext?: Song[], emitSocketPlay?: (musicId: string, progress?: number) => void, startAtProgress?: number) => void;
  playSelected: (song: Song, queueContext?: Song[]) => void;
  togglePlay: (emitSocketPlay?: (musicId: string, progress?: number) => void) => void;
  setPlaying: (isPlaying: boolean) => void;
  nextSong: (emitSocketPlay?: (musicId: string, progress?: number) => void) => void;
  prevSong: (emitSocketPlay?: (musicId: string, progress?: number) => void) => void;
  setQueue: (queue: Song[]) => void;
  addToQueue: (song: Song) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  seek: (seconds: number, emitSocketPlay?: (musicId: string, progress?: number) => void) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  resetPlayer: () => void;
}

// Singleton audio instance
const globalAudio = new Audio();
globalAudio.preload = 'metadata';

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Update store progress during playback
  globalAudio.addEventListener('timeupdate', () => {
    set({ progress: globalAudio.currentTime });
  });

  globalAudio.addEventListener('durationchange', () => {
    if (!isNaN(globalAudio.duration)) {
      set({ duration: globalAudio.duration });
    }
  });

  globalAudio.addEventListener('ended', () => {
    const { isRepeat, nextSong } = get();
    if (isRepeat === 'one') {
      globalAudio.currentTime = 0;
      globalAudio.play().catch((err) => console.log('Audio playback error:', err));
    } else {
      nextSong();
    }
  });

  return {
    isPlaying: false,
    currentSong: null,
    queue: [],
    currentIndex: -1,
    history: [],
    volume: 0.5,
    isMuted: false,
    progress: 0,
    duration: 0,
    isShuffle: false,
    isRepeat: 'none',
    audio: globalAudio,

    playSong: (song, queueContext = [], emitSocketPlay, startAtProgress) => {
      const { currentSong, audio } = get();
      
      // Update history if we had a current song
      if (currentSong && currentSong._id !== song._id) {
        set((state) => ({ history: [...state.history.slice(-19), currentSong] }));
      }

      // Determine queue and index
      let finalQueue = [...queueContext];
      if (finalQueue.length === 0) {
        finalQueue = [song];
      }
      
      // If the song is not in the queue, prepend or add it
      let idx = finalQueue.findIndex((s) => s._id === song._id);
      if (idx === -1) {
        finalQueue = [song, ...finalQueue];
        idx = 0;
      }

      set({
        currentSong: song,
        queue: finalQueue,
        currentIndex: idx,
        isPlaying: true,
        progress: startAtProgress ?? 0,
      });

      // Update audio source and play
      const sourceChanged = audio.src !== song.musicUrl;
      if (sourceChanged) {
        audio.src = song.musicUrl;
        if (startAtProgress !== undefined && startAtProgress > 0) {
          const handleMetadata = () => {
            audio.currentTime = startAtProgress;
            audio.removeEventListener('loadedmetadata', handleMetadata);
          };
          audio.addEventListener('loadedmetadata', handleMetadata);
        }
      } else {
        if (startAtProgress !== undefined && !isNaN(startAtProgress)) {
          audio.currentTime = startAtProgress;
        }
      }
      audio.volume = get().isMuted ? 0 : get().volume;
      
      audio.play()
        .then(() => {
          set({ isPlaying: true });
          // Emit to socket for synchronization
          if (emitSocketPlay) {
            emitSocketPlay(song._id, audio.currentTime);
          }
        })
        .catch((err) => {
          console.error('Audio playback failed:', err);
          set({ isPlaying: false });
        });
    },

    // A wrapper to be used by UI components (the sync hook will handle socket broadcasting)
    playSelected: (song, queueContext = []) => {
      get().playSong(song, queueContext);
    },

    togglePlay: (emitSocketPlay) => {
      const { isPlaying, currentSong, audio } = get();
      if (!currentSong) return;

      if (isPlaying) {
        audio.pause();
        set({ isPlaying: false });
      } else {
        audio.play()
          .then(() => {
            set({ isPlaying: true });
            if (emitSocketPlay) {
              emitSocketPlay(currentSong._id, audio.currentTime);
            }
          })
          .catch((err) => {
            console.error('Playback failed:', err);
          });
      }
    },

    setPlaying: (isPlaying) => {
      const { audio, currentSong } = get();
      if (!currentSong) return;
      if (isPlaying) {
        audio.play().then(() => set({ isPlaying: true })).catch(() => set({ isPlaying: false }));
      } else {
        audio.pause();
        set({ isPlaying: false });
      }
    },

    nextSong: (emitSocketPlay) => {
      const { queue, currentIndex, isShuffle, isRepeat, playSong } = get();
      if (queue.length === 0) return;

      let nextIndex = currentIndex;

      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      } else {
        nextIndex = currentIndex + 1;
        if (nextIndex >= queue.length) {
          if (isRepeat === 'all') {
            nextIndex = 0;
          } else {
            // End of queue and no repeat
            set({ isPlaying: false });
            globalAudio.pause();
            return;
          }
        }
      }

      const nextS = queue[nextIndex];
      if (nextS) {
        playSong(nextS, queue, emitSocketPlay);
      }
    },

    prevSong: (emitSocketPlay) => {
      const { queue, currentIndex, playSong } = get();
      if (queue.length === 0) return;

      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1; // loop back to end
      }

      const prevS = queue[prevIndex];
      if (prevS) {
        playSong(prevS, queue, emitSocketPlay);
      }
    },

    setQueue: (queue) => {
      const { currentSong } = get();
      let idx = -1;
      if (currentSong) {
        idx = queue.findIndex((s) => s._id === currentSong._id);
      }
      set({ queue, currentIndex: idx });
    },

    addToQueue: (song) => {
      set((state) => {
        const alreadyInQueue = state.queue.some((s) => s._id === song._id);
        if (alreadyInQueue) return state;
        return { queue: [...state.queue, song] };
      });
    },

    setVolume: (vol) => {
      const volume = Math.max(0, Math.min(1, vol));
      set({ volume, isMuted: volume === 0 });
      if (!get().isMuted) {
        globalAudio.volume = volume;
      }
    },

    toggleMute: () => {
      const { isMuted, volume } = get();
      const newMute = !isMuted;
      set({ isMuted: newMute });
      globalAudio.volume = newMute ? 0 : volume;
    },

    setProgress: (progress) => {
      set({ progress });
    },

    setDuration: (duration) => {
      set({ duration });
    },

    seek: (seconds, emitSocketPlay) => {
      if (isNaN(seconds)) return;
      globalAudio.currentTime = seconds;
      set({ progress: seconds });
      const { currentSong } = get();
      if (currentSong && emitSocketPlay) {
        emitSocketPlay(currentSong._id, seconds);
      }
    },

    toggleShuffle: () => {
      set((state) => ({ isShuffle: !state.isShuffle }));
    },

    toggleRepeat: () => {
      set((state) => {
        const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
        const nextModeIdx = (modes.indexOf(state.isRepeat) + 1) % modes.length;
        return { isRepeat: modes[nextModeIdx] };
      });
    },

    resetPlayer: () => {
      globalAudio.pause();
      globalAudio.src = '';
      set({
        isPlaying: false,
        currentSong: null,
        queue: [],
        currentIndex: -1,
        history: [],
        progress: 0,
        duration: 0,
      });
    },
  };
});
