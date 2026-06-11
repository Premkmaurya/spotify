import apiClient from './client';
import type { Playlist } from '../../types';

export const createPlaylist = async (data: {
  name: string;
  artist: string;
  musics: string[]; // array of song IDs
}): Promise<Playlist> => {
  const response = await apiClient.post('/api/playlist/create', data);
  return response.data;
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  const response = await apiClient.get('/api/playlist');
  return response.data;
};

export const getPlaylist = async (id: string): Promise<Playlist> => {
  const response = await apiClient.get(`/api/playlist/${id}`);
  return response.data;
};
