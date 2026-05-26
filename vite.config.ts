import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "plotly.js-dist-min": path.resolve(__dirname, "./src/shims/plotly.ts"),
      "tesseract.js": path.resolve(__dirname, "./src/shims/tesseract.ts"),
      "@tensorflow/tfjs": path.resolve(__dirname, "./src/shims/tfjs.ts"),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1800
  }
})
