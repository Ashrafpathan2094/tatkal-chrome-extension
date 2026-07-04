import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    // crx needs a fixed port so the extension knows where to reach the HMR server
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
})
