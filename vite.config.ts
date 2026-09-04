import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  // Allow importing .glsl files as raw strings (for future shader files)
  assetsInclude: ['**/*.glsl'],
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: false,
  },
});
