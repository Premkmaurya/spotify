import axios from 'axios';

const AUTH_TOKEN_KEY = 'spotify_token';

const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY) || null;

const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
};

export const authApiClient = createApiClient(import.meta.env.VITE_AUTH_BACKEND_URL || '');
export const musicApiClient = createApiClient(import.meta.env.VITE_MUSIC_BACKEND_URL || '');

export const getAuthToken = getToken;

