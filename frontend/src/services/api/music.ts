import { musicApiClient } from './client';
import type { Song } from '../../types';

// Simple in-memory cache for songs to speed up real-time synchronization
const songCache = new Map<string, Song>();

export const getAllSongs = async (): Promise<Song[]> => {
  const response = await musicApiClient.get('/api/music');
  const songs = response.data;
  // Seed the cache with all fetched songs
  songs.forEach((song: Song) => {
    songCache.set(song._id, song);
  });
  return songs;
};

export const getSongById = async (id: string): Promise<Song> => {
  if (songCache.has(id)) {
    return songCache.get(id)!;
  }
  const response = await musicApiClient.get(`/api/music/${id}`);
  const song = response.data;
  songCache.set(id, song);
  return song;
};

export const addSong = async (formData: FormData): Promise<Song> => {
  const response = await musicApiClient.post('/api/music/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const song = response.data;
  songCache.set(song._id, song);
  return song;
};

export const updateSong = async (id: string, formData: FormData): Promise<Song> => {
  const response = await musicApiClient.patch(`/api/music/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const updatedSong = response.data;
  songCache.set(id, updatedSong);
  return updatedSong;
};

export const deleteSong = async (id: string): Promise<{ message: string }> => {
  const response = await musicApiClient.delete(`/api/music/delete/${id}`);
  songCache.delete(id);
  return response.data;
};
