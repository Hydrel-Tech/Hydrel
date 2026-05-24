/**
 * EngineViewer.tsx
 * ────────────────
 * Option C — an R3F canvas that renders a unique spinning 3D object
 * for the currently selected engine mode (Buying / Listing / Investor / Flipper).
 *
 * Sits ABOVE the engine flip-cards in the desktop left column.
 * Each engine has its own geometry + metallic material color so the
 * change in mode is visually unmistakable even before the card flips.
 *
 * Performance notes:
 * - antialias: true — canvas is small (~160px tall), cost is negligible
 * - powerPreference: 'high-performance' — this is a hero element; quality matters
 * - dpr capped at 2
 *
 * Usage:
 *   const EngineViewer = lazy(() => import('./EngineViewer'));
 *   <Suspense fallback={<EngineFallback />}>
 *     <EngineViewer mode={agentMode} isDark={isDarkMode} />
 *   </Suspense>
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EngineMode = 'buying' | 'listing' | 'investor' | 'flipper';

interface EngineConfig {
  color: string;
  emissive: string;
  lightColor: string;
  label: string;
}

// ─── Per-engine visual identity ───────────────────────────────────────────────

const ENGINE_CONFIG: Record<EngineMode, EngineConfig> = {
  buying: {
    color:      '#6366f1', // indigo
    emissive:   '#3730a3',
    lightColor: '#a5b4fc',
    label:      'Buying Agent',
  },
  listing: {
    color:      '#f97316', // orange
    emissive:   '#c2410c',
    lightColor: '#fed7aa',
    label:      'Listing Agent',
  },
  investor: {
    color:      '#10b981', // emerald
    emissive:   '#065f46',
    lightColor: '#6ee7b7',
    label:      'Investor',
  },
  flipper: {
    color:      '#f59e0b', // amber
    emissive:   '#92400e',
    lightColor: '#fde68a',
    label:      'Flipper',
  },
};

// ─── Geometry mapped to each mode ─────────────────────────────────────────────
//   buying   → cube     (structure, home)
//   listing  → cone     (person / pointer)
//   investor → torus    (cycle, returns)
//   flipper  → octahedron (energy, edge)

const EngineGeometry: React.FC<{ mode: EngineMode }> = ({ mode }) => {
  switch (mode) {
    case 'buying':
      return <boxGeometry args={[1.15, 1.15, 1.15]} />;
    case 'listing':
      return <coneGeometry args={[0.78, 1.65, 6, 1]} />;
    case 'investor':
      return <torusGeometry args={[0.78, 0.28, 20, 80]} />;
    case 'flipper':
      return <octahedronGeometry args={[1.05, 0]} />;
  }
};

// ─── Animated mesh ────────────────────────────────────────────────────────────

const ActiveShape: React.FC<{ mode: EngineMode }> = ({ mode }) => {
  const meshRef  = useRef<THREE.Mesh>(null!);
  const { color, emissive } = ENGINE_CONFIG[mode];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.rotation.y = t * 0.88;
    meshRef.current.rotation.x = Math.sin(t * 0.48) * 0.18;
    meshRef.current.position.y = Math.sin(t * 1.05) * 0.10;
  });

  return (
    <mesh ref={meshRef}>
      <EngineGeometry mode={mode} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.45}
        roughness={0.12}
        metalness={0.88}
      />
    </mesh>
  );
};

// ─── Public component ─────────────────────────────────────────────────────────

interface EngineViewerProps {
  mode: EngineMode;
}

const EngineViewer: React.FC<EngineViewerProps> = ({ mode }) => {
  const { lightColor } = ENGINE_CONFIG[mode];

  return (
    <Canvas
      camera={{ position: [0, 0, 3.6], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{ height: '160px', width: '100%' }}
    >
      <ambientLight intensity={0.35} />
      {/* Key light — white, elevated */}
      <pointLight position={[3, 3, 3]} intensity={2.2} color="#ffffff" />
      {/* Fill light — engine brand colour */}
      <pointLight position={[-3, -2, 1]} intensity={0.8} color={lightColor} />
      {/* Rim light — adds depth */}
      <pointLight position={[0, -4, -2]} intensity={0.3} color={lightColor} />

      <ActiveShape mode={mode} />
    </Canvas>
  );
};

export default EngineViewer;
