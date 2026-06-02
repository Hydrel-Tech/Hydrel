/**
 * Hero.tsx  —  Scroll-Driven 3D Hero (Complete Rewrite)
 * ═══════════════════════════════════════════════════════
 * Architecture:
 *
 *   [Hero wrapper]           min-h-[280vh]  — provides scroll space
 *     └─ [Sticky viewport]   position:sticky, h-screen, overflow:hidden
 *          ├─ Background gradient (unchanged aesthetic)
 *          ├─ R3F Canvas (right half) — ProceduralSkyscraper rotating with scroll
 *          └─ Text panel layer (left half)
 *               ├─ Panel 1  scroll 0 → 32%   — main headline + CTAs
 *               ├─ Panel 2  scroll 28 → 62%  — live stats reveal
 *               └─ Panel 3  scroll 58 → 97%  — platform overview + CTA
 *
 * Scroll tracking:
 *   - framer-motion useScroll({ target: heroRef }) → 0→1 as you scroll
 *   - useSpring for physics-smoothed value
 *   - Passed to R3F via scrollOffsetRef (no re-renders)
 *
 * Removed from original:
 *   - Static house (replaced by ProceduralSkyscraper)
 *   - OrbitControls (scroll now drives rotation)
 *   - Jargon subtext (replaced with punchy copy)
 *
 * Install required before using:
 *   npm install @react-three/csg maath gsap
 */

import React, {
  Suspense, useRef, useMemo, useEffect,
} from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ProceduralSkyscraper } from './ProceduralSkyscraper'

// ─── Ambient particles (lightweight, inside the Canvas) ───────────────────────

const AmbientParticles: React.FC = () => {
  const COUNT = 22
  const ref   = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 12
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16
      arr[i * 3 + 2] = (Math.random() - 0.5) * 9
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.022
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a5b4fc"
        size={0.038}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  )
}

// ─── Canvas fallback ──────────────────────────────────────────────────────────

const CanvasFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

// ─── Framer-motion variants ───────────────────────────────────────────────────

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.08 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 26 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── Stat entry component ─────────────────────────────────────────────────────

interface StatEntry { val: string; label: string }
const Stat: React.FC<StatEntry> = ({ val, label }) => (
  <div className="border-l-2 border-cyan-500/40 pl-3">
    <p className="text-xl font-black text-white">{val}</p>
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
  </div>
)

// ─── Main Hero ────────────────────────────────────────────────────────────────

export const Hero: React.FC = () => {
  // ── Refs ──────────────────────────────────────────────────────────────────
  const heroRef         = useRef<HTMLDivElement>(null)
  const scrollOffsetRef = useRef<number>(0) // shared with R3F, no re-renders

  // ── Scroll tracking ───────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target:  heroRef,
    offset:  ['start start', 'end start'],
  })

  // Physics-smoothed scroll value
  const smooth = useSpring(scrollYProgress, {
    stiffness: 75,
    damping:   22,
    restDelta: 0.001,
  })

  // Write to ref (zero re-renders — R3F reads this in useFrame)
  useMotionValueEvent(smooth, 'change', (v) => {
    scrollOffsetRef.current = v
  })

  // ── Panel 1 — Main headline (0 → 32%) ────────────────────────────────────
  const p1Opacity = useTransform(smooth, [0, 0.04, 0.27, 0.34], [0, 1, 1, 0])
  const p1X       = useTransform(smooth, [0, 0.06, 0.27, 0.34], [-36, 0, 0, -52])

  // ── Panel 2 — Stats (28% → 62%) ──────────────────────────────────────────
  const p2Opacity = useTransform(smooth, [0.28, 0.37, 0.57, 0.64], [0, 1, 1, 0])
  const p2X       = useTransform(smooth, [0.28, 0.37, 0.57, 0.64], [52, 0, 0, 52])

  // ── Panel 3 — Platform overview (58% → 97%) ──────────────────────────────
  const p3Opacity = useTransform(smooth, [0.58, 0.67, 0.92, 0.98], [0, 1, 1, 0])
  const p3X       = useTransform(smooth, [0.58, 0.67, 0.92, 0.98], [-36, 0, 0, -36])

  // Scroll hint only visible near top
  const hintOpacity = useTransform(smooth, [0, 0.08], [1, 0])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // ── Stats data ────────────────────────────────────────────────────────────
  const stats: StatEntry[] = [
    { val: '97.8%', label: 'Data Accuracy' },
    { val: '<2.8%', label: 'False Signal Rate' },
    { val: '50K+',  label: 'Nodes Scanned Daily' },
    { val: '10hr+', label: 'Saved Per Week' },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    /*
     * Wrapper — tall enough to scroll through 3 content panels.
     * Position: relative so the sticky child has a valid scroll container.
     */
    <div ref={heroRef} className="relative" style={{ minHeight: '280vh' }}>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STICKY VIEWPORT — stays fixed while parent scrolls                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ── Background gradient (matches original aesthetic) ── */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-full h-[120%] bg-white/10 dark:bg-slate-900/40 skew-y-[-6deg] origin-top-left transform -translate-y-20 transition-colors duration-300"
          >
            <div
              className="absolute inset-0 w-full h-full opacity-30 dark:opacity-50"
              style={{
                backgroundImage: `
                  radial-gradient(at 77% 12%, hsla(245,68%,78%,0.4) 0px, transparent 50%),
                  radial-gradient(at  0% 12%, hsla(180,77%,78%,0.4) 0px, transparent 50%),
                  radial-gradient(at 90% 90%, hsla(333,64%,81%,0.4) 0px, transparent 50%),
                  radial-gradient(at 12% 84%, hsla(208,62%,84%,0.4) 0px, transparent 50%)
                `,
              }}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* R3F CANVAS — right half on desktop, full-width bg on mobile        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 lg:left-auto lg:right-0 lg:w-[55%] z-10 pointer-events-none lg:pointer-events-auto">
          <Suspense fallback={<CanvasFallback />}>
            <Canvas
              camera={{ position: [3.6, 1.8, 6], fov: 40 }}
              style={{ background: 'transparent', width: '100%', height: '100%' }}
              gl={{ alpha: true, antialias: true }}
            >
              {/* Lighting — matches original color palette */}
              <ambientLight intensity={0.2} />
              <pointLight position={[5, 7, 4]}    intensity={1.6}  color="#6366f1" />
              <pointLight position={[-4, 2, -4]}  intensity={0.75} color="#00f5ff" />
              <pointLight position={[0, -3, 2]}   intensity={0.28} color="#e0e7ff" />

              <AmbientParticles />
              <ProceduralSkyscraper scrollOffsetRef={scrollOffsetRef} />
            </Canvas>
          </Suspense>

          {/* ── HUD corner decorations ── */}
          <div className="absolute top-8 right-8 pointer-events-none">
            <div className="w-7 h-7 border-t-2 border-r-2 border-indigo-400/25" />
          </div>
          <div className="absolute top-8 left-8 pointer-events-none">
            <div className="w-7 h-7 border-t-2 border-l-2 border-indigo-400/25" />
          </div>
          <div className="absolute bottom-8 right-8 pointer-events-none">
            <div className="w-7 h-7 border-b-2 border-r-2 border-indigo-400/25" />
          </div>
          <div className="absolute bottom-8 left-8 pointer-events-none">
            <div className="w-7 h-7 border-b-2 border-l-2 border-indigo-400/25" />
          </div>

          {/* ── Live system readout ── */}
          <div className="hidden lg:block absolute bottom-10 left-8 pointer-events-none space-y-1">
            <p className="text-[10px] font-mono text-indigo-400/50 tracking-widest uppercase">SYS // HYDREL-MK1</p>
            <p className="text-[10px] font-mono text-cyan-400/45 tracking-widest uppercase">SCAN // ACTIVE</p>
            <p className="text-[10px] font-mono text-slate-400/40 tracking-widest uppercase">NODE // ONLINE</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TEXT PANEL LAYER                                                    */}
        {/* All 3 panels are absolute — each fades/slides in at its scroll %   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6">

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* PANEL 1  —  Main headline  (scroll 0 → 32%)                       */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <motion.div
            style={{ opacity: p1Opacity, x: p1X }}
            className="absolute top-1/2 -translate-y-1/2 left-0 lg:left-0 w-full lg:w-[52%] px-6 lg:px-0"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-2xl"
            >
              {/* Badge */}
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/20 backdrop-blur-sm mb-8 transition-colors duration-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-sm font-semibold text-white tracking-widest uppercase [-webkit-text-stroke:1px_white]">
                    System Intelligence v3.0
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight transition-colors duration-300"
              >
                Infrastructure for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">
                  Decision Excellence
                </span>
              </motion.h1>

              {/* Punchy subtext — replaces jargon paragraph */}
              <motion.p
                variants={itemVariants}
                className="text-2xl md:text-3xl text-white mb-10 leading-relaxed max-w-xl [-webkit-text-stroke:1px_white]"
              >
                From market scan to signed deal —{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 [-webkit-text-stroke:0px] font-bold">
                  automated.
                </span>
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollTo('architectures')}
                  className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Explore the Systems
                </button>
                <button
                  onClick={() => scrollTo('featured')}
                  className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  View Active Architectures
                </button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* PANEL 2  —  Live stats  (scroll 28% → 62%)                        */}
          {/* Slides in from right, creates "coming from the building" feel      */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <motion.div
            style={{ opacity: p2Opacity, x: p2X }}
            className="absolute top-1/2 -translate-y-1/2 left-0 lg:left-0 w-full lg:w-[52%] px-6 lg:px-0"
          >
            <div className="max-w-xl">
              <p className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase mb-5">
                Live Intelligence Feed
              </p>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-2">
                97.8%
              </h2>
              <p className="text-xl font-bold text-slate-300 mb-8">
                data accuracy across every market scan.
              </p>

              <div className="grid grid-cols-2 gap-5">
                {stats.map((s) => (
                  <Stat key={s.val} {...s} />
                ))}
              </div>

              {/* Progress bars */}
              <div className="mt-8 space-y-3">
                {[
                  { label: 'Signal Precision', value: 97.8, color: 'bg-cyan-400' },
                  { label: 'Risk Calibration',  value: 83,   color: 'bg-indigo-400' },
                  { label: 'Market Coverage',   value: 71,   color: 'bg-purple-400' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide mb-1">
                      <span className="text-slate-400">{bar.label}</span>
                      <span className="text-white">{bar.value}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${bar.color} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.value}%` }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* PANEL 3  —  Platform overview  (scroll 58% → 97%)                 */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <motion.div
            style={{ opacity: p3Opacity, x: p3X }}
            className="absolute top-1/2 -translate-y-1/2 left-0 lg:left-0 w-full lg:w-[52%] px-6 lg:px-0"
          >
            <div className="max-w-xl">
              <p className="text-[10px] font-bold tracking-[0.3em] text-indigo-400 uppercase mb-5">
                One Platform
              </p>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.05] mb-6">
                Real estate.{' '}
                <span className="text-slate-400">Outreach.</span>
                {' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  Intelligence.
                </span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Four specialized systems. One unified architecture. Built to work while you don't.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => scrollTo('architectures')}
                  className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 cursor-pointer text-sm"
                >
                  See All Systems ↓
                </button>
                <button
                  onClick={() => scrollTo('contact')}
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-full border border-white/20 transition-colors cursor-pointer text-sm"
                >
                  Request Demo
                </button>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SCROLL INDICATOR — fades out after 8%                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
        >
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
            Scroll to explore
          </p>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 border-2 border-white/20 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </motion.div>
        </motion.div>

      </div>
      {/* end sticky */}

    </div>
    /* end hero wrapper */
  )
}

export default Hero
