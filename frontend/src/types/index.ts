export type UserRole = 'artist' | 'listener';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Song {
  _id: string;
  title: string;
  artist: string;
  artistId: string;
  musicId: string;
  coverId: string;
  musicUrl: string;
  coverUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  _id: string;
  name: string;
  artist: string;
  musics: Song[];
  artistId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentSong: Song | null;
  progress: number; // in seconds
  duration: number; // in seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: 'none' | 'all' | 'one';
}
