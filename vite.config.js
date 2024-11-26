import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/hr': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/financial': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/notifications': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/integrated': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/logistics': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/production': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    }
  },
})