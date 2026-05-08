import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const demoRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  root: demoRoot,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  build: {
    outDir: path.resolve(demoRoot, '../../dist/chat-demos'),
    emptyOutDir: true,
  },
});
