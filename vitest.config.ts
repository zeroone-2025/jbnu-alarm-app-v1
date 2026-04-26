import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.ts', 'app/**/*.test.tsx'],
    exclude: ['e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['app/_lib/**', 'app/_components/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
      '@/_lib': path.resolve(__dirname, './app/_lib'),
      '@/_types': path.resolve(__dirname, './app/_types'),
      '@/_components': path.resolve(__dirname, './app/_components'),
    },
  },
})
