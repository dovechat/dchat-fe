import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['lk.127.0.0.1.nip.io'],
    watch: {
      usePolling: true
    }
  }
})