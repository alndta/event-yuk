import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '../',
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
