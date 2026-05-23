import React, { Suspense, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────
// 3D SCENE COMPONENTS
// ─────────────────────────────────────────

/** Blueprint scan line that sweeps vertically through the house */
const ScanLine: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  const dir = useRef(1);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    ref.current.position.y += delta * 1.1 * dir.current;
    if (ref.current.position.y > 2.8) dir.current = -1;
    if (ref.current.position.y < -1.2) dir.current = 1;
  });

  return (
    <mesh ref={ref} position={[0, -1.2, 0]}>
      <planeGeometry args={[5, 0.03]} />
      <meshBasicMaterial
        color="#00f5ff"
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

/** Pulsing ground ring that glows under the house */
const GroundRing: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.15 + 0.12 * Math.sin(state.clock.elapsedTime * 1.8);
  });

  return (
    <mesh ref={ref} position={[0, -0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.4, 2.0, 64]} />
      <meshBasicMaterial
        color="#6366f1"
        transparent
        opacity={0.2}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

/** Floating ambient particles around the house */
const Particles: React.FC = () => {
  const COUNT = 28;
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 7;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a5b4fc"
        size={0.04}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

/** Main house geometry — solid dark + holographic wireframe overlay */
const House: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.28;
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>

      {/* ── WALLS (solid) ── */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.6, 2]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.75}
          metalness={0.15}
        />
      </mesh>
      {/* Wireframe overlay on walls */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.01, 1.61, 2.01]} />
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.22} />
      </mesh>

      {/* ── ROOF (solid) ── */}
      <mesh castShadow position={[0, 1.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.52, 1.05, 4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Wireframe overlay on roof */}
      <mesh position={[0, 1.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.54, 1.07, 4]} />
        <meshBasicMaterial color="#00f5ff" wireframe transparent opacity={0.28} />
      </mesh>

      {/* ── CHIMNEY ── */}
      <mesh castShadow position={[0.52, 1.65, -0.35]}>
        <boxGeometry args={[0.28, 0.55, 0.28]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0.52, 1.65, -0.35]}>
        <boxGeometry args={[0.30, 0.57, 0.30]} />
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.3} />
      </mesh>

      {/* ── LEFT WINDOW (glowing) ── */}
      <mesh position={[-0.52, 0.12, 1.02]}>
        <boxGeometry args={[0.42, 0.36, 0.05]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>

      {/* ── RIGHT WINDOW (glowing) ── */}
      <mesh position={[0.52, 0.12, 1.02]}>
        <boxGeometry args={[0.42, 0.36, 0.05]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>

      {/* ── DOOR ── */}
      <mesh position={[0, -0.35, 1.02]}>
        <boxGeometry args={[0.32, 0.62, 0.05]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* ── DOOR HANDLE (tiny accent) ── */}
      <mesh position={[0.11, -0.35, 1.06]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color="#a5b4fc"
          emissive="#6366f1"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* ── SCAN LINE ── */}
      <ScanLine />

      {/* ── GROUND RING ── */}
      <GroundRing />
    </group>
  );
};

/** Full scene with lighting */
const HouseScene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.25} />
      {/* Indigo key light */}
      <pointLight position={[5, 6, 4]} intensity={1.4} color="#6366f1" />
      {/* Cyan fill light */}
      <pointLight position={[-4, 2, -4]} intensity={0.7} color="#00f5ff" />
      {/* Warm bottom bounce */}
      <pointLight position={[0, -3, 2]} intensity={0.25} color="#e0e7ff" />
      <Particles />
      <House />
    </>
  );
};

// ─────────────────────────────────────────
// FRAMER MOTION VARIANTS
// ─────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─────────────────────────────────────────
// HERO COMPONENT
// ─────────────────────────────────────────

export const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-transparent">

      {/* ── Stripe-style gradient background (unchanged) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-[120%] bg-white/10 dark:bg-slate-900/40 skew-y-[-6deg] origin-top-left transform -translate-y-20 transition-colors duration-300"
        >
          <div
            className="absolute inset-0 w-full h-full opacity-30 dark:opacity-50"
            style={{
              backgroundImage: `
                radial-gradient(at 77% 12%, hsla(245, 68%, 78%, 0.4) 0px, transparent 50%),
                radial-gradient(at 0% 12%, hsla(180, 77%, 78%, 0.4) 0px, transparent 50%),
                radial-gradient(at 90% 90%, hsla(333, 64%, 81%, 0.4) 0px, transparent 50%),
                radial-gradient(at 12% 84%, hsla(208, 62%, 84%, 0.4) 0px, transparent 50%)
              `,
            }}
          />
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 pt-20 w-full">

        {/* LEFT — animated text content */}
        <motion.div
          className="max-w-2xl pt-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/20 backdrop-blur-sm mb-8 transition-colors duration-300">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-base font-semibold text-white tracking-widest uppercase [-webkit-text-stroke:1px_white]">
                System Intelligence v3.0
              </span>
            </div>
          </motion.div>

          {/* Headline — entrance + gentle float */}
          <motion.div variants={itemVariants}>
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight text-balance transition-colors duration-300"
              animate={{ y: [-5, 5, -5] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              Infrastructure for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">
                Decision Excellence
              </span>
            </motion.h1>
          </motion.div>

          {/* Sub-text */}
          <motion.p
            variants={itemVariants}
            className="text-2xl md:text-3xl text-white mb-10 leading-relaxed max-w-xl [-webkit-text-stroke:1px_white]"
          >
            Hydrel builds high-fidelity data pipelines and execution systems
            that transform complex market variables into clear institutional
            outcomes.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <button
              onClick={() => scrollToSection('architectures')}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Explore the Systems
            </button>
            <button
              onClick={() => scrollToSection('featured')}
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              View Active Architectures
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT — 3D holographic house */}
        <div className="hidden lg:block relative h-full min-h-[500px]">

          {/* Ambient glow blobs behind canvas */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/08 rounded-full blur-2xl pointer-events-none" />

          {/* R3F Canvas */}
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <Canvas
              camera={{ position: [4, 3, 5], fov: 38 }}
              style={{ background: 'transparent', width: '100%', height: '100%' }}
              gl={{ alpha: true, antialias: true }}
            >
              <HouseScene />
            </Canvas>
          </Suspense>

          {/* HUD overlay — decorative readouts */}
          <div className="absolute bottom-10 left-6 pointer-events-none space-y-1">
            <p className="text-[10px] font-mono text-indigo-400/50 tracking-widest uppercase">
              SYS // HYDREL-MK1
            </p>
            <p className="text-[10px] font-mono text-cyan-400/45 tracking-widest uppercase">
              SCAN // ACTIVE
            </p>
            <p className="text-[10px] font-mono text-slate-400/40 tracking-widest uppercase">
              NODE // ONLINE
            </p>
          </div>

          {/* Corner bracket decorations */}
          <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-indigo-400/25 pointer-events-none" />
          <div className="absolute top-8 left-6 w-8 h-8 border-t-2 border-l-2 border-indigo-400/25 pointer-events-none" />
          <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-indigo-400/25 pointer-events-none" />
          <div className="absolute bottom-8 left-6 w-8 h-8 border-b-2 border-l-2 border-indigo-400/25 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
