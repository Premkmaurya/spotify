import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Enable environment variables with these prefixes
  // VITE_* - standard Vite variables
  // AUTH_* - auth service variables (legacy support)
  // MUSIC_* - music service variables (legacy support)
  envPrefix: ['VITE_', 'AUTH_', 'MUSIC_'],
  
  server: {
    proxy: {
      // Development proxy - ONLY works during `npm run dev`
      // NOT available in production builds
      
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
      // WebSocket proxy for Socket.IO
      // In production, Socket.IO needs explicit URL via VITE_MUSIC_BACKEND_URL
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  
  define: {
    // Optional: Define build-time constants if needed
    // __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
