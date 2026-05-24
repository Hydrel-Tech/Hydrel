/**
 * R3FBackground.tsx
 * ─────────────────
 * Decorative WebGL background layer.
 * - Fixed, full-screen, z-0, pointer-events-none (NEVER blocks DOM interaction)
 * - Lazy-loadable: import lazily in the parent + wrap in <Suspense fallback={null}>
 * - DPR capped at 1.5 and powerPreference: 'low-power' to stay performant
 * - Alpha canvas so the gradient behind it bleeds through
 *
 * Usage:
 *   const R3FBackground = lazy(() => import('./R3FBackground'));
 *   <Suspense fallback={null}><R3FBackground /></Suspense>
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Shape config ─────────────────────────────────────────────────────────────

interface ShapeProps {
  position: [number, number, number];
  geometry: 'ico' | 'oct' | 'box' | 'torus';
  speed: number;
  phase: number;
  scale: number;
  color: string;
  wireframe?: boolean;
  opacity?: number;
}

const FloatingShape: React.FC<ShapeProps> = ({
  position, geometry, speed, phase, scale, color,
  wireframe = false, opacity = 0.15,
}) => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    // Gentle sinusoidal drift — no mouse parallax to avoid jitter at low dpr
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.38;
    ref.current.position.x = position[0] + Math.cos(t * speed * 0.55 + phase) * 0.14;
    ref.current.rotation.x = t * 0.065 * speed;
    ref.current.rotation.y = t * 0.10 * speed;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      {geometry === 'ico'   && <icosahedronGeometry args={[1, 0]} />}
      {geometry === 'oct'   && <octahedronGeometry args={[1, 0]} />}
      {geometry === 'box'   && <boxGeometry args={[1, 1, 1]} />}
      {geometry === 'torus' && <torusGeometry args={[0.7, 0.25, 8, 24]} />}
      <meshStandardMaterial
        color={color}
        wireframe={wireframe}
        transparent
        opacity={wireframe ? opacity * 1.6 : opacity * 0.55}
        roughness={0.6}
        metalness={0.4}
      />
    </mesh>
  );
};

// ─── Scene composition ────────────────────────────────────────────────────────

const Scene: React.FC = () => (
  <>
    {/* Ambient + coloured point lights matching brand palette */}
    <ambientLight intensity={0.45} />
    <pointLight position={[6,  4,  3]} intensity={1.1} color="#6366f1" />  {/* indigo */}
    <pointLight position={[-5, -4, 2]} intensity={0.55} color="#f97316" />  {/* orange */}
    <pointLight position={[0,   6, -5]} intensity={0.35} color="#8b5cf6" /> {/* violet */}

    {/* Left cluster — indigo wireframe icosahedra */}
    <FloatingShape position={[-6.2,  1.5, -8]}  geometry="ico"   speed={0.32} phase={0}   scale={2.2} color="#6366f1" wireframe opacity={0.28} />
    <FloatingShape position={[-3.5, -3.0, -6]}  geometry="oct"   speed={0.29} phase={1.1} scale={1.2} color="#f97316" wireframe opacity={0.22} />
    <FloatingShape position={[-7.8,  0.5, -11]} geometry="torus" speed={0.21} phase={5.5} scale={2.1} color="#8b5cf6" opacity={0.10} />

    {/* Right cluster — orange solid shapes */}
    <FloatingShape position={[ 7.2, -1.0, -10]} geometry="oct"   speed={0.26} phase={2.1} scale={3.0} color="#f97316" opacity={0.10} />
    <FloatingShape position={[ 5.0,  3.0, -8]}  geometry="box"   speed={0.39} phase={3.3} scale={0.9} color="#8b5cf6" wireframe opacity={0.18} />
    <FloatingShape position={[ 4.5, -3.5, -7]}  geometry="ico"   speed={0.34} phase={6.0} scale={1.0} color="#6366f1" opacity={0.08} />

    {/* Centre-deep accent */}
    <FloatingShape position={[ 2.5,  4.0, -12]} geometry="ico"   speed={0.43} phase={4.2} scale={1.5} color="#6366f1" opacity={0.09} />
    <FloatingShape position={[ 0.0, -4.0, -9]}  geometry="ico"   speed={0.36} phase={0.8} scale={1.8} color="#6366f1" opacity={0.07} />
  </>
);

// ─── Public export ────────────────────────────────────────────────────────────

const R3FBackground: React.FC = () => (
  <div
    className="fixed inset-0 z-0 pointer-events-none"
    aria-hidden="true"
  >
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55 }}
      gl={{
        alpha: true,
        antialias: false,          // off for perf — shapes are abstract, no need
        powerPreference: 'low-power',
      }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]}
    >
      <Scene />
    </Canvas>
  </div>
);

export default R3FBackground;
