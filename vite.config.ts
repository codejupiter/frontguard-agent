import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FrontGuard',
      formats: ['es', 'iife'],
      fileName: (format) => `frontguard.${format}.js`,
    },
    rollupOptions: {
      output: {
        // No external deps — bundle everything
      },
    },
    minify: 'terser',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});