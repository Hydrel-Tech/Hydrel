/**
 * vite.config.ts — Hydrel 3D stack (updated for CSG + maath)
 * ────────────────────────────────────────────────────────────
 * Changes vs previous config:
 *   • Added @react-three/csg + maath to optimizeDeps.include
 *   • Added maath to vendor-3d manual chunk
 *   • Raised chunkSizeWarningLimit to 1100 (CSG adds ~180kb)
 *   • All existing THREE dedupe + alias preserved verbatim
 */

import { defineConfig } from 'vite'
import react             from '@vitejs/plugin-react'
import path              from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    dedupe: ['three', '@react-three/fiber', '@react-three/drei'],
  },

  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/csg',   // ← NEW
      'maath',               // ← NEW
      'maath/easing',        // ← NEW (named sub-path)
      'framer-motion',
    ],
    exclude: ['@splinetool/runtime'],
  },

  assetsInclude: [
    '**/*.gltf',
    '**/*.glb',
    '**/*.hdr',
    '**/*.splinecode',
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-3d': [
            'three',
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/csg',  // ← NEW
            'maath',              // ← NEW
          ],
          'vendor-motion': ['framer-motion'],
          'vendor-react':  ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1100, // raised from 900 — CSG adds ~180kb
  },

  server: {
    warmup: {
      clientFiles: [
        './components/R3FBackground.tsx',
        './components/EngineViewer.tsx',
        './components/ProceduralSkyscraper.tsx', // ← NEW
      ],
    },
  },
})
