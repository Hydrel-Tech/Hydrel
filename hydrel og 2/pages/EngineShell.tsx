/**
 * EngineShell.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Rendered after the user selects an engine in EngineRoom and gets sucked in.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  [Active Engine Symbol + label]   [Change Engine →] │  ← sticky top bar
 *   ├─────────────────────────────────────────────────────┤
 *   │                                                     │
 *   │  Region selector  │  Zip selector                   │
 *   │                                                     │
 *   │  ── Engine parameters (horizontal scroll on mobile)─│
 *   │                                                     │
 *   │  Analysis directive textarea                        │
 *   │                                                     │
 *   │  [Generate Intelligence Report]                     │
 *   │                                                     │
 *   │  Output feed placeholder                            │
 *   └─────────────────────────────────────────────────────┘
 *
 * The symbol hovers using a simple CSS keyframe float.
 * All logic is passed down from DashboardLayout via SharedDashboardProps.
 */

import React, { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SharedDashboardProps, AgentMode } from './DashboardLayout';

// ─── Lazy engine pages ────────────────────────────────────────────────────────
const BuyerEngine    = lazy(() => import('./engines/BuyerEngine'));
const ListingEngine  = lazy(() => import('./engines/ListingEngine'));
const InvestorEngine = lazy(() => import('./engines/InvestorEngine'));
const FlipperEngine  = lazy(() => import('./engines/FlipperEngine'));

// ─── Engine identity map ──────────────────────────────────────────────────────

const ENGINE_META: Record<AgentMode, { label: string; color: string; subLabel: string }> = {
  buying:   { label: 'Buying Agent',   color: '#6366f1', subLabel: 'Identify & acquire'  },
  listing:  { label: 'Listing Agent',  color: '#f97316', subLabel: 'Price & position'     },
  investor: { label: 'Investor',       color: '#10b981', subLabel: 'Returns & risk'       },
  flipper:  { label: 'Flipper',        color: '#f59e0b', subLabel: 'Buy low, sell high'   },
};

// ─── Inline SVG symbols (same as EngineRoom) ──────────────────────────────────

const BuyingSymbol: React.FC<{ color: string; size?: number }> = ({ color, size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {[8, 6, 4].map((offset, i) => (
      <rect key={i} x={6 + offset} y={20 + offset} width={30} height={18}
        rx={2} fill="#1e293b" stroke={color} strokeWidth={1.5} opacity={0.7 + i * 0.15} />
    ))}
    <rect x={6} y={20} width={30} height={18} rx={2} fill="#1e293b" stroke={color} strokeWidth={2} />
    <text x="50%" y="33" dominantBaseline="middle" textAnchor="middle"
      fontSize="13" fontWeight="900" fill="#ef4444" fontFamily="monospace">$</text>
    <line x1="12" y1="26" x2="22" y2="26" stroke={color} strokeWidth="1.5" opacity="0.5" />
  </svg>
);

const ListingSymbol: React.FC<{ color: string; size?: number }> = ({ color, size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {[8, 6, 4].map((offset, i) => (
      <rect key={i} x={6 + offset} y={20 + offset} width={30} height={18}
        rx={2} fill="#1e293b" stroke={color} strokeWidth={1.5} opacity={0.7 + i * 0.15} />
    ))}
    <rect x={6} y={20} width={30} height={18} rx={2} fill="#1e293b" stroke={color} strokeWidth={2} />
    <text x="50%" y="33" dominantBaseline="middle" textAnchor="middle"
      fontSize="13" fontWeight="900" fill="#22c55e" fontFamily="monospace">$</text>
    <line x1="12" y1="26" x2="22" y2="26" stroke={color} strokeWidth="1.5" opacity="0.5" />
  </svg>
);

const InvestorSymbol: React.FC<{ color: string; size?: number }> = ({ color, size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
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
    <polyline points="6,34 13,28 20,22 27,16 36,10"
      stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <polygon points="36,6 40,14 32,12" fill={color} />
  </svg>
);

const FlipperSymbol: React.FC<{ color: string; size?: number }> = ({ color, size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x={8} y={24} width={32} height={18} rx={1}
      fill="#1e293b" stroke={color} strokeWidth={2} />
    <polygon points="4,24 24,8 44,24"
      fill="#1e293b" stroke={color} strokeWidth={2} />
    <rect x={19} y={32} width={9} height={10} rx={1}
      fill="#334155" stroke={color} strokeWidth={1} opacity={0.8} />
    <path d="M 14 28 L 16 33 L 14 38" stroke={color} strokeWidth={1}
      fill="none" opacity={0.4} />
    <rect x={28} y={27} width={7} height={6} rx={0.5}
      fill="#334155" stroke={color} strokeWidth={1} opacity={0.7} />
  </svg>
);

const SYMBOLS: Record<AgentMode, React.FC<{ color: string; size?: number }>> = {
  buying:   BuyingSymbol,
  listing:  ListingSymbol,
  investor: InvestorSymbol,
  flipper:  FlipperSymbol,
};

// ─── Floating symbol component ────────────────────────────────────────────────

const FloatingSymbol: React.FC<{ engine: AgentMode }> = ({ engine }) => {
  const { color } = ENGINE_META[engine];
  const Symbol = SYMBOLS[engine];

  return (
    <motion.div
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      className="relative"
    >
      {/* Glow behind symbol */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-40 scale-150"
        style={{ background: color }}
      />
      <div className="relative">
        <Symbol color={color} size={52} />
      </div>
    </motion.div>
  );
};

// ─── Active engine top bar ────────────────────────────────────────────────────

const EngineTopBar: React.FC<{
  engine:         AgentMode;
  onChangeEngine: () => void;
  usageCount:     number;
  monthlyLimit:   number;
  limitReached:   boolean;
}> = ({ engine, onChangeEngine, usageCount, monthlyLimit, limitReached }) => {
  const meta = ENGINE_META[engine];

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32, delay: 0.1 }}
      className="flex items-center justify-between px-6 py-4 mb-6
                 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm
                 border border-slate-200 dark:border-slate-700
                 rounded-2xl shadow-sm"
    >
      {/* Symbol + label */}
      <div className="flex items-center gap-4">
        <FloatingSymbol engine={engine} />
        <div>
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500
                        uppercase tracking-widest">Active Engine</p>
          <p className="text-lg font-black uppercase tracking-tight"
             style={{ color: meta.color }}>
            {meta.label}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {meta.subLabel}
          </p>
        </div>
      </div>

      {/* Right side: usage pill + change button */}
      <div className="flex items-center gap-3">
        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider
          ${limitReached
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
          {usageCount}/{monthlyLimit} used
        </span>

        <motion.button
          onClick={onChangeEngine}
          whileHover={{ scale: 1.04, x: 2 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black
                     uppercase tracking-widest border-2 transition-all"
          style={{
            borderColor: meta.color + '44',
            color: meta.color,
            background: meta.color + '11',
          }}
        >
          Change Engine
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Engine shell ─────────────────────────────────────────────────────────────

const EngineShell: React.FC<SharedDashboardProps> = (props) => {
  const { activeEngine, onChangeEngine, usageCount, monthlyLimit, limitReached } = props;

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">

      {/* Active engine bar */}
      <EngineTopBar
        engine={activeEngine}
        onChangeEngine={onChangeEngine}
        usageCount={usageCount}
        monthlyLimit={monthlyLimit}
        limitReached={limitReached}
      />

      {/* Engine page */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeEngine}
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          exit={{    opacity: 0, y: -12, filter: 'blur(4px)' }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        >
          <Suspense fallback={
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent
                              rounded-full animate-spin" />
            </div>
          }>
            {activeEngine === 'buying'   && <BuyerEngine    {...props} />}
            {activeEngine === 'listing'  && <ListingEngine  {...props} />}
            {activeEngine === 'investor' && <InvestorEngine {...props} />}
            {activeEngine === 'flipper'  && <FlipperEngine  {...props} />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EngineShell;
