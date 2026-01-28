import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/main': path.resolve(__dirname, './src/main'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/database': path.resolve(__dirname, './src/database'),
      '@/services': path.resolve(__dirname, './src/services'),
    },
  },
});
