import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/v1/analysis': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/api/v1/courses': {
        target: 'http://localhost:8001',
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
