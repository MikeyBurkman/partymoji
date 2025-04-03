import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), nodePolyfills(), wasm()],
  worker: {
    plugins: () => [tsconfigPaths(), nodePolyfills(), wasm()],
  },
});
