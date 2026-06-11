import axios from 'axios';

const apiClient = axios.create({
  baseURL: '', // Uses relative paths, letting Vite proxy handles the routing
  withCredentials: true, // Crucial for cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
