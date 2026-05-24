/**
 * MarketAlphaDashboard.tsx  —  3D UI Transform
 * ═════════════════════════════════════════════
 * Tech layers (bottom → top):
 *   [0] R3FBackground     – lazy WebGL floating shapes (fixed, pointer-events-none)
 *   [1] Static bg image   – existing hero-bg.webp gradient
 *   [10+] DOM / Tailwind  – all interactive UI
 *
 * Animation philosophy:
 *   • Framer Motion handles every layout transition, hover, press & modal
 *   • R3F handles background + EngineViewer (Option C)
 *   • CSS 3D perspective + Framer Motion rotateY = card flip (Option B)
 *   • AnimatePresence wraps every conditional render (modals, panels, zip selector)
 *
 * All original business logic (Supabase, auth, routing, validation) is 100% preserved.
 */

import React, {
  useState, useEffect, useRef, lazy, Suspense, useCallback,
} from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import { FixedSizeList as List } from 'react-window';
import {
  motion, AnimatePresence, useMotionValue, useSpring,
} from 'framer-motion';

import { useAuth }             from '../context/AuthContext';
import { supabase }            from '../lib/supabaseClient';
import USAmap                  from '../components/USAmap';
import DashboardIntroOverlay   from '../components/DashboardIntroOverlay';

// Lazy-load heavy 3D components so they never block the main thread
const R3FBackground = lazy(() => import('../components/R3FBackground'));
const EngineViewer  = lazy(() => import('../components/EngineViewer'));

// ─── Types & Constants ────────────────────────────────────────────────────────

type AgentMode = 'buying' | 'listing' | 'investor' | 'flipper';

interface PropertySpecs {
  min_sqft:   string;
  max_sqft:   string;
  beds:       string;
  bathrooms:  string;
  status:     string;
  sort:       string;
}

const BUYER_DROPDOWNS = [
  { id: 'focus',    label: 'Analysis Focus',       options: ['Making an Offer','Investment Analysis','Comparison Shopping','Risk Assessment','Long-term Value'], required: true },
  { id: 'concerns', label: 'Specific Concerns',    options: ['School Quality','Flood Risk','Noise/Traffic','Future Resale','Renovation Needs','HOA Issues','Crime/Safety'], required: true },
  { id: 'horizon',  label: 'Investment Horizon',   options: ['Short-term (<3 yrs)','Medium (3-7 yrs)','Long-term (7+ yrs)'], required: true },
  { id: 'posture',  label: 'Negotiation Posture',  options: ['Aggressive – Lowest Possible','Balanced – Fair Market','Competitive – Must Win','Cautious – Risk Averse'], required: true },
];

const LISTING_DROPDOWNS = [
  { id: 'goal',     label: 'Listing Goal',         options: ['Price Optimization','Fast Sale','Premium Positioning','Competitive Edge','Investor Targeting','Maximize Prize'], required: true },
  { id: 'timeline', label: 'Seller Timeline',      options: ['Immediate (<30 days)','Flexible (30-60 days)','Patient (60+ days)'], required: true },
  { id: 'target',   label: 'Target Buyer',         options: ['First-Time Buyers','Families','Empty Nesters','Investors','Luxury Buyers','No Preference'], required: true },
  { id: 'stance',   label: 'Competitive Stance',   options: ['Price Leader (Below Market)','Market Matched','Premium Positioned','Luxury Niche'], required: true },
];

const SHARED_DROPDOWNS = [
  { id: 'beds',       label: 'Bedrooms',  options: ['Any','1+','2+','3+','4+','5+'] },
  { id: 'bathrooms',  label: 'Bathrooms', options: ['Any','1+','2+','3+','4+','5+'] },
  { id: 'status',     label: 'Status',    options: ['Active Only','Active + Pending','All (Include Sold)'] },
  { id: 'sort',       label: 'Sort By',   options: ['Relevance','Price (Low to High)','Price (High to Low)','Newest First','Days on Market'] },
];

const LISTING_CONDITION_DROPDOWNS = [
  { id: 'kitchen_condition',  label: 'Kitchen Condition',  options: ['Run down','Average','Good','Newly renovated'] },
  { id: 'bathroom_condition', label: 'Bathroom Condition', options: ['Run down','Average','Good','Newly renovated'] },
  { id: 'garage_condition',   label: 'Garage Condition',   options: ['Run down','Average','Good','Newly renovated','N/A'] },
  { id: 'overall_condition',  label: 'Overall Condition',  options: ['Run down','Average','Good','Newly renovated'] },
];

const ENGINE_OPTIONS: { id: AgentMode; label: string; icon: string }[] = [
  { id: 'listing',  label: 'Listing Agent', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'buying',   label: 'Buying Agent',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'investor', label: 'Investor',      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'flipper',  label: 'Flipper',       icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

const ENGINE_COLORS: Record<AgentMode, string> = {
  buying:   '#6366f1',
  listing:  '#f97316',
  investor: '#10b981',
  flipper:  '#f59e0b',
};

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

const REGION_STATES = {
  northeast: [
    { abbr:'CT',name:'Connecticut' },{ abbr:'MA',name:'Massachusetts' },{ abbr:'ME',name:'Maine' },
    { abbr:'NH',name:'New Hampshire' },{ abbr:'NJ',name:'New Jersey' },{ abbr:'NY',name:'New York' },
    { abbr:'PA',name:'Pennsylvania' },{ abbr:'RI',name:'Rhode Island' },{ abbr:'VT',name:'Vermont' },
    { abbr:'DE',name:'Delaware' },{ abbr:'MD',name:'Maryland' },{ abbr:'DC',name:'District of Columbia' },
  ],
  southeast: [
    { abbr:'VA',name:'Virginia' },{ abbr:'WV',name:'West Virginia' },{ abbr:'NC',name:'North Carolina' },
    { abbr:'SC',name:'South Carolina' },{ abbr:'GA',name:'Georgia' },{ abbr:'FL',name:'Florida' },
    { abbr:'AL',name:'Alabama' },{ abbr:'MS',name:'Mississippi' },{ abbr:'TN',name:'Tennessee' },
    { abbr:'KY',name:'Kentucky' },
  ],
  midwest: [
    { abbr:'OH',name:'Ohio' },{ abbr:'IN',name:'Indiana' },{ abbr:'MI',name:'Michigan' },
    { abbr:'IA',name:'Iowa' },{ abbr:'MN',name:'Minnesota' },{ abbr:'MT',name:'Montana' },
    { abbr:'ND',name:'North Dakota' },{ abbr:'SD',name:'South Dakota' },{ abbr:'WI',name:'Wisconsin' },
    { abbr:'IL',name:'Illinois' },{ abbr:'KS',name:'Kansas' },{ abbr:'MO',name:'Missouri' },
    { abbr:'NE',name:'Nebraska' },
  ],
  west: [
    { abbr:'AR',name:'Arkansas' },{ abbr:'LA',name:'Louisiana' },{ abbr:'OK',name:'Oklahoma' },
    { abbr:'TX',name:'Texas' },{ abbr:'AZ',name:'Arizona' },{ abbr:'CO',name:'Colorado' },
    { abbr:'ID',name:'Idaho' },{ abbr:'NM',name:'New Mexico' },{ abbr:'NV',name:'Nevada' },
    { abbr:'UT',name:'Utah' },{ abbr:'WY',name:'Wyoming' },{ abbr:'AK',name:'Alaska' },
    { abbr:'CA',name:'California' },{ abbr:'HI',name:'Hawaii' },{ abbr:'OR',name:'Oregon' },
    { abbr:'WA',name:'Washington' },
  ],
};

const ITEM_HEIGHT    = 35;
const MAX_MENU_HEIGHT = 300;

// ─── Animation Variants ───────────────────────────────────────────────────────

/** Page-level stagger container */
const pageVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

/** Individual panel / card entrance */
const cardVariants = {
  hidden:  { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
};

/** Engine params cross-fade */
const enginePanelVariants = {
  enter: { opacity: 0, y: 14, filter: 'blur(6px)' },
  center: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 380, damping: 34 },
  },
  exit: {
    opacity: 0, y: -10, filter: 'blur(4px)',
    transition: { duration: 0.14, ease: 'easeIn' },
  },
};

/** Modal backdrop */
const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.18, delay: 0.05 } },
};

/** Spring-physics modal panel */
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

/** Bottom-sheet slide-up (mobile engine modal) */
const sheetVariants = {
  hidden:  { opacity: 0, y: '100%' },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 35 },
  },
  exit: {
    opacity: 0, y: '80%',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/** Stagger for checkbox pill groups */
const pillGroupVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const pillVariants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 28 } },
};

// ─── Virtualized Menu List (unchanged) ────────────────────────────────────────

const VirtualizedMenuList = (props: any) => {
  const { options, children, maxHeight, getValue } = props;
  const childrenArray = React.Children.toArray(children);
  const [selectedValue] = getValue();
  const initialOffset = selectedValue ? options.indexOf(selectedValue) * ITEM_HEIGHT : 0;
  const height = Math.min(maxHeight || MAX_MENU_HEIGHT, childrenArray.length * ITEM_HEIGHT);

  if (childrenArray.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        No matching zip codes
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={childrenArray.length}
      itemSize={ITEM_HEIGHT}
      initialScrollOffset={initialOffset}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{childrenArray[index]}</div>
      )}
    </List>
  );
};

// ─── EngineViewer skeleton fallback ──────────────────────────────────────────

const EngineViewerFallback: React.FC = () => (
  <div className="h-40 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Engine…</span>
  </div>
);

// ─── FlipCard engine button (Options B + partial C label) ─────────────────────

interface FlipCardProps {
  engine:    { id: AgentMode; label: string; icon: string };
  isActive:  boolean;
  onClick:   () => void;
}

const FlipCard: React.FC<FlipCardProps> = ({ engine, isActive, onClick }) => {
  const activeColor = ENGINE_COLORS[engine.id];

  return (
    // Perspective wrapper — MUST NOT be a motion element (causes Safari bugs)
    <div style={{ perspective: '900px' }} className="relative h-[88px]">
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isActive ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.93 }}
        onClick={onClick}
      >
        {/* ── Front face (inactive) ─────────────────────────────────────── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl
                     bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700
                     text-slate-400 dark:text-slate-500 transition-colors"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={engine.icon} />
            </svg>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">{engine.label}</span>
        </div>

        {/* ── Back face (active) ────────────────────────────────────────── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl
                     text-white shadow-lg"
          style={{
            backfaceVisibility: 'hidden',
            transform:         'rotateY(180deg)',
            background:        `linear-gradient(135deg, ${activeColor}ee, ${activeColor}bb)`,
            boxShadow:         `0 8px 30px ${activeColor}55`,
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={engine.icon} />
            </svg>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">{engine.label}</span>
          <span className="text-[8px] font-bold bg-white/25 px-2 py-0.5 rounded-full">ACTIVE</span>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const MarketAlphaDashboard: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [showIntro,          setShowIntro]          = useState(false);
  const [isDarkMode,         setIsDarkMode]         = useState(false);
  const [agentMode,          setAgentMode]          = useState<AgentMode>('buying');
  const [isMapOpen,          setIsMapOpen]          = useState(false);
  const [isEngineModalOpen,  setIsEngineModalOpen]  = useState(false);
  const [showConfirmModal,   setShowConfirmModal]   = useState(false);

  // ── Property specs ──────────────────────────────────────────────────────────
  const [propertySpecs, setPropertySpecs] = useState<PropertySpecs>({
    min_sqft: '', max_sqft: '', beds: 'Any', bathrooms: 'Any',
    status: 'Active Only', sort: 'Relevance',
  });

  // ── Engine-specific params ──────────────────────────────────────────────────
  const [buyingParams, setBuyingParams] = useState({
    budget: '', min_price: '', max_price: '', occupant_count: '',
    school_distance: '', bedrooms_preference: '', safety_priority: 'medium',
  });
  const [listingParams,          setListingParams]          = useState({ improvement_budget: '' });
  const [listingConditionParams, setListingConditionParams] = useState({
    kitchen_condition: 'Average', bathroom_condition: 'Average',
    garage_condition: 'Average',  overall_condition: 'Average',
  });
  const [investorParams, setInvestorParams] = useState({
    target_cap_rate: '', risk_tolerance: 'medium', holding_period: '',
    down_payment_percentage: '', max_purchase_price: '',
    min_price: '', max_price: '', preferred_financing: '',
  });
  const [flipperParams, setFlipperParams] = useState({
    purchase_price: '', min_price: '', max_price: '',
    renovation_budget: '', target_profit: '',
    target_profit_type: 'usd', holding_period: '',
  });

  const [formState,      setFormState]      = useState<Record<string, string>>({});
  const [selectedParams, setSelectedParams] = useState<Record<string, string[]>>({
    focus: [], concerns: [], horizon: [], posture: [],
    goal: [], timeline: [], target: [], stance: [],
  });

  // ── Region / zip / query ────────────────────────────────────────────────────
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [savedRegions,      setSavedRegions]      = useState<string[]>([]);
  const [selectedZip,       setSelectedZip]       = useState<{ value: string; label: string } | null>(null);
  const [question,          setQuestion]          = useState('');
  const [processing,        setProcessing]        = useState(false);

  // ── Plan limits ─────────────────────────────────────────────────────────────
  const [maxRegions,    setMaxRegions]    = useState(1);
  const [monthlyLimit,  setMonthlyLimit]  = useState(0);
  const [usageCount,    setUsageCount]    = useState(0);

  const hasAnalyzed        = usageCount > 0;
  const showConfirmToggle  = localStorage.getItem('showReportConfirmation') !== 'false';
  const limitReached       = usageCount >= monthlyLimit;
  const isFormValid        = selectedRegionIds.length > 0 && !!selectedZip?.value
                           && question.length > 0 && !limitReached;

  // ── Dark mode ────────────────────────────────────────────────────────────────
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

  // ── Intro overlay ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.showIntro) {
      setShowIntro(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // ── Fetch user data ──────────────────────────────────────────────────────────
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

  // ── Region / zip helpers ─────────────────────────────────────────────────────
  const toggleRegion = (id: string) => {
    setSelectedRegionIds(prev => {
      if (prev.includes(id)) {
        if (hasAnalyzed && savedRegions.includes(id)) {
          alert('Region locked: You cannot remove regions after performing an analysis.');
          return prev;
        }
        return prev.filter(r => r !== id);
      }
      if (prev.length < maxRegions) {
        return [...prev, id];
      } else {
        alert(`Plan limit reached: You can only select ${maxRegions} region(s).`);
        return prev;
      }
    });
    setSelectedZip(null);
  };

  const handleSaveRegions = async () => {
    if (!user) { alert('No user session found.'); return; }
    setProcessing(true);
    try {
      const { error: deleteError } = await supabase
        .from('user_selected_regions').delete().eq('user_id', user.id);
      if (deleteError) throw new Error(deleteError.message);

      const inserts = selectedRegionIds
        .map(name => ({ user_id: user.id, region_id: REGION_NAME_TO_ID[name] }))
        .filter(i => i.region_id !== undefined);

      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('user_selected_regions').insert(inserts);
        if (insertError) throw new Error(insertError.message);
      }

      setSavedRegions([...selectedRegionIds]);
      alert('Regions saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save regions.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => setSelectedRegionIds(savedRegions);

  // ── Zip async loader ─────────────────────────────────────────────────────────
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

  const debounce = (fn: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };
  const debouncedLoadOptions = debounce(
    (inputValue: string, callback: (opts: any[]) => void) => {
      loadZipOptions(inputValue).then(callback);
    },
    300,
  );

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const handleDropdownChange = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [`${agentMode}_${key}`]: value }));
  };

  const handleParamToggle = (groupId: string, option: string) => {
    setSelectedParams(prev => {
      const current = prev[groupId] || [];
      if (current.includes(option)) {
        return { ...prev, [groupId]: current.filter(o => o !== option) };
      }
      if (agentMode === 'listing') {
        if (groupId === 'goal' && current.length >= 2) return prev;
        if (groupId === 'timeline') return { ...prev, [groupId]: [option] };
      }
      return { ...prev, [groupId]: [...current, option] };
    });
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validatePriceRange = (precise: string, min: string, max: string): boolean => {
    const p = parseFloat(precise), mn = parseFloat(min), mx = parseFloat(max);
    if (isNaN(p) || (isNaN(mn) && isNaN(mx))) return true;
    if (!isNaN(mn) && !isNaN(mx)) {
      if (mn > mx) return false;
      if (!isNaN(p) && (p < mn || p > mx)) return false;
    } else if (!isNaN(mn) && !isNaN(p) && p < mn) return false;
      else if (!isNaN(mx) && !isNaN(p) && p > mx) return false;
    return true;
  };

  // ── Analyse ──────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!user || processing) return;

    const dropdowns  = agentMode === 'buying' ? BUYER_DROPDOWNS
                     : agentMode === 'listing' ? LISTING_DROPDOWNS : [];
    const missing    = dropdowns.filter(d => d.required && (selectedParams[d.id] || []).length === 0);
    if (missing.length > 0) { alert('Please fill all required parameters.'); return; }
    if (!selectedZip?.value)  { alert('Please select a valid zip code.'); return; }

    if (agentMode === 'flipper' &&
        !validatePriceRange(flipperParams.purchase_price, flipperParams.min_price, flipperParams.max_price)) {
      alert('Invalid price configuration.'); return;
    }
    if (agentMode === 'investor' && investorParams.min_price && investorParams.max_price &&
        parseFloat(investorParams.min_price) > parseFloat(investorParams.max_price)) {
      alert('Invalid price range.'); return;
    }
    if (agentMode === 'buying' &&
        !validatePriceRange(buyingParams.budget, buyingParams.min_price, buyingParams.max_price)) {
      alert('Invalid price configuration.'); return;
    }

    if (showConfirmToggle && !showConfirmModal) { setShowConfirmModal(true); return; }

    setProcessing(true);
    setShowConfirmModal(false);

    let engineName: 'buyer' | 'listing' | 'investor' | 'flipper' = 'buyer';
    let engineParams: any = {};

    if (agentMode === 'buying') {
      engineName   = 'buyer';
      engineParams = {
        zip_code: selectedZip.value,
        min_price: Number(buyingParams.min_price) || null,
        max_price: Number(buyingParams.max_price) || null,
        min_sqft: Number(propertySpecs.min_sqft) || null,
        max_sqft: Number(propertySpecs.max_sqft) || null,
        bedrooms: propertySpecs.beds,
        bathrooms: propertySpecs.bathrooms,
        status: propertySpecs.status,
        sort_by: propertySpecs.sort,
        budget: Number(buyingParams.budget) || 0,
        family_size: Number(buyingParams.occupant_count) || 0,
        school_distance: Number(buyingParams.school_distance) || 0,
        min_bedrooms: Number(buyingParams.bedrooms_preference) || 0,
        safety_priority: buyingParams.safety_priority.charAt(0).toUpperCase() + buyingParams.safety_priority.slice(1),
        analysis_focus: (selectedParams.focus || []).join(', '),
        specific_concerns: selectedParams.concerns || [],
        investment_horizon: (selectedParams.horizon || []).join(', '),
        negotiation_posture: (selectedParams.posture || []).join(', '),
        analysis_directive: question,
        condition_preference: 'Any',
        garage: 'Any',
      };
    } else if (agentMode === 'listing') {
      engineName   = 'listing';
      engineParams = {
        zip_code: selectedZip.value,
        sqft: Number(propertySpecs.min_sqft) || 0,
        bedrooms: Number(propertySpecs.beds.replace('+', '')) || 0,
        bathrooms_full: Number(propertySpecs.bathrooms.replace('+', '')) || 0,
        bathrooms_half: 0, lot_size_sqft: null, year_built: null,
        seller_goal: (selectedParams.goal || []).join(', '),
        improvement_budget: Number(listingParams.improvement_budget) || 0,
        timeline: (selectedParams.timeline || []).join(', '),
        target_buyer: (selectedParams.target || []).join(', '),
        competitive_stance: (selectedParams.stance || []).join(', '),
        kitchen_condition:  listingConditionParams.kitchen_condition.toLowerCase(),
        bathroom_condition: listingConditionParams.bathroom_condition.toLowerCase(),
        garage_condition:   listingConditionParams.garage_condition === 'N/A' ? 'NA' : listingConditionParams.garage_condition,
        overall_condition:  listingConditionParams.overall_condition.toLowerCase(),
        analysis_directive: question,
      };
    } else if (agentMode === 'investor') {
      engineName   = 'investor';
      engineParams = {
        zip_code: selectedZip.value,
        min_price: Number(investorParams.min_price) || 0,
        max_price: Number(investorParams.max_price) || 0,
        min_sqft: Number(propertySpecs.min_sqft) || 0,
        max_sqft: Number(propertySpecs.max_sqft) || 0,
        bedrooms: propertySpecs.beds, bathrooms: propertySpecs.bathrooms,
        status: propertySpecs.status, sort_by: propertySpecs.sort,
        target_cap_rate: Number(investorParams.target_cap_rate) || 0,
        risk_tolerance: investorParams.risk_tolerance.charAt(0).toUpperCase() + investorParams.risk_tolerance.slice(1),
        holding_period: Number(investorParams.holding_period) || 0,
        down_payment_percent: Number(investorParams.down_payment_percentage) || 0,
        analysis_directive: question,
        mortgage_rate: null, garage: 'Any',
      };
    } else if (agentMode === 'flipper') {
      engineName   = 'flipper';
      engineParams = {
        zip_code: selectedZip.value,
        min_price: Number(flipperParams.min_price) || 0,
        max_price: Number(flipperParams.max_price) || 0,
        min_sqft: Number(propertySpecs.min_sqft) || 0,
        max_sqft: Number(propertySpecs.max_sqft) || 0,
        bedrooms: propertySpecs.beds, bathrooms: propertySpecs.bathrooms,
        status: propertySpecs.status, sort_by: propertySpecs.sort,
        purchase_price: Number(flipperParams.purchase_price) || 0,
        renovation_budget: Number(flipperParams.renovation_budget) || 0,
        target_profit: flipperParams.target_profit + (flipperParams.target_profit_type === 'percentage' ? '%' : ''),
        holding_period: Number(flipperParams.holding_period) || 0,
        analysis_directive: question,
        condition_preference: 'Needs Work', garage: 'Any',
      };
    }

    try {
      const { error: paramError } = await supabase
        .from(`${engineName}_parameters`).insert([engineParams]);
      if (paramError) console.error(`Error inserting into ${engineName}_parameters:`, paramError);

      const { error } = await supabase.from('user_analyses').insert([{
        user_id: user.id,
        question,
        zip_code: selectedZip.value,
        mode: agentMode,
        property_specs: propertySpecs,
        intent_params: { engine: engineName, parameters: engineParams },
      }]);

      if (!error) {
        setUsageCount(prev => prev + 1);
        alert('Analysis request sent to core engine.');
      } else {
        alert('Error recording analysis: ' + error.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  // ── Shared render helpers ─────────────────────────────────────────────────────

  const renderCheckboxGroup = (label: string, id: string, options: string[]) => {
    const selected = selectedParams[id] || [];
    return (
      <div key={id} className="relative z-10 space-y-3 pb-2">
        <label className="block text-xs text-slate-500 dark:text-slate-400 font-bold mb-2 ml-1">
          {label}
        </label>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          variants={pillGroupVariants}
          initial="hidden"
          animate="visible"
        >
          {options.map(opt => {
            const isActive = selected.includes(opt);
            return (
              <motion.button
                key={opt}
                variants={pillVariants}
                onClick={() => handleParamToggle(id, opt)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.94 }}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  isActive
                    ? 'bg-orange-500 border-orange-600 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-purple-50/60 dark:bg-slate-800 border-indigo-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-500'
                }`}
              >
                {opt}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    );
  };

  const inputClass =
    'w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 ' +
    'rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 focus:outline-none ' +
    'transition-all dark:text-white';

  const selectClass =
    inputClass + ' appearance-none';

  // ── Styled section wrapper ────────────────────────────────────────────────────
  const SectionCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <motion.div
      variants={cardVariants}
      className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans relative overflow-hidden transition-colors duration-300">

      {/* ── Layer 0: R3F background (lazy, never blocks render) ─────────────── */}
      <Suspense fallback={null}>
        <R3FBackground />
      </Suspense>

      {/* ── Layer 1: Static bg image + gradient ─────────────────────────────── */}
      <div className="fixed inset-0 z-[1] opacity-[0.55] pointer-events-none">
        <img
          src="/images/hero-bg.webp"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8fafc]/50 dark:via-slate-900/50 to-[#f8fafc] dark:to-slate-900" />
      </div>

      {/* ── Layer 10+: DOM ───────────────────────────────────────────────────── */}
      <div className="relative z-10">

        {/* ════════════════ HEADER ═════════════════════════════════════════════ */}
        <motion.header
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-indigo-100 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-300"
        >
          <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                  className="relative w-8 h-8"
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-sm">
                    <defs>
                      <linearGradient id="cubeGradientDash" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4338ca" /><stop offset="1" stopColor="#312e81" />
                      </linearGradient>
                    </defs>
                    <path d="M12 2L2.5 7.5V17.5L12 23L21.5 17.5V7.5L12 2Z" fill="url(#cubeGradientDash)" stroke="#6366f1" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M12 2V12.5M21.5 7.5L12 12.5M2.5 7.5L12 12.5" stroke="#6366f1" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="-1" y1="13" x2="25" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
                  </svg>
                </motion.div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase hidden md:block">HYDREL</h1>
              </Link>
              <span className="text-slate-200 dark:text-slate-700 text-2xl font-thin hidden md:block">|</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase hidden sm:block">Intelligence Console</span>
            </div>

            {/* Right nav */}
            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={toggleDarkMode}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-slate-400 hover:text-indigo-500 transition-colors rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  title="Toggle Dark Mode"
                >
                  {isDarkMode ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  )}
                </motion.button>

                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="hidden sm:inline">Home</span>
                  </Link>
                </motion.div>
              </div>

              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => navigate('/market-alpha/pricing')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-all shadow-sm"
                >
                  Plans
                </motion.button>

                <div className="text-right hidden lg:block">
                  <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mb-0.5">Operator</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{user?.email}</p>
                </div>

                <motion.button
                  onClick={() => signOut()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* ════════════════ MAIN CONTENT ════════════════════════════════════════ */}
        <motion.div
          className="max-w-[1600px] mx-auto px-6 py-8"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile engine selector trigger */}
          <div className="lg:hidden mb-6">
            <motion.button
              variants={cardVariants}
              onClick={() => setIsEngineModalOpen(true)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-between p-5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-indigo-100 dark:border-slate-700 rounded-2xl shadow-sm group hover:border-indigo-400 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors"
                  style={{ backgroundColor: ENGINE_COLORS[agentMode] }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ENGINE_OPTIONS.find(e => e.id === agentMode)?.icon} />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Engine</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white uppercase">
                    {ENGINE_OPTIONS.find(e => e.id === agentMode)?.label}
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 rounded-xl border border-slate-200 dark:border-slate-600 text-[10px] font-black uppercase text-slate-500 dark:text-slate-300 group-hover:text-indigo-600 transition-all">
                Change
              </div>
            </motion.button>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:grid lg:grid-cols-[400px_1fr] gap-8">

            {/* ══ RIGHT COLUMN — map / zip / query ═══════════════════════════ */}
            <div className="flex flex-col gap-6 order-1 lg:order-2">

              {/* Region selector card */}
              <motion.div
                variants={cardVariants}
                onClick={() => setIsMapOpen(true)}
                whileHover={{ scale: 1.015, y: -4, boxShadow: '0 20px 40px rgba(249,115,22,0.12)' }}
                whileTap={{ scale: 0.985 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-orange-200 dark:border-orange-500/30 rounded-2xl p-6 md:p-8 cursor-pointer hover:border-orange-400 transition-colors group relative overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-100 dark:bg-orange-500/20 group-hover:bg-orange-500 transition-colors" />
                <div className="flex items-center justify-between relative z-10 pl-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors uppercase tracking-tight">
                      {selectedRegionIds.length === 0
                        ? 'Select Target Region'
                        : `${selectedRegionIds.length} Region${selectedRegionIds.length !== 1 ? 's' : ''} Selected`}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
                      {selectedRegionIds.length === 0
                        ? 'Geographical intelligence mapping required'
                        : `Active Analysis Scope: [${selectedRegionIds.join(', ')}]`}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/20 flex items-center justify-center text-orange-500 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" /></svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Zip code selector — animated reveal */}
              <AnimatePresence>
                {selectedRegionIds.length > 0 && (
                  <motion.div
                    key="zip-selector"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative overflow-visible z-30"
                  >
                    <label className="block text-[10px] text-indigo-500 dark:text-indigo-400 font-black mb-3 ml-1 uppercase tracking-widest">
                      Target Market Index (Zip)
                    </label>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={debouncedLoadOptions}
                      defaultOptions={false}
                      value={selectedZip}
                      onChange={(opt) => setSelectedZip(opt)}
                      placeholder="Search by zip code (e.g. 90210)"
                      isClearable
                      noOptionsMessage={({ inputValue }) =>
                        !inputValue || inputValue.length < 2 ? 'Enter at least 2 digits' : 'No matching results'
                      }
                      className="w-full"
                      classNamePrefix="react-select"
                      components={{ MenuList: VirtualizedMenuList }}
                      styles={{
                        control: (base) => ({
                          ...base,
                          backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                          borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                          borderRadius: '12px', minHeight: '48px', boxShadow: 'none',
                          borderWidth: '2px', color: isDarkMode ? '#fff' : '#1e293b',
                          '&:hover': { borderColor: '#6366f1' },
                          '&:focus-within': { borderColor: '#6366f1' },
                        }),
                        menu: (base) => ({
                          ...base, zIndex: 50, borderRadius: '12px', overflow: 'hidden',
                          backgroundColor: isDarkMode ? '#1e293b' : 'white',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                        }),
                        option: (base, { isFocused, isSelected }) => ({
                          ...base,
                          backgroundColor: isSelected ? '#6366f1' : isFocused ? (isDarkMode ? '#334155' : '#f1f5f9') : 'transparent',
                          color: isSelected ? '#fff' : isDarkMode ? '#f8fafc' : '#1e293b',
                          fontSize: '13px', padding: '8px 16px',
                        }),
                        singleValue: (base) => ({ ...base, color: isDarkMode ? '#f8fafc' : '#1e293b' }),
                        input: (base) => ({ ...base, color: isDarkMode ? '#f8fafc' : '#1e293b' }),
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analysis directive + analyze button */}
              <motion.div
                variants={cardVariants}
                className="bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-500/30 rounded-3xl p-6 flex-grow flex flex-col shadow-sm relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                    Analysis Directive
                  </label>
                  <span className={`text-[9px] uppercase font-black ${limitReached ? 'text-red-500' : 'text-orange-500 dark:text-orange-400'}`}>
                    {limitReached ? 'Monthly Limit Reached' : `${usageCount} / ${monthlyLimit} Analyses Used`}
                  </span>
                </div>

                <motion.textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="E.g., Compare this property to market trends, analyze investment potential vs local cap rates..."
                  whileFocus={{ boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }}
                  className="w-full flex-grow min-h-[150px] bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all resize-none mb-6 relative z-10 font-medium text-sm"
                />

                {/* Analyze button with pulsing glow ring when valid */}
                <div className="relative z-10">
                  <AnimatePresence>
                    {isFormValid && !processing && (
                      <motion.div
                        key="pulse-ring"
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: 'transparent', border: '2px solid rgba(249,115,22,0.4)' }}
                        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.button
                    onClick={handleAnalyze}
                    disabled={!isFormValid || processing}
                    whileHover={isFormValid && !processing ? { scale: 1.02, y: -1 } : {}}
                    whileTap={isFormValid && !processing ? { scale: 0.97 } : {}}
                    animate={isFormValid && !processing ? {
                      boxShadow: [
                        '0 4px 24px rgba(249,115,22,0.3)',
                        '0 8px 32px rgba(249,115,22,0.5)',
                        '0 4px 24px rgba(249,115,22,0.3)',
                      ],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-colors relative z-10 ${
                      isFormValid
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {limitReached ? 'Limit Reached — Upgrade Plan' : processing ? 'Processing…' : 'Generate Intelligence Report'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Output feed placeholder */}
              <motion.div
                variants={cardVariants}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 bg-slate-50/50 dark:bg-slate-800/50 relative"
              >
                <div className="flex items-center gap-2 mb-6 opacity-40">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Synthetic Intelligence Output Feed
                  </span>
                </div>
                <div className="space-y-4 opacity-5">
                  <div className="h-3 bg-slate-900 dark:bg-white rounded-full w-3/4" />
                  <div className="h-3 bg-slate-900 dark:bg-white rounded-full w-1/2" />
                  <div className="h-3 bg-slate-900 dark:bg-white rounded-full w-full" />
                </div>
              </motion.div>
            </div>

            {/* ══ LEFT COLUMN — engine controls ══════════════════════════════ */}
            <div className="space-y-8 order-2 lg:order-1">

              {/* ── Desktop engine selector: R3F viewer (C) + flip cards (B) ── */}
              <div className="hidden lg:block">
                <motion.div
                  variants={cardVariants}
                  className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-indigo-100 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm"
                >
                  {/* ─ Option C: R3F 3D engine shape viewer ─────────────────── */}
                  <div className="relative border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    {/* Engine label overlay */}
                    <div className="absolute top-3 left-4 z-10">
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Active Engine</p>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={agentMode}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.18 }}
                          className="text-sm font-black uppercase tracking-tight"
                          style={{ color: ENGINE_COLORS[agentMode] }}
                        >
                          {ENGINE_OPTIONS.find(e => e.id === agentMode)?.label}
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    {/* Usage pill */}
                    <div className="absolute top-3 right-4 z-10">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        limitReached
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {usageCount}/{monthlyLimit}
                      </span>
                    </div>

                    <Suspense fallback={<EngineViewerFallback />}>
                      <EngineViewer mode={agentMode} />
                    </Suspense>
                  </div>

                  {/* ─ Option B: flip cards ──────────────────────────────────── */}
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {ENGINE_OPTIONS.map((engine) => (
                      <FlipCard
                        key={engine.id}
                        engine={engine}
                        isActive={agentMode === engine.id}
                        onClick={() => setAgentMode(engine.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* ── Engine parameters section ──────────────────────────────── */}
              <SectionCard>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    Engine Intent Parameters
                  </h4>
                  <motion.div
                    key={agentMode + '-badge'}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-3 py-1 text-[9px] font-black rounded-full uppercase text-white"
                    style={{ backgroundColor: ENGINE_COLORS[agentMode] }}
                  >
                    {agentMode}
                  </motion.div>
                </div>

                {/* AnimatePresence cross-fades between engine param panels */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={agentMode}
                    variants={enginePanelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-5"
                  >
                    {/* ─────────── BUYING ──────────────────────────────────── */}
                    {agentMode === 'buying' && (
                      <>
                        <div className="space-y-4">
                          <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase ml-1">Price Range ($)</label>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={buyingParams.min_price} onChange={e => setBuyingParams({...buyingParams, min_price: e.target.value})} placeholder="Min Price" className={inputClass} />
                            <input type="number" value={buyingParams.max_price} onChange={e => setBuyingParams({...buyingParams, max_price: e.target.value})} placeholder="Max Price" className={inputClass} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Budget ($)</label>
                            <input type="number" value={buyingParams.budget} onChange={e => setBuyingParams({...buyingParams, budget: e.target.value})} placeholder="e.g. 500000" className={inputClass} />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Occupant Count</label>
                            <input type="number" value={buyingParams.occupant_count} onChange={e => setBuyingParams({...buyingParams, occupant_count: e.target.value})} placeholder="e.g. 4" className={inputClass} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">School Distance (mi)</label>
                            <input type="number" value={buyingParams.school_distance} onChange={e => setBuyingParams({...buyingParams, school_distance: e.target.value})} placeholder="e.g. 2" className={inputClass} />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Min Bedrooms</label>
                            <input type="number" value={buyingParams.bedrooms_preference} onChange={e => setBuyingParams({...buyingParams, bedrooms_preference: e.target.value})} placeholder="e.g. 3" className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Safety Priority</label>
                          <select value={buyingParams.safety_priority} onChange={e => setBuyingParams({...buyingParams, safety_priority: e.target.value})} className={selectClass}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* ─────────── LISTING ─────────────────────────────────── */}
                    {agentMode === 'listing' && (
                      <>
                        <div>
                          <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Improvement Budget ($)</label>
                          <input type="number" value={listingParams.improvement_budget} onChange={e => setListingParams({...listingParams, improvement_budget: e.target.value})} placeholder="e.g. 10000" className={inputClass} />
                        </div>
                        {LISTING_CONDITION_DROPDOWNS.map(dd => (
                          <div key={dd.id}>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">{dd.label}</label>
                            <select
                              value={(listingConditionParams as any)[dd.id]}
                              onChange={e => setListingConditionParams({...listingConditionParams, [dd.id]: e.target.value})}
                              className={selectClass}
                            >
                              {dd.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        ))}
                      </>
                    )}

                    {/* ─────────── INVESTOR ────────────────────────────────── */}
                    {agentMode === 'investor' && (
                      <>
                        <div className="space-y-4">
                          <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase ml-1">Price Range ($)</label>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={investorParams.min_price} onChange={e => setInvestorParams({...investorParams, min_price: e.target.value})} placeholder="Min Price" className={inputClass} />
                            <input type="number" value={investorParams.max_price} onChange={e => setInvestorParams({...investorParams, max_price: e.target.value})} placeholder="Max Price" className={inputClass} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Target Cap Rate (%)</label>
                            <input type="number" value={investorParams.target_cap_rate} onChange={e => setInvestorParams({...investorParams, target_cap_rate: e.target.value})} placeholder="e.g. 7.5" className={inputClass} />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Risk Tolerance</label>
                            <select value={investorParams.risk_tolerance} onChange={e => setInvestorParams({...investorParams, risk_tolerance: e.target.value})} className={selectClass}>
                              <option value="low">Low (Conservative)</option>
                              <option value="medium">Medium (Moderate)</option>
                              <option value="high">High (Aggressive)</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Down Payment (%)</label>
                            <input type="number" value={investorParams.down_payment_percentage} onChange={e => setInvestorParams({...investorParams, down_payment_percentage: e.target.value})} placeholder="e.g. 20" className={inputClass} />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Holding Period (yrs)</label>
                            <input type="number" value={investorParams.holding_period} onChange={e => setInvestorParams({...investorParams, holding_period: e.target.value})} placeholder="e.g. 5" className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Max Purchase Price ($)</label>
                          <input type="number" value={investorParams.max_purchase_price} onChange={e => setInvestorParams({...investorParams, max_purchase_price: e.target.value})} placeholder="e.g. 750000" className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Preferred Financing</label>
                          <input type="text" value={investorParams.preferred_financing} onChange={e => setInvestorParams({...investorParams, preferred_financing: e.target.value})} placeholder="e.g. Conventional, Hard Money" className={inputClass} />
                        </div>
                      </>
                    )}

                    {/* ─────────── FLIPPER ─────────────────────────────────── */}
                    {agentMode === 'flipper' && (
                      <>
                        <div className="space-y-4">
                          <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase ml-1">Search Price Range ($)</label>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={flipperParams.min_price} onChange={e => setFlipperParams({...flipperParams, min_price: e.target.value})} placeholder="Min Price" className={inputClass} />
                            <input type="number" value={flipperParams.max_price} onChange={e => setFlipperParams({...flipperParams, max_price: e.target.value})} placeholder="Max Price" className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Purchase Price ($)</label>
                          <input type="number" value={flipperParams.purchase_price} onChange={e => setFlipperParams({...flipperParams, purchase_price: e.target.value})} placeholder="e.g. 300000" className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Renovation Budget ($)</label>
                            <input type="number" value={flipperParams.renovation_budget} onChange={e => setFlipperParams({...flipperParams, renovation_budget: e.target.value})} placeholder="e.g. 50000" className={inputClass} />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Holding Period (mo)</label>
                            <input type="number" value={flipperParams.holding_period} onChange={e => setFlipperParams({...flipperParams, holding_period: e.target.value})} placeholder="e.g. 6" className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">Target Profit</label>
                          <div className="flex gap-2">
                            <input type="number" value={flipperParams.target_profit} onChange={e => setFlipperParams({...flipperParams, target_profit: e.target.value})} placeholder="e.g. 40000" className={inputClass} />
                            <select value={flipperParams.target_profit_type} onChange={e => setFlipperParams({...flipperParams, target_profit_type: e.target.value})} className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all appearance-none dark:text-white">
                              <option value="usd">$</option>
                              <option value="percentage">%</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </SectionCard>

              {/* ── Shared property specs ─────────────────────────────────── */}
              <SectionCard>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Property Specs</h4>
                </div>
                <div className="space-y-5">
                  <div className="space-y-4">
                    <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase ml-1">Square Footage Range</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" value={propertySpecs.min_sqft} onChange={e => setPropertySpecs({...propertySpecs, min_sqft: e.target.value})} placeholder="Min sqft" className={inputClass} />
                      <input type="number" value={propertySpecs.max_sqft} onChange={e => setPropertySpecs({...propertySpecs, max_sqft: e.target.value})} placeholder="Max sqft" className={inputClass} />
                    </div>
                  </div>
                  {SHARED_DROPDOWNS.map(dd => (
                    <div key={dd.id}>
                      <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase ml-1">{dd.label}</label>
                      <select
                        value={(propertySpecs as any)[dd.id]}
                        onChange={e => setPropertySpecs({...propertySpecs, [dd.id]: e.target.value})}
                        className={selectClass}
                      >
                        {dd.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* ── Intent parameters (buying / listing only) ─────────────── */}
              <AnimatePresence>
                {(agentMode === 'buying' || agentMode === 'listing') && (
                  <motion.div
                    key={`intent-${agentMode}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                  >
                    <SectionCard>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                          {agentMode === 'buying' ? 'Buyer Intent' : 'Listing Strategy'}
                        </h4>
                      </div>
                      <div className="space-y-6">
                        {(agentMode === 'buying' ? BUYER_DROPDOWNS : LISTING_DROPDOWNS).map(dd =>
                          renderCheckboxGroup(dd.label, dd.id, dd.options)
                        )}
                      </div>
                    </SectionCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ════════════════ MAP MODAL ═══════════════════════════════════════════ */}
        <AnimatePresence>
          {isMapOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="map-backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setIsMapOpen(false)}
                className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm"
              />

              {/* Panel */}
              <motion.div
                key="map-panel"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-4 md:inset-8 z-[101] bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col"
              >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Select Analysis Region</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {selectedRegionIds.length}/{maxRegions} region{maxRegions !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    onClick={() => setIsMapOpen(false)}
                    className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </motion.button>
                </div>

                {/* Map (unchanged) */}
                <div className="flex-1 overflow-hidden">
                  <USAmap
                    selectedRegions={selectedRegionIds}
                    onRegionToggle={toggleRegion}
                    maxRegions={maxRegions}
                    lockedRegions={hasAnalyzed ? savedRegions : []}
                  />
                </div>

                {/* Footer actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-4">
                  <motion.button
                    onClick={handleReset}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Reset
                  </motion.button>
                  <motion.button
                    onClick={async () => { await handleSaveRegions(); setIsMapOpen(false); }}
                    disabled={processing}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-60"
                  >
                    {processing ? 'Saving…' : 'Save Regions'}
                  </motion.button>
                </div>

                {/* Lock notice */}
                <div className="px-6 pb-4">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                    {hasAnalyzed
                      ? '⚠ Saved regions are locked after first analysis. You may add more if your plan permits.'
                      : 'You can freely change regions before clicking "Save Regions".'}
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ════════════════ ENGINE MODAL (mobile) ══════════════════════════════ */}
        <AnimatePresence>
          {isEngineModalOpen && (
            <>
              <motion.div
                key="engine-backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setIsEngineModalOpen(false)}
                className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                key="engine-sheet"
                variants={sheetVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-slate-800 rounded-t-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700"
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Select Analysis Engine</h3>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    onClick={() => setIsEngineModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </motion.button>
                </div>
                <div className="p-4 grid gap-3 pb-8">
                  {ENGINE_OPTIONS.map((engine, i) => (
                    <motion.button
                      key={engine.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 30 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setAgentMode(engine.id); setIsEngineModalOpen(false); }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors ${
                        agentMode === engine.id
                          ? 'border-transparent text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800'
                      }`}
                      style={agentMode === engine.id ? { background: `linear-gradient(135deg, ${ENGINE_COLORS[engine.id]}dd, ${ENGINE_COLORS[engine.id]}aa)` } : {}}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        agentMode === engine.id ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={engine.icon} /></svg>
                      </div>
                      <span className="font-bold uppercase text-sm tracking-widest">{engine.label}</span>
                      {agentMode === engine.id && (
                        <span className="ml-auto text-[9px] font-black bg-white/25 px-2 py-0.5 rounded-full uppercase">ACTIVE</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ════════════════ CONFIRM MODAL ═══════════════════════════════════════ */}
        <AnimatePresence>
          {showConfirmModal && (
            <>
              <motion.div
                key="confirm-backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md"
              />
              <motion.div
                key="confirm-panel"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-[111] flex items-center justify-center p-6 pointer-events-none"
              >
                <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-indigo-100 dark:border-slate-700 pointer-events-auto">
                  <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-900/20">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Confirm Intelligence Directive</h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">Verify parameters before execution</p>
                    </div>
                    <motion.button
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      onClick={() => setShowConfirmModal(false)}
                      className="w-10 h-10 rounded-full hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </motion.button>
                  </div>

                  <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Context</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Zip Code</span>
                            <span className="font-bold text-slate-900 dark:text-white">{selectedZip?.label}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Engine</span>
                            <span className="px-3 py-1 text-white text-[10px] font-black rounded-full uppercase" style={{ backgroundColor: ENGINE_COLORS[agentMode] }}>
                              {agentMode}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Specs</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">SqFt Range</span>
                            <span className="font-bold text-slate-900 dark:text-white">{propertySpecs.min_sqft || '0'} – {propertySpecs.max_sqft || 'Max'}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Beds/Baths</span>
                            <span className="font-bold text-slate-900 dark:text-white">{propertySpecs.beds} / {propertySpecs.bathrooms}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Intent Parameters</h4>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700">
                        {Object.entries(
                          agentMode === 'buying' ? buyingParams :
                          agentMode === 'listing' ? listingParams :
                          agentMode === 'investor' ? investorParams : flipperParams
                        ).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{val || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Directive</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-amber-50/50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/50 leading-relaxed">
                        "{question}"
                      </p>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-700 flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAnalyze}
                      className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
                    >
                      Confirm & Execute
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {showIntro && <DashboardIntroOverlay onClose={() => setShowIntro(false)} />}
      </div>
    </div>
  );
};
