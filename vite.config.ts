import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { comlink } from 'vite-plugin-comlink';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    comlink(),
    react(),
    nodePolyfills(),
    wasm(),
    topLevelAwait(),
  ],
  worker: {
    format: 'es',
    plugins: () => [
      tsconfigPaths(),
      comlink(),
      nodePolyfills(),
      wasm(),
      topLevelAwait(),
    ],
  },
  base: '/partymoji',
});
