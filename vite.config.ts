import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare({
      // Enable development server integration
      dev: true,
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: true, // Enable mobile preview
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
