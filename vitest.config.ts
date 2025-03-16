/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    reporters: ['json', 'verbose', 'vitest-sonar-reporter'],
    outputFile: {
      json: 'test-results.json',
      'vitest-sonar-reporter': 'sonar-report.xml',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
      ],
    },
  },
})
