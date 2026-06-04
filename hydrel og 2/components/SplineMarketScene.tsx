/**
 * SplineMarketScene.tsx
 * ══════════════════════
 * Replaces the R3F DealScene (two pixel people) on the MarketAlpha
 * hero section with the Spline orbital + blob scene.
 *
 * Features:
 *   • Spline scene embedded via @splinetool/react-spline
 *   • Water-trickle audio on hover and click (no Spline paid plan needed)
 *   • Watermark overlay matching hero bg-emerald-900 / dark:bg-emerald-950
 *   • Smooth fade-in after scene loads
 *   • Mobile touch support for audio unlock
 *
 * ─── SETUP (one-time) ──────────────────────────────────────────────────────
 *
 * 1. Install:
 *    npm install @splinetool/react-spline
 *
 * 2. Get your scene URL:
 *    In Spline → Export (cloud icon, top right) → React tab
 *    Copy the URL ending in /scene.splinecode
 *    Paste it into SCENE_URL below.
 *
 * 3. Add the audio file:
 *    Rename water-trickling-31169.mp3 → water-trickling.mp3
 *    Place it at:  YOUR_PROJECT/public/sounds/water-trickling.mp3
 *
 * ───────────────────────────────────────────────────────────────────────────
 */

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react'
import Spline from '@splinetool/react-spline'
import type { Application }  from '@splinetool/runtime'

// ─── ⚙️  PASTE YOUR SCENE URL HERE ───────────────────────────────────────────
const SCENE_URL =
  'https://prod.spline.design/Vxi0uIWQs3nzsB1t/scene.splinecode'
// ─────────────────────────────────────────────────────────────────────────────

// ─── Audio config ─────────────────────────────────────────────────────────────

const AUDIO_PATH    = '/sounds/water-trickling.mp3'
const HOVER_VOLUME  = 0.18
const CLICK_VOLUME  = 0.35

// Minimum ms between plays — prevents rapid-fire flooding
const DEBOUNCE_MS   = 140

// ─── Component ────────────────────────────────────────────────────────────────

interface SplineMarketSceneProps {
  /** Extra Tailwind classes applied to the wrapper */
  className?: string
}

export const SplineMarketScene: React.FC<SplineMarketSceneProps> = ({
  className = '',
}) => {
  const [sceneLoaded, setSceneLoaded]     = useState(false)
  const audioRef                           = useRef<HTMLAudioElement | null>(null)
  const audioUnlocked                      = useRef(false)
  const lastPlayedAt                       = useRef(0)
  const splineApp                          = useRef<Application | null>(null)

  // ── Audio: lazy-init on first user gesture ──────────────────────────────
  const initAudio = useCallback(() => {
    if (audioRef.current) return
    const a        = new Audio(AUDIO_PATH)
    a.preload      = 'auto'
    a.volume       = HOVER_VOLUME
    audioRef.current = a
  }, [])

  // Browsers block autoplay until a user gesture has occurred.
  // We silently play + pause to unlock the audio context.
  const unlockAudio = useCallback(async () => {
    if (audioUnlocked.current || !audioRef.current) return
    try {
      await audioRef.current.play()
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioUnlocked.current = true
    } catch (_) {
      // Silently swallow — unlock will retry on next gesture
    }
  }, [])

  const playTrickle = useCallback((volume: number) => {
    if (!audioRef.current) return

    const now = Date.now()
    if (now - lastPlayedAt.current < DEBOUNCE_MS) return
    lastPlayedAt.current = now

    audioRef.current.volume       = volume
    audioRef.current.currentTime  = 0
    audioRef.current.play().catch(() => {})
  }, [])

  // ── Spline event handlers ────────────────────────────────────────────────

  // Any object hovered → soft trickle
  const handleMouseHover = useCallback(() => {
    playTrickle(HOVER_VOLUME)
  }, [playTrickle])

  // Any object clicked → louder burst
  const handleMouseDown = useCallback(() => {
    playTrickle(CLICK_VOLUME)
  }, [playTrickle])

  // Cache the Spline app ref on load
  const handleLoad = useCallback((app: Application) => {
    splineApp.current = app
    setSceneLoaded(true)
  }, [])

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative w-full h-full ${className}`}
      // Init + unlock audio on first pointer/touch contact
      onMouseEnter={() => { initAudio(); unlockAudio() }}
      onTouchStart={() => { initAudio(); unlockAudio() }}
    >

      {/* ── Loading spinner (shown until Spline fires onLoad) ── */}
      {!sceneLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Spline scene ── */}
      <Spline
        scene={SCENE_URL}
        onLoad={handleLoad}
        onSplineMouseHover={handleMouseHover}
        onSplineMouseDown={handleMouseDown}
        style={{
          width:      '100%',
          height:     '100%',
          opacity:    sceneLoaded ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}
      />

      {/*
       * ── Watermark cover ──────────────────────────────────────────────────
       * Spline free plan renders a "Built with Spline" badge at bottom-right.
       * This div sits on top of it, matching the hero section's background.
       *
       * Background matches:
       *   Light  → bg-emerald-900   (#14532d)
       *   Dark   → bg-emerald-950   (#052e16)
       *
       * To remove this when you upgrade Spline plans, just delete this div.
       * ─────────────────────────────────────────────────────────────────────
       */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 z-20 pointer-events-none bg-emerald-900 dark:bg-emerald-950 transition-colors duration-300"
        style={{ width: 165, height: 40 }}
      />

    </div>
  )
}

export default SplineMarketScene
