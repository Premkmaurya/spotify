import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_', 'AUTH_', 'MUSIC_'],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/api/music': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/api/playlist': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
