import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main/index.ts',
      formats: ['cjs'],
    },
    outDir: '.vite/build',
    rollupOptions: {
      external: ['better-sqlite3', 'electron'],
      output: {
        entryFileNames: 'index.js',
      },
    },
    commonjsOptions: {
      dynamicRequireTargets: ['**/better_sqlite3.node'],
      ignoreDynamicRequires: true,
    },
  },
  resolve: {
    alias: {
      '@/main': path.resolve(__dirname, './src/main'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/database': path.resolve(__dirname, './src/database'),
      '@/services': path.resolve(__dirname, './src/services'),
    },
  },
});
