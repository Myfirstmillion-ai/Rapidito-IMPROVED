import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Optimized Vite configuration for better bundle splitting and performance
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Use terser for better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Chunk splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate heavy dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-maps': ['mapbox-gl'],
          'vendor-animation': ['framer-motion'],
          'vendor-socket': ['socket.io-client'],
          'vendor-utils': ['axios', 'lodash.debounce'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 400,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
