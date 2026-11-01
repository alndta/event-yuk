import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '../',
  build: {
    rollupOptions: {
      output: {
        // Libraries change rarely; keeping them in their own files lets browsers cache them across deploys.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('gsap') || id.includes('lenis')) return 'vendor-motion';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'vendor-react';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/api-docs': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/docs': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
});
