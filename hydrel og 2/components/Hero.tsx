import React, { Suspense, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── 3D SCENE ───────────────────────────────────────────────

const ScanLine: React.FC = () => {
  const ref  = useRef<THREE.Mesh>(null);
  const dir  = useRef(1);
  useFrame((_s, dt) => {
    if (!ref.current) return;
    ref.current.position.y += dt * 1.1 * dir.current;
    if (ref.current.position.y >  2.8) dir.current = -1;
    if (ref.current.position.y < -1.2) dir.current =  1;
  });
  return (
    <mesh ref={ref} position={[0, -1.2, 0]}>
      <planeGeometry args={[5, 0.03]} />
      <meshBasicMaterial color="#00f5ff" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

const GroundRing: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    (ref.current.material as THREE.MeshBasicMaterial).opacity =
      0.15 + 0.12 * Math.sin(s.clock.elapsedTime * 1.8);
  });
  return (
    <mesh ref={ref} position={[0, -0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.4, 2.0, 64]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

const Particles: React.FC = () => {
  const COUNT = 28;
  const pts   = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      a[i*3]   = (Math.random() - .5) * 7;
      a[i*3+1] = (Math.random() - .5) * 5;
      a[i*3+2] = (Math.random() - .5) * 7;
    }
    return a;
  }, []);
  useFrame((s) => { if (pts.current) pts.current.rotation.y = s.clock.elapsedTime * .04; });
  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#a5b4fc" size={0.04} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
};

const House: React.FC = () => {
  const g = useRef<THREE.Group>(null);
  useFrame((_s, dt) => { if (g.current) g.current.rotation.y += dt * 0.28; });
  return (
    <group ref={g} position={[0, -0.2, 0]}>
      {/* Walls */}
      <mesh><boxGeometry args={[2, 1.6, 2]} /><meshStandardMaterial color="#1e293b" roughness={0.75} metalness={0.15} /></mesh>
      <mesh><boxGeometry args={[2.01, 1.61, 2.01]} /><meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.22} /></mesh>
      {/* Roof */}
      <mesh position={[0, 1.3, 0]} rotation={[0, Math.PI/4, 0]}><coneGeometry args={[1.52, 1.05, 4]} /><meshStandardMaterial color="#0f172a" roughness={0.9} /></mesh>
      <mesh position={[0, 1.3, 0]} rotation={[0, Math.PI/4, 0]}><coneGeometry args={[1.54, 1.07, 4]} /><meshBasicMaterial color="#00f5ff" wireframe transparent opacity={0.28} /></mesh>
      {/* Chimney */}
      <mesh position={[0.52, 1.65, -0.35]}><boxGeometry args={[0.28, 0.55, 0.28]} /><meshStandardMaterial color="#1e293b" roughness={0.8} /></mesh>
      <mesh position={[0.52, 1.65, -0.35]}><boxGeometry args={[0.30, 0.57, 0.30]} /><meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.3} /></mesh>
      {/* Windows */}
      <mesh position={[-0.52, 0.12, 1.02]}><boxGeometry args={[0.42, 0.36, 0.05]} /><meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.2} roughness={0.1} metalness={0.6} /></mesh>
      <mesh position={[ 0.52, 0.12, 1.02]}><boxGeometry args={[0.42, 0.36, 0.05]} /><meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.2} roughness={0.1} metalness={0.6} /></mesh>
      {/* Door */}
      <mesh position={[0, -0.35, 1.02]}><boxGeometry args={[0.32, 0.62, 0.05]} /><meshStandardMaterial color="#334155" roughness={0.7} /></mesh>
      {/* Door handle */}
      <mesh position={[0.11, -0.35, 1.06]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color="#a5b4fc" emissive="#6366f1" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} /></mesh>
      <ScanLine />
      <GroundRing />
    </group>
  );
};

const HouseScene: React.FC = () => (
  <>
    <ambientLight intensity={0.25} />
    <pointLight position={[ 5, 6,  4]} intensity={1.4} color="#6366f1" />
    <pointLight position={[-4, 2, -4]} intensity={0.7} color="#00f5ff" />
    <pointLight position={[ 0,-3,  2]} intensity={0.25} color="#e0e7ff" />
    <Particles />
    <House />
  </>
);

// ─── FRAMER VARIANTS ────────────────────────────────────────

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};
const item = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

// ─── HERO COMPONENT ─────────────────────────────────────────

export const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-transparent">

      {/* Background gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[120%] bg-white/10 dark:bg-slate-900/40 skew-y-[-6deg] origin-top-left transform -translate-y-20 transition-colors duration-300">
          <div className="absolute inset-0 opacity-30 dark:opacity-50" style={{
            backgroundImage:`
              radial-gradient(at 77% 12%, hsla(245,68%,78%,.4) 0px, transparent 50%),
              radial-gradient(at  0% 12%, hsla(180,77%,78%,.4) 0px, transparent 50%),
              radial-gradient(at 90% 90%, hsla(333,64%,81%,.4) 0px, transparent 50%),
              radial-gradient(at 12% 84%, hsla(208,62%,84%,.4) 0px, transparent 50%)`
          }} />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 pt-20 w-full">

        {/* LEFT — text */}
        <motion.div className="max-w-2xl pt-10" variants={container} initial="hidden" animate="visible">

          {/* Badge */}
          <motion.div variants={item}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/20 backdrop-blur-sm mb-8 transition-colors duration-300">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-base font-semibold text-white tracking-widest uppercase [-webkit-text-stroke:1px_white]">
                System Intelligence v3.0
              </span>
            </div>
          </motion.div>

          {/* Headline — entrance + smooth GPU-accelerated float */}
          <motion.div variants={item}>
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-3 leading-[1.1] tracking-tight text-balance transition-colors duration-300"
              style={{ willChange: 'transform' }}
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              From market scan to signed deal —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">
                in seconds.
              </span>
            </motion.h1>
          </motion.div>

          {/* Sub-punch */}
          <motion.div variants={item}>
            <p className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white mb-6 [-webkit-text-stroke:0.5px_white] dark:[-webkit-text-stroke:0px] transition-colors duration-300">
              Cut weeks of research down to one report.
            </p>
          </motion.div>

          {/* Description */}
          <motion.p variants={item} className="text-lg md:text-xl text-white dark:text-slate-300 mb-10 leading-relaxed max-w-xl [-webkit-text-stroke:1px_white] dark:[-webkit-text-stroke:0px]">
            Hydrel automates market analysis, lead outreach, and data intelligence — so you spend less time researching and more time executing.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap gap-4">
            <button
              onClick={() => scrollToSection('architectures')}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Explore the Systems
            </button>
            <button
              onClick={() => scrollToSection('featured')}
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              View Active Architectures
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT — 3D house */}
        <div className="hidden lg:block relative h-full min-h-[500px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <Canvas
              camera={{ position: [4, 3, 5], fov: 38 }}
              style={{ background: 'transparent', width: '100%', height: '100%' }}
              gl={{ alpha: true, antialias: true }}
            >
              <HouseScene />
            </Canvas>
          </Suspense>

          {/* HUD */}
          <div className="absolute bottom-10 left-6 pointer-events-none space-y-1">
            <p className="text-[10px] font-mono text-indigo-400/50 tracking-widest uppercase">SYS // HYDREL-MK1</p>
            <p className="text-[10px] font-mono text-cyan-400/45 tracking-widest uppercase">SCAN // ACTIVE</p>
            <p className="text-[10px] font-mono text-slate-400/40 tracking-widest uppercase">NODE // ONLINE</p>
          </div>
          {/* Corner brackets */}
          <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-indigo-400/25 pointer-events-none" />
          <div className="absolute top-8 left-6  w-8 h-8 border-t-2 border-l-2 border-indigo-400/25 pointer-events-none" />
          <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-indigo-400/25 pointer-events-none" />
          <div className="absolute bottom-8 left-6  w-8 h-8 border-b-2 border-l-2 border-indigo-400/25 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
