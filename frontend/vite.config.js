import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  },
  // Добавь для Docker сборки
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // Прокси API запросов в dev режиме
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})