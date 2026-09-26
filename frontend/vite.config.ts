import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Anchored to paths *under* /api/ so the backend routes (/api/health, /api/ai/search)
      // are forwarded while the plain frontend route `/api` (the Developer Portal page) is
      // still served by React Router. A bare '/api' key would match both and the portal
      // would answer "Cannot GET /api" from Express.
      '^/api/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})

