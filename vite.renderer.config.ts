import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/renderer': path.resolve(__dirname, './src/renderer/src'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
  base: './',
  build: {
    outDir: '.vite/renderer/main_window',
    rollupOptions: {
      input: path.resolve(__dirname, 'src/renderer/index.html'),
    },
  },
});
