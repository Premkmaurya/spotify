import { authApiClient } from './client';
import type { User } from '../../types';

export const registerUser = async (data: any): Promise<{ message: string }> => {
  const response = await authApiClient.post('/api/auth/register', data);
  return response.data;
};

export const loginUser = async (data: any): Promise<{ message: string }> => {
  const response = await authApiClient.post('/api/auth/login', data);
  return response.data;
};

export const logoutUser = async (): Promise<{ message: string }> => {
  const response = await authApiClient.post('/api/auth/logout');
  return response.data;
};

export const getMeUser = async (): Promise<{ user: User }> => {
  const response = await authApiClient.get('/api/auth/getMe');
  return response.data;
};
