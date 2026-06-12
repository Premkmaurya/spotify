import axios from 'axios';

export const authApiClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BACKEND_URL || '',
  withCredentials: true, // Crucial for cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

export const musicApiClient = axios.create({
  baseURL: import.meta.env.VITE_MUSIC_BACKEND_URL || '',
  withCredentials: true, // Crucial for cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

