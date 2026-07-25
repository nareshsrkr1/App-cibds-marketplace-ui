import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Production / `npm start`: serve compiled JS only — no .tsx in DevTools.
    sourcemap: false,
    // Default is 500kB; browser-*.js (the MSW mock worker, mock-mode only —
    // never loaded once a resource flips to a real backend) sits at ~493kB and
    // would trip the warning as the app keeps growing. This only silences the
    // warning — it doesn't change what gets shipped or how chunks are split.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
} as import('vite').UserConfig);
