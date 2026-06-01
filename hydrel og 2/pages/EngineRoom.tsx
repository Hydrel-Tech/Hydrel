/**
 * EngineRoom.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The orbital engine selector room.
 *
 * GLB assets (place all in public/models/):
 *   white_round_exhibition_gallery.glb  → room geometry
 *   mothership_team_fortress_2.glb      → UFO projector devices (×4)
 *   futuristic_bluish_sofa.glb          → viewer POV anchor behind camera
 *   hologram_police_robots.glb          → ambient decoration
 *   futuristic_door.glb                 → 15MB, lazy-loaded last
 *
 * Architecture:
 *   • 4 UFO projectors sit at orbital radius ~2.8 around center
 *   • Whole orbital group lerps toward targetAngle on each engine change
 *   • Html overlay from @react-three/drei renders the hologram card above each UFO
 *   • Click active projector → camera zooms in → onEngineSelect fires
 *   • Left/right arrow nav + swipe gesture on mobile
 */

import React, {
  Suspense, useRef, useState, useEffect, useCallback, lazy,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html, useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentMode = 'buying' | 'listing' | 'investor' | 'flipper';

interface EngineRoomProps {
  onEngineSelect: (engine: AgentMode) => void;
}

// ─── Engine metadata ──────────────────────────────────────────────────────────

const ENGINES: { id: AgentMode; label: string; color: string; subLabel: string }[] = [
  { id: 'buying',   label: 'Buying Agent',   color: '#6366f1', subLabel: 'Identify & acquire' },
  { id: 'listing',  label: 'Listing Agent',  color: '#f97316', subLabel: 'Price & position'    },
  { id: 'investor', label: 'Investor',       color: '#10b981', subLabel: 'Returns & risk'      },
  { id: 'flipper',  label: 'Flipper',        color: '#f59e0b', subLabel: 'Buy low, sell high'  },
];

const ORBITAL_RADIUS = 2.6;
const CAMERA_START   = new THREE.Vector3(0, 2.2, 5.5);

// ─── Synthetic click sound (Web Audio API — no file dependency) ───────────────

const playClick = () => {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);
  } catch (_) { /* silently ignore — audio blocked on some browsers */ }
};

// ─── Engine hologram symbols (pure SVG, rendered in Html overlay) ─────────────

const BuyingSymbol: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    {/* Stack of bills */}
    {[8, 6, 4].map((offset, i) => (
      <rect key={i} x={6 + offset} y={20 + offset} width={30} height={18}
        rx={2} fill="#1e293b" stroke={color} strokeWidth={1.5} opacity={0.7 + i * 0.15} />
    ))}
    <rect x={6} y={20} width={30} height={18} rx={2} fill="#1e293b" stroke={color} strokeWidth={2} />
    {/* Red dollar sign */}
    <text x="50%" y="33" dominantBaseline="middle" textAnchor="middle"
      fontSize="13" fontWeight="900" fill="#ef4444" fontFamily="monospace">$</text>
    {/* Top line decoration */}
    <line x1="12" y1="26" x2="22" y2="26" stroke={color} strokeWidth="1.5" opacity="0.5" />
  </svg>
);

const ListingSymbol: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    {[8, 6, 4].map((offset, i) => (
      <rect key={i} x={6 + offset} y={20 + offset} width={30} height={18}
        rx={2} fill="#1e293b" stroke={color} strokeWidth={1.5} opacity={0.7 + i * 0.15} />
    ))}
    <rect x={6} y={20} width={30} height={18} rx={2} fill="#1e293b" stroke={color} strokeWidth={2} />
    {/* Green dollar sign */}
    <text x="50%" y="33" dominantBaseline="middle" textAnchor="middle"
      fontSize="13" fontWeight="900" fill="#22c55e" fontFamily="monospace">$</text>
    <line x1="12" y1="26" x2="22" y2="26" stroke={color} strokeWidth="1.5" opacity="0.5" />
  </svg>
);

const InvestorSymbol: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    {/* Rising bars */}
    {[
      { x: 6,  h: 8,  y: 34 },
      { x: 13, h: 13, y: 29 },
      { x: 20, h: 18, y: 24 },
      { x: 27, h: 24, y: 18 },
      { x: 34, h: 30, y: 12 },
    ].map((bar, i) => (
      <rect key={i} x={bar.x} y={bar.y} width={6} height={bar.h}
        rx={1} fill={color} opacity={0.4 + i * 0.14} />
    ))}
    {/* Rising line + arrow */}
    <polyline points="6,34 13,28 20,22 27,16 36,10"
      stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <polygon points="36,6 40,14 32,12" fill={color} />
  </svg>
);

const FlipperSymbol: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    {/* Worn cabin — walls */}
    <rect x={8} y={24} width={32} height={18} rx={1}
      fill="#1e293b" stroke={color} strokeWidth={2} />
    {/* Roof */}
    <polygon points="4,24 24,8 44,24"
      fill="#1e293b" stroke={color} strokeWidth={2} />
    {/* Door — slightly off-center (worn feel) */}
    <rect x={19} y={32} width={9} height={10} rx={1}
      fill="#334155" stroke={color} strokeWidth={1} opacity={0.8} />
    {/* Crack on wall */}
    <path d="M 14 28 L 16 33 L 14 38" stroke={color} strokeWidth={1}
      fill="none" opacity={0.4} />
    {/* Window */}
    <rect x={28} y={27} width={7} height={6} rx={0.5}
      fill="#334155" stroke={color} strokeWidth={1} opacity={0.7} />
  </svg>
);

const ENGINE_SYMBOLS: Record<AgentMode, React.FC<{ color: string }>> = {
  buying:   BuyingSymbol,
  listing:  ListingSymbol,
  investor: InvestorSymbol,
  flipper:  FlipperSymbol,
};

// ─── Hologram beam above each projector ──────────────────────────────────────

const HologramBeam: React.FC<{ color: string; isActive: boolean }> = ({ color, isActive }) => {
  const beamRef = useRef<THREE.Mesh>(null!);
  const c = new THREE.Color(color);

  useFrame(({ clock }) => {
    if (!beamRef.current) return;
    const mat = beamRef.current.material as THREE.MeshBasicMaterial;
    const pulse = Math.sin(clock.elapsedTime * 2.2) * 0.04;
    mat.opacity = (isActive ? 0.18 : 0.07) + pulse;
  });

  return (
    <group position={[0, 0.5, 0]}>
      {/* Upward cone beam */}
      <mesh ref={beamRef} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.38, 1.8, 32, 1, true]} />
        <meshBasicMaterial
          color={c}
          transparent
          opacity={isActive ? 0.18 : 0.07}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Base glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.18, 0.38, 32]} />
        <meshBasicMaterial
          color={c}
          transparent
          opacity={isActive ? 0.55 : 0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// ─── Single UFO projector model ───────────────────────────────────────────────

const UFOModel: React.FC = () => {
  const { scene } = useGLTF('/models/mothership_team_fortress_2.glb');
  const clone = scene.clone(true);
  return (
    <primitive
      object={clone}
      scale={0.3}
      position={[0, -0.1, 0]}
      rotation={[0, 0, 0]}
    />
  );
};

// ─── Room model ──────────────────────────────────────────────────────────────

const RoomModel: React.FC = () => {
  const { scene } = useGLTF('/models/white_round_exhibition_gallery.glb');
  return (
    <primitive
      object={scene}
      scale={1.8}
      position={[0, -1.2, 0]}
    />
  );
};

// ─── Sofa (viewer anchor) ─────────────────────────────────────────────────────

const SofaModel: React.FC = () => {
  const { scene } = useGLTF('/models/futuristic_bluish_sofa.glb');
  return (
    <primitive
      object={scene}
      scale={0.55}
      position={[0, -1.1, 4.2]}
      rotation={[0, Math.PI, 0]}
    />
  );
};

// ─── Ambient robots (loaded lazily — lower priority) ─────────────────────────

const AmbientRobots: React.FC = () => {
  const { scene } = useGLTF('/models/hologram_police_robots.glb');
  return (
    <primitive
      object={scene}
      scale={0.4}
      position={[-3.5, -1.1, -1]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
};

// ─── Orbital group that lerps toward the target angle ─────────────────────────

interface OrbitalGroupProps {
  activeIndex:   number;
  isTransitioning: boolean;
  onProjectorClick: () => void;
  children?: React.ReactNode;
}

const OrbitalGroup: React.FC<OrbitalGroupProps & {
  engines: typeof ENGINES;
}> = ({ activeIndex, isTransitioning, onProjectorClick, engines }) => {
  const groupRef   = useRef<THREE.Group>(null!);
  const targetAngle = -activeIndex * (Math.PI / 2);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetAngle,
      0.07,
    );
  });

  return (
    <group ref={groupRef}>
      {engines.map((engine, i) => {
        const angle = i * (Math.PI / 2);
        const x = Math.sin(angle) * ORBITAL_RADIUS;
        const z = Math.cos(angle) * ORBITAL_RADIUS;
        const isActive = i === activeIndex;
        const Symbol = ENGINE_SYMBOLS[engine.id];

        return (
          <group
            key={engine.id}
            position={[x, -0.9, z]}
            rotation={[0, -angle, 0]}
          >
            {/* UFO projector base */}
            <UFOModel />

            {/* Hologram beam upward */}
            <HologramBeam color={engine.color} isActive={isActive} />

            {/* Html hologram card floating above beam */}
            <Html
              position={[0, 2.4, 0]}
              center
              distanceFactor={5}
              occlude={false}
              zIndexRange={[10, 100]}
            >
              <div
                onClick={isActive && !isTransitioning ? onProjectorClick : undefined}
                style={{
                  width: 140,
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: isActive
                    ? `linear-gradient(135deg, ${engine.color}22, ${engine.color}11)`
                    : 'rgba(15,23,42,0.55)',
                  border: `1.5px solid ${isActive ? engine.color : 'rgba(255,255,255,0.08)'}`,
                  backdropFilter: 'blur(8px)',
                  cursor: isActive ? 'pointer' : 'default',
                  opacity: isActive ? 1 : 0.45,
                  transform: `scale(${isActive ? 1 : 0.88})`,
                  transition: 'all 0.3s ease',
                  boxShadow: isActive
                    ? `0 0 28px ${engine.color}44, 0 4px 20px rgba(0,0,0,0.4)`
                    : '0 2px 12px rgba(0,0,0,0.3)',
                  textAlign: 'center',
                  pointerEvents: isActive ? 'auto' : 'none',
                  userSelect: 'none',
                }}
              >
                {/* Symbol */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                  <Symbol color={engine.color} />
                </div>

                {/* Label */}
                <p style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  margin: 0,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {engine.label}
                </p>

                {/* Sub-label */}
                <p style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: isActive ? engine.color : 'rgba(255,255,255,0.25)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  margin: '3px 0 0 0',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {engine.subLabel}
                </p>

                {/* Active CTA */}
                {isActive && (
                  <div style={{
                    marginTop: 8,
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: engine.color,
                    fontSize: 8,
                    fontWeight: 900,
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}>
                    Enter Engine
                  </div>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// ─── Camera: zoom-in transition when engine is selected ───────────────────────

interface CameraControllerProps {
  isTransitioning: boolean;
  targetPosition: THREE.Vector3;
  onTransitionEnd: () => void;
}

const CameraController: React.FC<CameraControllerProps> = ({
  isTransitioning, targetPosition, onTransitionEnd,
}) => {
  const { camera } = useThree();
  const progress = useRef(0);

  // Reset camera to start whenever not transitioning
  useEffect(() => {
    if (!isTransitioning) {
      progress.current = 0;
      camera.position.copy(CAMERA_START);
      (camera as THREE.PerspectiveCamera).fov = 55;
      camera.updateProjectionMatrix();
    }
  }, [isTransitioning, camera]);

  useFrame((_, delta) => {
    if (!isTransitioning) return;
    progress.current = Math.min(progress.current + delta * 1.1, 1);
    const t = progress.current;

    // Ease in cubic
    const eased = t * t * t;

    camera.position.lerpVectors(CAMERA_START, targetPosition, eased);
    (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(55, 18, eased);
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);

    if (t >= 1) onTransitionEnd();
  });

  return null;
};

// ─── Loading screen ───────────────────────────────────────────────────────────

const Loader: React.FC = () => {
  const { progress } = useProgress();
  return (
    <div className="fixed inset-0 z-[250] flex flex-col items-center justify-center
                    bg-slate-950">
      <div className="w-64 h-0.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-emerald-400 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
        Loading Engine Room… {Math.round(progress)}%
      </p>
    </div>
  );
};

// ─── Ambient lighting setup ───────────────────────────────────────────────────

const SceneLights: React.FC = () => (
  <>
    <ambientLight intensity={0.6} color="#f8fafc" />
    {/* Main overhead — white clinical */}
    <pointLight position={[0, 6, 0]} intensity={3.5} color="#ffffff" />
    {/* Green rim (RE9 feel) */}
    <pointLight position={[0, -0.5, 0]} intensity={0.6} color="#10b981" />
    {/* Side fills */}
    <pointLight position={[-4, 3, 0]} intensity={0.8} color="#f8fafc" />
    <pointLight position={[ 4, 3, 0]} intensity={0.8} color="#f8fafc" />
    {/* Subtle depth from rear */}
    <pointLight position={[0, 2, -4]} intensity={0.4} color="#e0f2fe" />
  </>
);

// ─── Touch / swipe hook ───────────────────────────────────────────────────────

const useSwipe = (onLeft: () => void, onRight: () => void) => {
  const startX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) dx < 0 ? onLeft() : onRight();
    startX.current = null;
  }, [onLeft, onRight]);

  return { onTouchStart, onTouchEnd };
};

// ─── Main EngineRoom component ────────────────────────────────────────────────

const EngineRoom: React.FC<EngineRoomProps> = ({ onEngineSelect }) => {
  const [activeIndex,      setActiveIndex]      = useState(0);
  const [isTransitioning,  setIsTransitioning]  = useState(false);
  const [showFlash,        setShowFlash]        = useState(false);
  const [isLoaded,         setIsLoaded]         = useState(false);

  const activeEngine = ENGINES[activeIndex];

  // Target camera position — zoom into the active projector
  const activeAngle    = activeIndex * (Math.PI / 2);
  const projX = Math.sin(activeAngle) * ORBITAL_RADIUS;
  const projZ = Math.cos(activeAngle) * ORBITAL_RADIUS;
  const transitionTarget = new THREE.Vector3(projX * 0.3, 1.0, projZ * 0.5);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    playClick();
    setActiveIndex(i => (i - 1 + ENGINES.length) % ENGINES.length);
  }, [isTransitioning]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    playClick();
    setActiveIndex(i => (i + 1) % ENGINES.length);
  }, [isTransitioning]);

  const handleEnterEngine = useCallback(() => {
    if (isTransitioning) return;
    playClick();
    setIsTransitioning(true);
    // White flash shortly before transition
    setTimeout(() => setShowFlash(true), 400);
  }, [isTransitioning]);

  const handleTransitionEnd = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => {
      onEngineSelect(activeEngine.id);
    }, 200);
  }, [activeEngine.id, onEngineSelect]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Enter')      handleEnterEngine();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePrev, handleNext, handleEnterEngine]);

  const { onTouchStart, onTouchEnd } = useSwipe(handleNext, handlePrev);

  // Preload GLBs as soon as component mounts
  useEffect(() => {
    useGLTF.preload('/models/white_round_exhibition_gallery.glb');
    useGLTF.preload('/models/mothership_team_fortress_2.glb');
    useGLTF.preload('/models/futuristic_bluish_sofa.glb');
    // Ambient + door loaded lazily — lower priority
    setTimeout(() => {
      useGLTF.preload('/models/hologram_police_robots.glb');
    }, 2000);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-950"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── White flash overlay on transition ─────────────────────────────── */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[400] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ── R3F Canvas ────────────────────────────────────────────────────── */}
      <Canvas
        camera={{ position: [0, 2.2, 5.5], fov: 55 }}
        gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.8]}
        style={{ background: '#f1f5f9' }}
      >
        <SceneLights />

        <Suspense fallback={null}>
          <RoomModel />
          <SofaModel />
          <OrbitalGroup
            activeIndex={activeIndex}
            isTransitioning={isTransitioning}
            onProjectorClick={handleEnterEngine}
            engines={ENGINES}
          />

          {/* Ambient robots — lower priority, own Suspense */}
          <Suspense fallback={null}>
            <AmbientRobots />
          </Suspense>

          <CameraController
            isTransitioning={isTransitioning}
            targetPosition={transitionTarget}
            onTransitionEnd={handleTransitionEnd}
          />
        </Suspense>

        {/* Ground shadow plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]}>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial transparent opacity={0.08} />
        </mesh>
      </Canvas>

      {/* ── HUD overlay (DOM layer on top of canvas) ──────────────────────── */}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between
                      px-6 bg-gradient-to-b from-black/30 to-transparent pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em]">
            HYDREL // ENGINE SELECTOR
          </span>
        </div>
        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
          {activeIndex + 1} / {ENGINES.length}
        </span>
      </div>

      {/* Navigation arrows */}
      <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2">
        <motion.button
          onClick={handlePrev}
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.92 }}
          disabled={isTransitioning}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                     flex items-center justify-center text-white/70 hover:text-white
                     hover:bg-white/20 transition-colors disabled:opacity-30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      </div>

      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2">
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.92 }}
          disabled={isTransitioning}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                     flex items-center justify-center text-white/70 hover:text-white
                     hover:bg-white/20 transition-colors disabled:opacity-30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      {/* Bottom engine indicator dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {ENGINES.map((engine, i) => (
          <motion.button
            key={engine.id}
            onClick={() => { if (!isTransitioning) { playClick(); setActiveIndex(i); } }}
            animate={{
              scale:   i === activeIndex ? 1.4 : 1,
              opacity: i === activeIndex ? 1 : 0.35,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="w-2 h-2 rounded-full"
            style={{ background: engine.color }}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <motion.button
          onClick={handleEnterEngine}
          disabled={isTransitioning}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          animate={{
            boxShadow: [
              `0 4px 24px ${activeEngine.color}44`,
              `0 8px 40px ${activeEngine.color}88`,
              `0 4px 24px ${activeEngine.color}44`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="px-10 py-3.5 rounded-2xl text-white font-black text-xs uppercase
                     tracking-[0.2em] transition-colors disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${activeEngine.color}, ${activeEngine.color}bb)` }}
        >
          Enter {activeEngine.label}
        </motion.button>
        <p className="mt-2 text-[8px] text-white/30 uppercase tracking-[0.25em] font-bold">
          ← → Arrow keys or swipe to navigate
        </p>
      </div>

      {/* LED ceiling strip (DOM layer — always visible) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-0.5 pointer-events-none
                      bg-white shadow-[0_0_24px_6px_rgba(255,255,255,0.8)]" />

      {/* Green floor rim */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 pointer-events-none
                      bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent
                      shadow-[0_0_20px_4px_rgba(52,211,153,0.35)]" />
    </div>
  );
};

// Preload the two highest priority models immediately at module load
useGLTF.preload('/models/white_round_exhibition_gallery.glb');
useGLTF.preload('/models/mothership_team_fortress_2.glb');
useGLTF.preload('/models/futuristic_bluish_sofa.glb');

export default EngineRoom;
