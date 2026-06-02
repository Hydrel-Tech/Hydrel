/**
 * ProceduralSkyscraper.tsx
 * ════════════════════════
 * CSG-carved architectural tower that rotates with scroll offset.
 *
 * Technique layers:
 *   1. @react-three/csg — boolean subtractions for setback profile
 *   2. Window planes   — glowing meshes layered on tower faces
 *   3. maath easing    — physics-damped rotation for premium feel
 *   4. Scan line       — animated sweep (matches existing hero aesthetic)
 *   5. Ground rings    — depth markers
 *
 * Props:
 *   scrollOffsetRef — MutableRefObject<number> 0→1 driven by Hero scroll listener
 *
 * Performance:
 *   - CSG runs once on mount (not per frame)
 *   - Window meshes are static after mount
 *   - Only useFrame work: rotation damp + scan line + float
 */

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Geometry, Base, Subtraction } from '@react-three/csg'
import { easing } from 'maath'
import * as THREE from 'three'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProceduralSkyscraperProps {
  scrollOffsetRef: React.MutableRefObject<number>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WIN_COLS      = 3
const WIN_ROWS      = 15
const WIN_COLORS    = ['#00f5ff', '#6366f1', '#a5b4fc', '#4338ca', '#00f5ff']
const BAND_Y_POS    = [-2.2, 0.2, 2.0, 4.5]
const SCAN_SPEED    = 1.15
const FLOAT_SPEED   = 0.55
const FLOAT_AMP     = 0.07
const ROT_LAMBDA    = 0.32   // lower = slower/heavier damp feel
const ROT_SCALE     = Math.PI * 2.4  // full scroll → 2.4 rad rotation

// ─── Window data generation ───────────────────────────────────────────────────

interface WindowEntry {
  x: number
  y: number
  z: number
  rotY: number
  color: string
  intensity: number
}

function buildWindowData(): WindowEntry[] {
  const wins: WindowEntry[] = []

  for (let r = 0; r < WIN_ROWS; r++) {
    for (let c = 0; c < WIN_COLS; c++) {
      const x     = -0.52 + c * 0.52
      const y     = -4.0  + r * 0.55
      const color = WIN_COLORS[(r * WIN_COLS + c) % WIN_COLORS.length]
      const emit  = 0.45 + Math.sin((r + c) * 1.618 + 0.5) * 0.28

      // Front face
      wins.push({ x, y, z:  0.92, rotY: 0,       color, intensity: emit })
      // Back face
      wins.push({ x, y, z: -0.92, rotY: Math.PI,  color, intensity: emit })
    }
  }
  return wins
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Horizontal mechanical floor band */
const FloorBand: React.FC<{ y: number; accent?: boolean }> = ({ y, accent = false }) => (
  <mesh position={[0, y, 0]}>
    <boxGeometry args={[1.86, 0.08, 1.86]} />
    <meshStandardMaterial
      color={accent ? '#6366f1' : '#1a2a4a'}
      emissive={accent ? '#6366f1' : '#0d1828'}
      emissiveIntensity={accent ? 0.5 : 0.06}
      metalness={0.88}
      roughness={0.12}
    />
  </mesh>
)

/** Single glowing window pane */
const WindowPane: React.FC<WindowEntry> = ({ x, y, z, rotY, color, intensity }) => (
  <mesh position={[x, y, z]} rotation={[0, rotY, 0]}>
    <planeGeometry args={[0.21, 0.27]} />
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={intensity}
      transparent
      opacity={0.9}
    />
  </mesh>
)

// ─── Main component ───────────────────────────────────────────────────────────

export const ProceduralSkyscraper: React.FC<ProceduralSkyscraperProps> = ({
  scrollOffsetRef,
}) => {
  const groupRef  = useRef<THREE.Group>(null!)
  const scanRef   = useRef<THREE.Mesh>(null!)
  const scanDir   = useRef<number>(1)
  const clock     = useRef<number>(0)

  // Build window list once
  const windows = useMemo(() => buildWindowData(), [])

  // ── Per-frame: rotation + float + scan ──────────────────────────────────────
  useFrame((_, delta) => {
    if (!groupRef.current) return

    clock.current += delta

    // Scroll-driven Y rotation with physics damp (maath)
    const targetY = scrollOffsetRef.current * ROT_SCALE
    easing.dampE(groupRef.current.rotation, [0, targetY, 0], ROT_LAMBDA, delta)

    // Vertical sinusoidal float
    groupRef.current.position.y = Math.sin(clock.current * FLOAT_SPEED) * FLOAT_AMP

    // Scan line sweep
    if (scanRef.current) {
      scanRef.current.position.y += delta * SCAN_SPEED * scanDir.current
      if (scanRef.current.position.y >  4.8) scanDir.current = -1
      if (scanRef.current.position.y < -4.8) scanDir.current =  1
    }
  })

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <group ref={groupRef} scale={0.53} position={[0.4, 0, 0]}>

      {/* ══════════════════════════════════════════════════════ */}
      {/* TOWER BODY — CSG boolean carve                        */}
      {/* Setback strips reveal the mid-section inner structure */}
      {/* ══════════════════════════════════════════════════════ */}
      <mesh castShadow receiveShadow>
        <Geometry>
          {/* Primary mass */}
          <Base>
            <boxGeometry args={[1.8, 9.6, 1.8]} />
          </Base>

          {/* ── Upper-section setback strips ─────────────────── */}
          {/* Left vertical strip removed above mid-point */}
          <Subtraction position={[-0.79, 3.5, 0]}>
            <boxGeometry args={[0.24, 4.2, 1.86]} />
          </Subtraction>
          {/* Right vertical strip removed */}
          <Subtraction position={[0.79, 3.5, 0]}>
            <boxGeometry args={[0.24, 4.2, 1.86]} />
          </Subtraction>
          {/* Front vertical strip removed */}
          <Subtraction position={[0, 3.5, 0.79]}>
            <boxGeometry args={[1.86, 4.2, 0.24]} />
          </Subtraction>
          {/* Back vertical strip removed */}
          <Subtraction position={[0, 3.5, -0.79]}>
            <boxGeometry args={[1.86, 4.2, 0.24]} />
          </Subtraction>

          {/* ── Mid-level horizontal ledge notch ──────────────── */}
          <Subtraction position={[0, 0.14, 0.92]}>
            <boxGeometry args={[1.86, 0.06, 0.08]} />
          </Subtraction>
          <Subtraction position={[0, 0.14, -0.92]}>
            <boxGeometry args={[1.86, 0.06, 0.08]} />
          </Subtraction>
        </Geometry>
        <meshStandardMaterial
          color="#0d1422"
          roughness={0.68}
          metalness={0.32}
        />
      </mesh>

      {/* ══════════════════════════════════════════════════════ */}
      {/* UPPER SETBACK TOWER                                   */}
      {/* ══════════════════════════════════════════════════════ */}
      <mesh position={[0, 6.3, 0]} castShadow>
        <boxGeometry args={[1.32, 2.8, 1.32]} />
        <meshStandardMaterial
          color="#0b1120"
          roughness={0.65}
          metalness={0.35}
        />
      </mesh>
      {/* Upper section wireframe accent */}
      <mesh position={[0, 6.3, 0]}>
        <boxGeometry args={[1.34, 2.82, 1.34]} />
        <meshBasicMaterial color="#00f5ff" wireframe transparent opacity={0.11} />
      </mesh>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ARCHITECTURAL DETAIL: floor bands                     */}
      {/* ══════════════════════════════════════════════════════ */}
      {BAND_Y_POS.map((y, i) => (
        <FloorBand key={`band-${i}`} y={y} accent={i === 2} />
      ))}

      {/* ══════════════════════════════════════════════════════ */}
      {/* WIREFRAME OVERLAYS                                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <mesh>
        <boxGeometry args={[1.82, 9.62, 1.82]} />
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.08} />
      </mesh>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SPIRE ASSEMBLY                                         */}
      {/* ══════════════════════════════════════════════════════ */}
      {/* Platform cap */}
      <mesh position={[0, 7.74, 0]}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color="#192038" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Tapered shaft */}
      <mesh position={[0, 8.84, 0]}>
        <cylinderGeometry args={[0.016, 0.095, 2.2, 6]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.8}
          metalness={0.95}
          roughness={0.04}
        />
      </mesh>
      {/* Glow tip */}
      <mesh position={[0, 9.98, 0]}>
        <sphereGeometry args={[0.062, 8, 8]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={3.8}
        />
      </mesh>

      {/* ══════════════════════════════════════════════════════ */}
      {/* WINDOW GRID                                            */}
      {/* ══════════════════════════════════════════════════════ */}
      {windows.map((w, i) => (
        <WindowPane key={`w-${i}`} {...w} />
      ))}

      {/* ══════════════════════════════════════════════════════ */}
      {/* SCAN LINE                                              */}
      {/* ══════════════════════════════════════════════════════ */}
      <mesh ref={scanRef} position={[0, -4.8, 0]}>
        <planeGeometry args={[3.8, 0.022]} />
        <meshBasicMaterial
          color="#00f5ff"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ══════════════════════════════════════════════════════ */}
      {/* GROUND RINGS                                           */}
      {/* ══════════════════════════════════════════════════════ */}
      <mesh position={[0, -4.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2.7, 64]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -4.90, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 1.62, 64]} />
        <meshBasicMaterial
          color="#00f5ff"
          transparent
          opacity={0.09}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

    </group>
  )
}

export default ProceduralSkyscraper
