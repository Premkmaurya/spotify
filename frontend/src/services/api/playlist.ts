import { musicApiClient } from './client';
import type { Playlist } from '../../types';

export const createPlaylist = async (data: {
  name: string;
  artist: string;
  musics: string[]; // array of song IDs
}): Promise<Playlist> => {
  const response = await musicApiClient.post('/api/playlist/create', data);
  return response.data;
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  const response = await musicApiClient.get('/api/playlist');
  return response.data;
};

export const getPlaylist = async (id: string): Promise<Playlist> => {
  const response = await musicApiClient.get(`/api/playlist/${id}`);
  return response.data;
};

export const deletePlaylist = async (id: string): Promise<{ message: string }> => {
  const response = await musicApiClient.delete(`/api/playlist/delete/${id}`);
  return response.data;
};
