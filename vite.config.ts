import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/demo-strata/' : '/',
  server: {
    port: 8085,
    strictPort: false,
  },
  resolve: {
    alias: {
      // strata-ds doesn't have a library build — resolve to source
      // directly so both dev and prod builds work.
      'strata-design-system': path.resolve(__dirname, 'packages/strata-ds/src/components/index.ts'),
    },
  },
  build: {
    // Disable sourcemaps en prod · ahorra ~40% memory durante el bundle
    // step (sourcemaps son los que más memoria consumen en transform de
    // archivos grandes). Tradeoff aceptable para demos · no necesitamos
    // sourcemaps en production.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Manual chunks · splittear libs pesadas para reducir el peak memory
        // del bundler. Cada chunk se procesa más pequeño · ayuda a evitar OOM
        // en containers con 2-core 8GB (Vercel default).
        manualChunks: {
          react: ['react', 'react-dom'],
          'lucide': ['lucide-react'],
          'recharts': ['recharts'],
          'framer': ['framer-motion'],
          'headless': ['@headlessui/react'],
          'heroicons': ['@heroicons/react/24/outline'],
        },
      },
    },
  },
})
