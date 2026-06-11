import apiClient from './client';
import type { Song } from '../../types';

export const getAllSongs = async (): Promise<Song[]> => {
  const response = await apiClient.get('/api/music');
  return response.data;
};

export const getSongById = async (id: string): Promise<Song> => {
  const response = await apiClient.get(`/api/music/${id}`);
  return response.data;
};

export const addSong = async (formData: FormData): Promise<Song> => {
  const response = await apiClient.post('/api/music/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateSong = async (id: string, formData: FormData): Promise<Song> => {
  const response = await apiClient.patch(`/api/music/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteSong = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/api/music/delete/${id}`);
  return response.data;
};
