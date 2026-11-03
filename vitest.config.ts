import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), nodePolyfills()],
  optimizeDeps: {
    // Keep background dependency discovery out of timed browser benchmarks.
    noDiscovery: true,
    include: [
      'vite-plugin-node-polyfills/shims/buffer',
      'vite-plugin-node-polyfills/shims/global',
      'vite-plugin-node-polyfills/shims/process',
      'react',
      'react/jsx-dev-runtime',
      'react-dom/client',
      'bezier-easing',
      'color-convert',
      'get-pixels',
      'gifuct-js',
      'remeda',
      'seedrandom',
      'mobile-detect',
      // Effect metadata imports parameter editors; prebundle their CJS dependencies.
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'react-best-gradient-color-picker',
    ],
  },
  test: {
    include: ['tests/{domain-utils,effects}/**/*.test.{ts,tsx}'],
    fileParallelism: false,
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [{ browser: 'chromium' }],
      screenshotFailures: false,
    },
    benchmark: {
      include: ['tests/{domain-utils,effects}/**/*.bench.ts'],
    },
  },
});
