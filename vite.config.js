import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:7000',
        changeOrigin: true,
      },
      '/api/v1/analysis': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/api/v1/courses': {
        target: 'http://localhost:7001',
        changeOrigin: true,
      },
      '/api/v1/roadmaps': {
        target: 'http://localhost:7001',
        changeOrigin: true,
      },
      '/api/v1/enrollments': {
        target: 'http://localhost:7001',
        changeOrigin: true,
      },
      '/api/v1/sections': {
        target: 'http://localhost:7001',
        changeOrigin: true,
      },
      '/api/v1/lessons': {
        target: 'http://localhost:7001',
        changeOrigin: true,
      },
      '/api/v1/levels': {
        target: 'http://localhost:7001',
        changeOrigin: true,
      },
      '/api/v1/leaderboard': {
        target: 'http://localhost:7001',
        changeOrigin: true,
      },
      '/api/v1/streak': {
        target: 'http://localhost:7001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:4000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
