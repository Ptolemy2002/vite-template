import { resolve, dirname } from 'path';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

const __dirname = dirname(".");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setupTests.ts',
    exclude: [
      ...configDefaults.exclude,
      ".tmplr-preview/**/*"
    ]
  },

  resolve: {
    alias: {
      "src": resolve(__dirname, 'src')
    }
  }
})
