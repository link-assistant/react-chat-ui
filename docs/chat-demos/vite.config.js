import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const demoRoot = fileURLToPath(new URL('.', import.meta.url));
const profilesDir = path.resolve(demoRoot, 'profiles');

function collectProfileInputs() {
  if (!existsSync(profilesDir)) {
    return {};
  }

  const entries = {};
  for (const file of readdirSync(profilesDir)) {
    if (file.endsWith('.html')) {
      const name = file.slice(0, -5);
      entries[`profiles/${name}`] = path.resolve(profilesDir, file);
    }
  }

  return entries;
}

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
    rollupOptions: {
      input: {
        main: path.resolve(demoRoot, 'index.html'),
        ...collectProfileInputs(),
      },
    },
  },
});
