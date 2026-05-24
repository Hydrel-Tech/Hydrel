/**
 * vite.config.ts — Hydrel 3D stack patch
 * ────────────────────────────────────────
 * Drop this in your project root, merging with your existing config.
 *
 * Key additions vs a stock Vite + React config:
 *   1.  optimizeDeps.include  — pre-bundle heavy R3F deps so they never
 *       re-bundle at runtime and cause frame drops on first load.
 *   2.  resolve.dedupe        — THREE must be a singleton. Multiple copies
 *       of three.js in the module graph = broken WebGL contexts.
 *   3.  assetsInclude         — lets Vite treat .gltf / .glb / .splinecode
 *       as static assets (served as-is, not transformed).
 *   4.  build.rollupOptions   — manual chunk split puts three + r3f into
 *       their own bundle so the main chunk stays fast to parse.
 */

import { defineConfig } from 'vite';
import react             from '@vitejs/plugin-react';
import path              from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // If you use Draco decoder from a CDN, alias it here so you can swap
      // the URL in one place rather than hunting across components.
      // '@draco': 'https://www.gstatic.com/draco/versioned/decoders/1.5.7',
    },

    // ⚠️  CRITICAL: three.js MUST resolve to exactly one copy.
    //     Without this, @react-three/fiber and @splinetool/react-spline
    //     can each pull in their own three.js, causing silent WebGL errors.
    dedupe: ['three', '@react-three/fiber', '@react-three/drei'],
  },

  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'framer-motion',
      // Add '@splinetool/react-spline' here if/when you add Spline scenes
    ],
    // Exclude Spline's own worker from pre-bundling (it self-manages its worker)
    exclude: ['@splinetool/runtime'],
  },

  assetsInclude: [
    '**/*.gltf',
    '**/*.glb',
    '**/*.hdr',
    '**/*.splinecode', // Spline scene files if you self-host them
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Isolate the entire 3D runtime into its own lazy chunk.
          // React will load this only when the Suspense boundary resolves.
          'vendor-3d': [
            'three',
            '@react-three/fiber',
            '@react-three/drei',
          ],
          'vendor-motion': ['framer-motion'],
          'vendor-react':  ['react', 'react-dom'],
        },
      },
    },

    // Raise the warning threshold slightly — three.js chunks are legitimately large.
    // The manual split above means users only download the 3D chunk when R3F mounts.
    chunkSizeWarningLimit: 900, // kB
  },

  server: {
    // Hot-module reload stays snappy even with large 3D deps pre-cached
    warmup: {
      clientFiles: [
        './src/components/R3FBackground.tsx',
        './src/components/EngineViewer.tsx',
      ],
    },
  },
});
