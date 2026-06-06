/**
 * DashboardLayout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Top-level orchestrator for the dashboard experience.
 *
 * Phase state machine:
 *   welcome → room → engine
 *   (room ← engine via "Change Engine" button)
 *
 * All Supabase auth, tier fetching, region saving, zip loading,
 * and analysis submission logic lives here — identical to the
 * original MarketAlphaDashboard.tsx, just lifted to layout level
 * so all 4 engine sub-pages share it via props.
 *
 * Renders:
 *   phase='welcome' → <WelcomeAnimation>
 *   phase='room'    → <EngineRoom>
 *   phase='engine'  → <EngineShell> wrapping the active engine page
 */

import React, {
  useState, useEffect, useCallback, lazy, Suspense,
} from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuth }   from '../context/AuthContext';
import { supabase }  from '../lib/supabaseClient';
import USAmap        from '../components/USAmap';

// Lazy-load heavy components so they never block first paint
const WelcomeAnimation = lazy(() => import('./WelcomeAnimation'));
const EngineRoom       = lazy(() => import('./EngineRoom'));
const EngineShell      = lazy(() => import('./EngineShell'));

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentMode = 'buying' | 'listing' | 'investor' | 'flipper';
type DashboardPhase   = 'welcome' | 'room' | 'engine';

export interface SharedDashboardProps {
  // User & limits
  user:          any;
  usageCount:    number;
  monthlyLimit:  number;
  limitReached:  boolean;
  // Region / zip
  selectedRegionIds: string[];
  savedRegions:      string[];
  maxRegions:        number;
  selectedZip:       { value: string; label: string } | null;
  setSelectedZip:    (zip: { value: string; label: string } | null) => void;
  loadZipOptions:    (input: string) => Promise<{ value: string; label: string }[]>;
  // Map modal
  openMapModal:  () => void;
  // Analysis
  handleAnalyze: (engineName: string, engineParams: any) => Promise<void>;
  processing:    boolean;
  // Navigation
  onChangeEngine: () => void;
  activeEngine:   AgentMode;
  // Dark mode
  isDarkMode: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REGION_NAME_TO_ID: Record<string, string> = {
  northeast: '468628a4-fe88-44bb-8cc9-c3bad66acf56',
  southeast: '1214645d-b54c-4b8c-a23e-a892897d33b9',
  midwest:   '79f6a45b-a941-4781-a919-7d7c6577d34c',
  west:      '11c5fe0f-9159-4391-8fcd-8bd655dcfaf2',
};

const REGION_ID_TO_NAME: Record<string, string> = {
  '468628a4-fe88-44bb-8cc9-c3bad66acf56': 'northeast',
  '1214645d-b54c-4b8c-a23e-a892897d33b9': 'southeast',
  '79f6a45b-a941-4781-a919-7d7c6577d34c': 'midwest',
  '11c5fe0f-9159-4391-8fcd-8bd655dcfaf2': 'west',
};

// ─── Modal animation variants ─────────────────────────────────────────────────

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.18, delay: 0.05 } },
};

const modalVariants = {
  hidden:  { opacity: 0, scale: 0.88, y: 24 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 420, damping: 32 },
  },
  exit: {
    opacity: 0, scale: 0.93, y: 12,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};

// ─── Main DashboardLayout ─────────────────────────────────────────────────────

export const DashboardLayout: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── Phase machine ────────────────────────────────────────────────────────────
  const [phase,        setPhase]        = useState<DashboardPhase>('welcome');
  const [activeEngine, setActiveEngine] = useState<AgentMode>('buying');

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [isDarkMode,    setIsDarkMode]    = useState(false);
  const [isMapOpen,     setIsMapOpen]     = useState(false);
  const [processing,    setProcessing]    = useState(false);
  const [showWelcome,   setShowWelcome]   = useState(true);

  // ── Plan limits ───────────────────────────────────────────────────────────────
  const [maxRegions,   setMaxRegions]   = useState(1);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [usageCount,   setUsageCount]   = useState(0);

  // ── Region / zip ──────────────────────────────────────────────────────────────
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [savedRegions,      setSavedRegions]      = useState<string[]>([]);
  const [selectedZip,       setSelectedZip]       = useState<{ value: string; label: string } | null>(null);

  const hasAnalyzed   = usageCount > 0;
  const limitReached  = usageCount >= monthlyLimit;

  // ── Dark mode ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  // ── Check intro toggle ────────────────────────────────────────────────────────
  useEffect(() => {
    const skip = localStorage.getItem('showIntroAnimation') === 'false';
    if (skip) setPhase('room');
  }, []);

  // ── Intro via location state (from pricing page "Continue") ──────────────────
  useEffect(() => {
    if (location.state?.showIntro) {
      setShowWelcome(true);
      setPhase('welcome');
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // ── Auth guard + fetch user data ──────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/'); return; }

    const fetchUserData = async () => {
      const { data: tierData } = await supabase
        .from('user_tiers')
        .select('max_regions, max_analyses_per_month')
        .eq('user_id', user.id)
        .single();

      if (tierData) {
        setMaxRegions(tierData.max_regions || 1);
        setMonthlyLimit(tierData.max_analyses_per_month || 0);
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('user_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      setUsageCount(count || 0);

      const { data: regionData } = await supabase
        .from('user_selected_regions')
        .select('region_id')
        .eq('user_id', user.id);

      if (regionData) {
        const names = regionData
          .map(r => REGION_ID_TO_NAME[r.region_id])
          .filter(Boolean) as string[];
        setSavedRegions(names);
        setSelectedRegionIds(names);
      }
    };

    fetchUserData();
  }, [user, authLoading, navigate]);

  // ── Region helpers ────────────────────────────────────────────────────────────
  const toggleRegion = useCallback((id: string) => {
    setSelectedRegionIds(prev => {
      if (prev.includes(id)) {
        if (hasAnalyzed && savedRegions.includes(id)) {
          alert('Region locked after first analysis.');
          return prev;
        }
        return prev.filter(r => r !== id);
      }
      if (prev.length < maxRegions) return [...prev, id];
      alert(`Plan limit: ${maxRegions} region(s) max.`);
      return prev;
    });
    setSelectedZip(null);
  }, [hasAnalyzed, savedRegions, maxRegions]);

  const handleSaveRegions = useCallback(async () => {
    if (!user) { alert('No user session.'); return; }
    setProcessing(true);
    try {
      const { error: del } = await supabase
        .from('user_selected_regions').delete().eq('user_id', user.id);
      if (del) throw new Error(del.message);

      const inserts = selectedRegionIds
        .map(name => ({ user_id: user.id, region_id: REGION_NAME_TO_ID[name] }))
        .filter(i => i.region_id);

      if (inserts.length > 0) {
        const { error: ins } = await supabase
          .from('user_selected_regions').insert(inserts);
        if (ins) throw new Error(ins.message);
      }

      setSavedRegions([...selectedRegionIds]);
      alert('Regions saved!');
    } catch (err: any) {
      alert(err.message || 'Failed to save regions.');
    } finally {
      setProcessing(false);
    }
  }, [user, selectedRegionIds]);

  // ── Zip loader ────────────────────────────────────────────────────────────────
  const loadZipOptions = useCallback(async (inputValue: string) => {
    if (!inputValue || inputValue.length < 2) return [];
    const regionIds = selectedRegionIds
      .map(name => REGION_NAME_TO_ID[name])
      .filter((id): id is string => !!id);
    if (regionIds.length === 0) return [];

    const { data, error } = await supabase
      .from('zip_codes')
      .select('zip_code, city, state')
      .in('region_id', regionIds)
      .ilike('zip_code', `${inputValue}%`)
      .limit(100);

    if (error || !data) return [];
    return data.map(zip => ({
      value: zip.zip_code,
      label: `${zip.zip_code} - ${zip.city}, ${zip.state}`,
    }));
  }, [selectedRegionIds]);

  // ── Analysis submission ───────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async (
    engineName: string,
    engineParams: any,
  ) => {
    if (!user || processing) return;
    setProcessing(true);

    try {
      const { error: paramError } = await supabase
        .from(`${engineName}_parameters`).insert([engineParams]);
      if (paramError) console.error(`param insert error:`, paramError);

      const { error } = await supabase.from('user_analyses').insert([{
        user_id:       user.id,
        question:      engineParams.analysis_directive,
        zip_code:      engineParams.zip_code,
        mode:          engineName === 'buyer' ? 'buying' : engineName,
        intent_params: { engine: engineName, parameters: engineParams },
      }]);

      if (!error) {
        setUsageCount(prev => prev + 1);
        alert('Analysis request sent to core engine.');
      } else {
        alert('Error: ' + error.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  }, [user, processing]);

  // ── Phase transitions ─────────────────────────────────────────────────────────
  const handleWelcomeComplete = useCallback(() => {
    setPhase('room');
  }, []);

  const handleEngineSelect = useCallback((engine: AgentMode) => {
    setActiveEngine(engine);
    setPhase('engine');
  }, []);

  const handleChangeEngine = useCallback(() => {
    setPhase('room');
  }, []);

  // ── Shared props passed to all engine pages ───────────────────────────────────
  const sharedProps: SharedDashboardProps = {
    user,
    usageCount,
    monthlyLimit,
    limitReached,
    selectedRegionIds,
    savedRegions,
    maxRegions,
    selectedZip,
    setSelectedZip,
    loadZipOptions,
    openMapModal:  () => setIsMapOpen(true),
    handleAnalyze,
    processing,
    onChangeEngine: handleChangeEngine,
    activeEngine,
    isDarkMode,
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-900
                    dark:text-slate-100 font-sans relative overflow-hidden transition-colors duration-300">

      {/* ── Persistent header (engine phase only) ───────────────────────── */}
      <AnimatePresence>
        {phase === 'engine' && (
          <motion.header
            key="engine-header"
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -64, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b
                       border-indigo-100 dark:border-slate-800 sticky top-0 z-40
                       shadow-sm transition-colors duration-300"
          >
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-8 h-8"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-sm">
                    <defs>
                      <linearGradient id="cubeG" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4338ca" />
                        <stop offset="1" stopColor="#312e81" />
                      </linearGradient>
                    </defs>
                    <path d="M12 2L2.5 7.5V17.5L12 23L21.5 17.5V7.5L12 2Z"
                      fill="url(#cubeG)" stroke="#6366f1" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M12 2V12.5M21.5 7.5L12 12.5M2.5 7.5L12 12.5"
                      stroke="#6366f1" strokeWidth="0.5" strokeLinecap="round"/>
                    <line x1="-1" y1="13" x2="25" y2="13"
                      stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </motion.div>
                <h1 className="text-lg font-black tracking-tight text-slate-900
                               dark:text-white uppercase hidden md:block">HYDREL</h1>
              </Link>

              <div className="flex items-center gap-4">
                {/* Dark mode toggle */}
                <motion.button
                  onClick={toggleDarkMode}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg
                             bg-slate-50 dark:bg-slate-800 border border-slate-200
                             dark:border-slate-700 transition-colors"
                >
                  {isDarkMode
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                      </svg>
                  }
                </motion.button>

                {/* Plans */}
                <motion.button
                  onClick={() => navigate('/market-alpha/pricing')}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700
                             dark:text-indigo-300 rounded-full text-xs font-bold
                             hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800
                             transition-all shadow-sm"
                >
                  Plans
                </motion.button>

                {/* Operator */}
                <div className="text-right hidden lg:block">
                  <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">
                    Operator
                  </p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                    {user?.email}
                  </p>
                </div>

                {/* Sign out */}
                <motion.button
                  onClick={signOut}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="p-2 text-slate-400 hover:text-red-500 bg-slate-50
                             dark:bg-slate-800 rounded-lg border border-slate-200
                             dark:border-slate-700 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── Phase renders ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Welcome */}
        {phase === 'welcome' && (
          <Suspense fallback={null} key="welcome">
            <WelcomeAnimation onComplete={handleWelcomeComplete} />
          </Suspense>
        )}

        {/* Engine room orbital selector */}
        {phase === 'room' && (
          <Suspense fallback={null} key="room">
            <EngineRoom onEngineSelect={handleEngineSelect} />
          </Suspense>
        )}

        {/* Active engine parameter page */}
        {phase === 'engine' && (
          <motion.div
            key="engine-page"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Suspense fallback={null}>
              <EngineShell {...sharedProps} />
            </Suspense>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ════════════ MAP MODAL ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {isMapOpen && (
          <>
            <motion.div
              key="map-backdrop"
              variants={backdropVariants}
              initial="hidden" animate="visible" exit="exit"
              onClick={() => setIsMapOpen(false)}
              className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm"
            />
            <motion.div
              key="map-panel"
              variants={modalVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed inset-4 md:inset-8 z-[101] bg-white dark:bg-slate-800
                         rounded-3xl overflow-hidden shadow-2xl border border-slate-100
                         dark:border-slate-700 flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b
                              border-slate-100 dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white
                                 uppercase tracking-tight">Select Analysis Region</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {selectedRegionIds.length}/{maxRegions} region{maxRegions !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMapOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700
                             flex items-center justify-center text-slate-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </motion.button>
              </div>

              <div className="flex-1 overflow-hidden">
                <USAmap
                  selectedRegions={selectedRegionIds}
                  onRegionClick={toggleRegion}
                  maxRegions={maxRegions}
                  lockedRegions={hasAnalyzed ? savedRegions : []}
                />
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-4">
                <motion.button
                  onClick={() => setSelectedRegionIds(savedRegions)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200
                             dark:border-slate-700 text-slate-600 dark:text-slate-300
                             font-black text-xs uppercase tracking-widest rounded-2xl
                             hover:bg-slate-50 transition-all"
                >
                  Reset
                </motion.button>
                <motion.button
                  onClick={async () => { await handleSaveRegions(); setIsMapOpen(false); }}
                  disabled={processing}
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 bg-indigo-600 text-white font-black text-xs
                             uppercase tracking-widest rounded-2xl shadow-lg
                             shadow-indigo-600/20 hover:bg-indigo-700 transition-all
                             disabled:opacity-60"
                >
                  {processing ? 'Saving…' : 'Save Regions'}
                </motion.button>
              </div>

              <div className="px-6 pb-4">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                  {hasAnalyzed
                    ? '⚠ Regions locked after first analysis.'
                    : 'Freely change regions before saving.'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
