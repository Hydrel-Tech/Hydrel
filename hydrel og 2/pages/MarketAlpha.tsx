import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from '../components/LoginModal';
import { SplineMarketScene } from '../components/SplineMarketScene';

// ─────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────

const useCountUp = (target: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
};


const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// ─────────────────────────────────────────
// STAT COUNTER COMPONENT
// ─────────────────────────────────────────

interface StatProps {
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

const StatCounter: React.FC<StatProps> = ({ value, suffix, label, prefix = '' }) => {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center group">
      <p className="text-3xl md:text-4xl font-black text-white mb-1">
        {prefix}
        <span className="text-emerald-300">{count.toLocaleString()}</span>
        {suffix}
      </p>
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400/70">{label}</p>
    </div>
  );
};

// ─────────────────────────────────────────
// MARKET ALPHA PAGE
// ─────────────────────────────────────────

export const MarketAlpha: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // ── ALL ORIGINAL LOGIC UNTOUCHED ──
  const handleGetSystem = () => {
    if (user) {
      navigate('/market-alpha/pricing');
    } else {
      setIsLoginOpen(true);
    }
  };

  // Section refs for inView
  const overviewRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const overviewInView = useInView(overviewRef, { once: true, margin: '-80px' });
  const techInView = useInView(techRef, { once: true, margin: '-80px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  return (
    <div className="bg-[#f6f9fc] dark:bg-slate-900 min-h-screen transition-colors duration-300">

      {/* ── BACK NAV ── */}
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-4 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-emerald-900 dark:bg-emerald-950 -mt-2">
        {/* Background texture */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full transform skew-y-[-3deg] origin-top-left bg-emerald-800/30 translate-y-[-10%]" />
          <div className="absolute bottom-0 right-0 w-2/3 h-full bg-gradient-to-tl from-teal-500/20 to-emerald-600/20 blur-3xl rounded-full" />
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT — text content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-white"
          >
            <motion.div variants={fadeUp}>
              <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-xs font-bold uppercase tracking-widest mb-6">
                Architecture 01
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              >
                Real Estate Investment Analytics
              </motion.h1>
            </motion.div>

            <motion.p variants={fadeUp} className="text-xl text-emerald-100 max-w-lg leading-relaxed mb-8">
              The "Deal Finder" — A structural framework that scans markets to find
              and evaluate profitable property deals automatically.
            </motion.p>

            <motion.div variants={fadeUp}>
              <div className="inline-block px-5 py-2.5 rounded-xl bg-amber-400/20 border border-amber-400/40 shadow-sm">
                <p className="text-sm font-bold text-amber-300 tracking-wide">
                  Secure <span className="font-black text-amber-200">AT LEAST ONE</span> extra deal monthly
                </p>
              </div>
            </motion.div>

            {/* HUD data strip */}
            <motion.div variants={fadeUp} className="mt-10 flex gap-6 flex-wrap">
              {[
                { label: 'Status', value: 'ACTIVE', color: 'text-emerald-300' },
                { label: 'Architecture', value: '01', color: 'text-white' },
                { label: 'Deploy Time', value: '48 hrs', color: 'text-teal-300' },
              ].map((item) => (
                <div key={item.label} className="border-l-2 border-emerald-500/40 pl-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-0.5">{item.label}</p>
                  <p className={`text-sm font-black ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

        {/* RIGHT — Spline orbital scene */}
<div className="relative h-[420px] lg:h-[520px] rounded-2xl overflow-hidden">

  {/* Ambient glow blob (kept for depth) */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none z-0" />

  {/* Spline scene — fills the entire container */}
  <SplineMarketScene />

  {/* Interaction hint */}
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 3, duration: 1 }}
    className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase text-emerald-400/50 pointer-events-none z-30"
  >
    Touch to interact
  </motion.p>

  {/* Corner brackets */}
  <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-emerald-400/25 pointer-events-none z-30" />
  <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-emerald-400/25 pointer-events-none z-30" />
  <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-emerald-400/25 pointer-events-none z-30" />
  <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-emerald-400/25 pointer-events-none z-30" />
</div>
        </div>

        {/* ── STAT STRIP ── */}
        <div className="border-t border-emerald-800/60 bg-emerald-950/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter value={50000} suffix="+" label="Nodes Scanned Daily" />
            <StatCounter value={99} suffix="%" label="Data Accuracy" />
            <StatCounter value={48} suffix="hr" label="Deployment Time" />
            <StatCounter value={1} suffix="%" label="False Signal Rate" prefix="<" />
          </div>
        </div>
      </div>

      {/* ── SYSTEM OVERVIEW ── */}
      <div ref={overviewRef} className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={overviewInView ? 'visible' : 'hidden'}
        >
          <motion.h2 variants={fadeLeft} className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
            System Overview
          </motion.h2>

          <motion.div
            variants={fadeUp}
            className="relative p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50 overflow-hidden transition-colors duration-300"
          >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-l-3xl" />

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium transition-colors duration-300">
              Instead of paying thousands of dollars for Bloomberg terminals or premium data feeds,
              this "Deal Finder" service stitches together free, high-quality data sources to
              democratize institutional-grade analysis.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 transition-colors duration-300">
              In highly competitive real estate markets, speed and data are the only real advantages.
              This system acts as an automated analyst that doesn't just look for houses, but
              "underwrites" them instantly.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
              By combining listing prices with deep neighborhood data and rental estimates, the
              architecture calculates potential returns before a human ever looks at the property.
              It filters out the 99% of "noise" to present only the top 1% of investment
              opportunities that meet strict profitability criteria.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── TECHNICAL ANALYSIS ── */}
      <div ref={techRef} className="max-w-4xl mx-auto px-6 pb-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={techInView ? 'visible' : 'hidden'}
        >
          <motion.h2
            variants={fadeLeft}
            className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3 transition-colors duration-300"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </span>
            Technical Analysis
          </motion.h2>

          <div className="space-y-5">
            {[
              {
                id: '3.2.1',
                title: 'Autonomous Market Ingestion',
                body: 'The architecture employs a decentralized intake protocol that continuously monitors market availability across fractured endpoints. Rather than relying on static feeds, the system actively queries localized indices to ensure real-time fidelity of asset availability, pricing latency, and visual condition markers.',
              },
              {
                id: '3.2.2',
                title: 'Contextual Demographic Layering',
                body: 'Raw asset data is insufficient for institutional decision-making. The system automatically overlays high-dimensional socioeconomic vectors onto every target asset. This includes longitudinal trends in household economics, population density shifts, and stability metrics, allowing for an immediate assessment of neighborhood gentrification trajectories and long-term holding viability.',
              },
              {
                id: '3.2.3',
                title: 'Predictive Yield Modeling',
                body: "To move beyond simple price-per-square-foot analysis, the infrastructure utilizes a multi-stage funnel for valuation. By cross-referencing localized rental performance data with acquisition costs, the system synthesizes a projected profitability index. This ensures that only assets with a mathematically probable spread between cap rate and cost of capital are surfaced for review.",
              },
              {
                id: '3.3',
                title: 'The Reasoning Engine',
                body: 'The final layer of the architecture is a probabilistic reasoning engine that acts as a synthetic underwriter. It ingests the aggregated technical and demographic data to produce a qualitative narrative risk assessment. This output mimics senior analyst scrutiny, identifying non-numerical risks and advantages to provide a "go/no-go" recommendation with explainable logic.',
              },
            ].map((section, i) => (
              <motion.div
                key={section.id}
                variants={fadeUp}
                transition={{ delay: i * 0.07 }}
                className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
              >
                {/* Hover left accent */}
                <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex items-start gap-4">
                  <span className="shrink-0 font-mono text-[11px] font-black text-emerald-500 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900">
                    {section.id}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">
                      {section.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm transition-colors duration-300">
                      {section.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── CTA ── */}
      <div ref={ctaRef} className="max-w-4xl mx-auto px-6 pb-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={ctaInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          {/* Glow behind button */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500/25 blur-2xl rounded-full scale-150 animate-pulse" />
            <motion.button
              onClick={handleGetSystem}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative px-12 py-5 bg-emerald-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 transition-colors duration-200 text-base tracking-wide"
            >
              Get System
            </motion.button>
          </div>
          <p className="mt-5 text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors duration-300">
            Deployed within 48 hours to secure infrastructure.
          </p>
        </motion.div>
      </div>

      {/* ── LOGIN MODAL (unchanged) ── */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};
