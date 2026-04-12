import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('@tanstack/react-router')) {
            return 'tanstack-router'
          }

          if (id.includes('@tanstack/react-query') || id.includes('@tanstack/query-core')) {
            return 'tanstack-query'
          }

          if (id.includes('@tanstack/react-table') || id.includes('@tanstack/table-core')) {
            return 'tanstack-table'
          }

          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
            return 'forms'
          }

          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n'
          }

          if (id.includes('react-icons')) {
            return 'icons'
          }

          if (id.includes('zustand')) {
            return 'zustand'
          }

          if (id.includes('react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
})
