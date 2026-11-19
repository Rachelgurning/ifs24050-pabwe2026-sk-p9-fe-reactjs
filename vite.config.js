import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const proxy = { '/api': { target: 'http://localhost:8081', changeOrigin: true } }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174, proxy },
  preview: { port: 5174, proxy },
  build: { target: 'es2020', chunkSizeWarningLimit: 1500 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
})
