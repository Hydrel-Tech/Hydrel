/**
 * WelcomeAnimation.tsx
 * ────────────────────
 * Resident Evil 9 lab aesthetic.
 * WELCOME drops letter by letter from above (W first → E last),
 * holds for a beat, then each letter drains downward (W leads the exit).
 * Green rim lighting, LED ceiling strip, scan line — all pure CSS/Framer.
 * No 3D, no heavy deps. Fast, crisp, clinical.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeAnimationProps {
  onComplete: () => void;
}

const LETTERS = ['W', 'E', 'L', 'C', 'O', 'M', 'E'];
const DROP_INTERVAL_MS   = 110;
const HOLD_MS            = 900;
const DRAIN_INTERVAL_MS  = 70;
const FADE_OUT_DELAY_MS  = 350;

type Phase = 'dropping' | 'holding' | 'draining' | 'done';

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete }) => {
  const [phase,        setPhase]        = useState<Phase>('dropping');
  const [visibleCount, setVisibleCount] = useState(0);
  const [drainIndex,   setDrainIndex]   = useState(-1);

  // ── Phase: dropping ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'dropping') return;
    if (visibleCount < LETTERS.length) {
      const t = setTimeout(() => setVisibleCount(v => v + 1), DROP_INTERVAL_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('holding'), DROP_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [phase, visibleCount]);

  // ── Phase: holding ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'holding') return;
    const t = setTimeout(() => { setPhase('draining'); setDrainIndex(0); }, HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Phase: draining ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'draining') return;
    if (drainIndex < LETTERS.length) {
      const t = setTimeout(() => setDrainIndex(i => i + 1), DRAIN_INTERVAL_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setPhase('done'); onComplete(); }, FADE_OUT_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, drainIndex, onComplete]);

  const isDrained = (i: number) => phase === 'draining' && i < drainIndex;
  const isVisible = (i: number) => i < visibleCount;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeIn' } }}
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #f1f5f9 0%, #e2e8f0 60%, #f8fafc 100%)' }}
    >

      {/* ── LED ceiling strips (RE9 feel) ─────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-0.5
                        bg-white shadow-[0_0_28px_6px_rgba(255,255,255,0.95)]" />
        <div className="absolute top-6 left-1/4 w-32 h-px
                        bg-white/70 shadow-[0_0_12px_2px_rgba(255,255,255,0.7)]" />
        <div className="absolute top-6 right-1/4 w-32 h-px
                        bg-white/70 shadow-[0_0_12px_2px_rgba(255,255,255,0.7)]" />
      </div>

      {/* ── Green rim light (floor edge) ──────────────────────────────────── */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px
                      bg-gradient-to-r from-transparent via-emerald-400 to-transparent
                      shadow-[0_0_24px_4px_rgba(52,211,153,0.5)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24
                      bg-gradient-to-t from-emerald-400/5 to-transparent" />

      {/* ── Vertical rim accents ──────────────────────────────────────────── */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-px
                      bg-gradient-to-b from-transparent via-emerald-300/20 to-emerald-400/40" />
      <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-px
                      bg-gradient-to-b from-transparent via-emerald-300/20 to-emerald-400/40" />

      {/* ── Animated scan line ────────────────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute left-0 right-0 h-px
                   bg-emerald-400/30 shadow-[0_0_8px_2px_rgba(52,211,153,0.25)]"
        animate={{ top: ['8%', '92%'] }}
        transition={{ duration: 2.8, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
      />

      {/* ── WELCOME letter cluster ────────────────────────────────────────── */}
      <div className="relative flex items-end gap-0 md:gap-1 select-none">
        {LETTERS.map((letter, i) => (
          <AnimatePresence key={i} mode="popLayout">
            {isVisible(i) && !isDrained(i) && (
              <motion.span
                key={`l-${i}-visible`}
                initial={{ y: -56, opacity: 0, filter: 'blur(10px)' }}
                animate={{ y: 0,   opacity: 1, filter: 'blur(0px)' }}
                exit={{   y:  72,  opacity: 0, filter: 'blur(8px)'  }}
                transition={{
                  enter: {
                    type: 'spring',
                    stiffness: 480,
                    damping: 32,
                    delay: i * 0.03,
                  },
                  exit: { duration: 0.16, ease: 'easeIn' },
                }}
                className="inline-block font-black leading-none"
                style={{
                  fontSize: 'clamp(4rem, 12vw, 8rem)',
                  color: '#0f172a',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '-0.03em',
                  textShadow: '0 0 60px rgba(16,185,129,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                {letter}
              </motion.span>
            )}
          </AnimatePresence>
        ))}

        {/* ── Underscore blink while dropping ──────────────────────────── */}
        <AnimatePresence>
          {phase === 'dropping' && (
            <motion.span
              key="cursor"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="inline-block w-1 md:w-2 self-stretch ml-1"
              style={{
                background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                borderRadius: 2,
                minHeight: 'clamp(4rem, 12vw, 8rem)',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── System sub-label (appears while holding) ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: phase === 'holding' ? 1 : 0, y: phase === 'holding' ? 0 : 8 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center pointer-events-none"
      >
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.45em]">
          HYDREL &nbsp;//&nbsp; INTELLIGENCE CONSOLE
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">
            System Online
          </span>
        </div>
      </motion.div>

      {/* ── Corner bracket decorations (RE9 HUD feel) ─────────────────────── */}
      {[
        'top-6 left-6 border-t-2 border-l-2',
        'top-6 right-6 border-t-2 border-r-2',
        'bottom-6 left-6 border-b-2 border-l-2',
        'bottom-6 right-6 border-b-2 border-r-2',
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-6 h-6 ${cls} border-slate-300/60 pointer-events-none`}
        />
      ))}
    </motion.div>
  );
};

export default WelcomeAnimation;
