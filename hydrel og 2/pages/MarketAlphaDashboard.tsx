
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import { FixedSizeList as List } from 'react-window';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import USAmap from '../components/USAmap';
import DashboardIntroOverlay from '../components/DashboardIntroOverlay';

// --- Types & Constants ---
type AgentMode = 'buying' | 'listing';

const BUYER_DROPDOWNS = [
  { id: 'focus', label: 'Analysis Focus', options: ['Making an Offer', 'Investment Analysis', 'Comparison Shopping', 'Risk Assessment', 'Long-term Value'] },
  { id: 'concerns', label: 'Specific Concerns', options: ['School Quality', 'Flood Risk', 'Noise/Traffic', 'Future Resale', 'Renovation Needs', 'HOA Issues', 'Crime/Safety'] },
  { id: 'horizon', label: 'Investment Horizon', options: ['Short-term (<3 yrs)', 'Medium (3-7 yrs)', 'Long-term (7+ yrs)'] },
  { id: 'posture', label: 'Negotiation Posture', options: ['Aggressive – Lowest Possible', 'Balanced – Fair Market', 'Competitive – Must Win', 'Cautious – Risk Averse'] }
];

const LISTING_DROPDOWNS = [
  { id: 'goal', label: 'Listing Goal', options: ['Price Optimization', 'Fast Sale', 'Premium Positioning', 'Competitive Edge', 'Investor Targeting'] },
  { id: 'timeline', label: 'Seller Timeline', options: ['Immediate (<30 days)', 'Flexible (30-60 days)', 'Patient (60+ days)'] },
  { id: 'budget', label: 'Improvement Budget', options: ['None – Sell As-Is', 'Minimal (<$5k)', 'Moderate ($5-15k)', 'Full ($15k+)'] },
  { id: 'target', label: 'Target Buyer', options: ['First-Time Buyers', 'Families', 'Empty Nesters', 'Investors', 'Luxury Buyers', 'No Preference'] },
  { id: 'stance', label: 'Competitive Stance', options: ['Price Leader (Below Market)', 'Market Matched', 'Premium Positioned', 'Luxury Niche'] }
];

const SHARED_DROPDOWNS = [
  { id: 'beds', label: 'Bedrooms', options: ['Any', '1+', '2+', '3+', '4+', '5+'] },
  { id: 'status', label: 'Status', options: ['Active Only', 'Active + Pending', 'All (Include Sold)'] },
  { id: 'sort', label: 'Sort By', options: ['Relevance', 'Price (Low to High)', 'Price (High to Low)', 'Newest First', 'Days on Market'] }
];

// Mapping helper for DB queries (Frontend names -> Backend UUIDs)
const REGION_NAME_TO_ID: Record<string, string> = {
  'northeast': "468628a4-fe88-44bb-8cc9-c3bad66acf56",
  'southeast': "1214645d-b54c-4b8c-a23e-a892897d33b9",
  'midwest': "79f6a45b-a941-4781-a919-7d7c6577d34c",
  'west': "11c5fe0f-9159-4391-8fcd-8bd655dcfaf2"
};

const REGION_ID_TO_NAME: Record<string, string> = {
  "468628a4-fe88-44bb-8cc9-c3bad66acf56": 'northeast',
  "1214645d-b54c-4b8c-a23e-a892897d33b9": 'southeast',
  "79f6a45b-a941-4781-a919-7d7c6577d34c": 'midwest',
  "11c5fe0f-9159-4391-8fcd-8bd655dcfaf2": 'west'
};

const REGION_STATES = {
  northeast: [
    { abbr: 'CT', name: 'Connecticut' }, { abbr: 'MA', name: 'Massachusetts' }, { abbr: 'ME', name: 'Maine' },
    { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' }, { abbr: 'NY', name: 'New York' },
    { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' }, { abbr: 'VT', name: 'Vermont' },
    { abbr: 'DE', name: 'Delaware' }, { abbr: 'MD', name: 'Maryland' }, { abbr: 'DC', name: 'District of Columbia' }
  ],
  southeast: [
    { abbr: 'VA', name: 'Virginia' }, { abbr: 'WV', name: 'West Virginia' }, { abbr: 'NC', name: 'North Carolina' },
    { abbr: 'SC', name: 'South Carolina' }, { abbr: 'GA', name: 'Georgia' }, { abbr: 'FL', name: 'Florida' },
    { abbr: 'AL', name: 'Alabama' }, { abbr: 'MS', name: 'Mississippi' }, { abbr: 'TN', name: 'Tennessee' },
    { abbr: 'KY', name: 'Kentucky' }
  ],
  midwest: [
    { abbr: 'OH', name: 'Ohio' }, { abbr: 'IN', name: 'Indiana' }, { abbr: 'MI', name: 'Michigan' },
    { abbr: 'IA', name: 'Iowa' }, { abbr: 'MN', name: 'Minnesota' }, { abbr: 'MT', name: 'Montana' },
    { abbr: 'ND', name: 'North Dakota' }, { abbr: 'SD', name: 'South Dakota' }, { abbr: 'WI', name: 'Wisconsin' },
    { abbr: 'IL', name: 'Illinois' }, { abbr: 'KS', name: 'Kansas' }, { abbr: 'MO', name: 'Missouri' },
    { abbr: 'NE', name: 'Nebraska' }
  ],
  west: [
    { abbr: 'AR', name: 'Arkansas' }, { abbr: 'LA', name: 'Louisiana' }, { abbr: 'OK', name: 'Oklahoma' },
    { abbr: 'TX', name: 'Texas' }, { abbr: 'AZ', name: 'Arizona' }, { abbr: 'CO', name: 'Colorado' },
    { abbr: 'ID', name: 'Idaho' }, { abbr: 'NM', name: 'New Mexico' }, { abbr: 'NV', name: 'Nevada' },
    { abbr: 'UT', name: 'Utah' }, { abbr: 'WY', name: 'Wyoming' }, { abbr: 'AK', name: 'Alaska' },
    { abbr: 'CA', name: 'California' }, { abbr: 'HI', name: 'Hawaii' }, { abbr: 'OR', name: 'Oregon' },
    { abbr: 'WA', name: 'Washington' }
  ]
};

const ITEM_HEIGHT = 35;
const MAX_MENU_HEIGHT = 300;

const VirtualizedMenuList = (props: any) => {
  const { options, children, maxHeight, getValue } = props;
  const childrenArray = React.Children.toArray(children);
  
  const [selectedValue] = getValue();
  const initialOffset = selectedValue
    ? options.indexOf(selectedValue) * ITEM_HEIGHT
    : 0;
  
  const height = Math.min(maxHeight || MAX_MENU_HEIGHT, childrenArray.length * ITEM_HEIGHT);

  if (childrenArray.length === 0) {
    return <div className="p-4 text-center text-slate-500 text-sm">No matching zip codes</div>;
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

export const MarketAlphaDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(false);
  
  // UI State
  const [agentMode, setAgentMode] = useState<AgentMode>('buying');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [formState, setFormState] = useState<Record<string, string>>({});
  
  // Selected Params for multi-select
  const [selectedParams, setSelectedParams] = useState<Record<string, string[]>>({
    focus: [], concerns: [], horizon: [], posture: [],
    goal: [], timeline: [], budget: [], target: [], stance: []
  });

  useEffect(() => {
    if (location.state?.showIntro) {
      setShowIntro(true);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Selected Region IDs are now strings like 'northeast', 'west' to match Map Component
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [savedRegions, setSavedRegions] = useState<string[]>([]);
  
  // Selected Zip is now an object for AsyncSelect
  const [selectedZip, setSelectedZip] = useState<{value: string, label: string} | null>(null);
  
  const [question, setQuestion] = useState('');
  const [processing, setProcessing] = useState(false);

  // Data State
  const [maxRegions, setMaxRegions] = useState(1);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [usageCount, setUsageCount] = useState(0);
  
  // Lock logic
  const hasAnalyzed = usageCount > 0;

  // Simple debounce utility
  const debounce = (fn: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const loadZipOptions = async (inputValue: string) => {
    // If no input, don't fetch anything (or you could fetch a default set)
    if (!inputValue || inputValue.length < 2) return [];

    // Get region UUIDs from currently selected region names
    const regionIds = selectedRegionIds
      .map(name => REGION_NAME_TO_ID[name])
      .filter((id): id is string => !!id);

    if (regionIds.length === 0) return [];

    // Query Supabase with ILIKE on zip_code
    const { data, error } = await supabase
      .from('zip_codes')
      .select('zip_code, city, state')
      .in('region_id', regionIds)
      .ilike('zip_code', `${inputValue}%`)  // matches zip codes starting with input
      .limit(100);  // only fetch at most 100 suggestions

    if (error) {
      console.error('Async fetch error:', error);
      return [];
    }

    if (!data) return [];

    // Map to the format react-select expects
    return data.map(zip => ({
      value: zip.zip_code,
      label: `${zip.zip_code} - ${zip.city}, ${zip.state}`
    }));
  };

  // Debounced load function
  const debouncedLoadOptions = debounce((inputValue: string, callback: (options: any[]) => void) => {
    loadZipOptions(inputValue).then(callback);
  }, 300);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchUserData = async () => {
      // 1. Fetch Tier Limits
      const { data: tierData } = await supabase
        .from('user_tiers')
        .select('max_regions, max_analyses_per_month')
        .eq('user_id', user.id)
        .single();
      
      if (tierData) {
        setMaxRegions(tierData.max_regions || 1);
        setMonthlyLimit(tierData.max_analyses_per_month || 0);
      }

      // 2. Fetch Usage Count for Current Month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('user_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());
      
      setUsageCount(count || 0);

      // 3. Fetch Saved Regions
      const { data: regionData } = await supabase
        .from('user_selected_regions')
        .select('region_id')
        .eq('user_id', user.id);
      
      if (regionData) {
        const names = regionData.map(r => REGION_ID_TO_NAME[r.region_id]).filter(Boolean) as string[];
        setSavedRegions(names);
        setSelectedRegionIds(names);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const toggleRegion = (id: string) => {
    setSelectedRegionIds(prev => {
      if (prev.includes(id)) {
        // LOCK CHECK
        if (hasAnalyzed && savedRegions.includes(id)) {
          alert("Region locked: You cannot remove regions after performing an analysis. You may add more if your plan permits.");
          return prev;
        }
        return prev.filter(rid => rid !== id);
      } else {
        if (prev.length < maxRegions) {
          return [...prev, id];
        } else {
          alert(`Plan limit reached: You can only select ${maxRegions} region(s). Upgrade your plan to add more.`);
          return prev;
        }
      }
    });
    // Clear zip if we are removing a region? 
    setSelectedZip(null); 
  };

  const handleSaveRegions = async () => {
    if (!user) {
      alert("No user session found. Please log in again.");
      return;
    }
    setProcessing(true);

    try {
      console.log('Starting save for user:', user.id, 'Regions:', selectedRegionIds);
      
      // 1. Delete existing selections for this user
      const { error: deleteError } = await supabase
        .from('user_selected_regions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Supabase Delete Error:', deleteError);
        throw new Error(`Failed to clear existing regions: ${deleteError.message}`);
      }

      // 2. Insert new selections
      const inserts = selectedRegionIds.map(name => ({
        user_id: user.id,
        region_id: REGION_NAME_TO_ID[name]
      })).filter(item => item.region_id !== undefined);

      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('user_selected_regions')
          .insert(inserts);
        
        if (insertError) {
          console.error('Supabase Insert Error:', insertError);
          throw new Error(`Failed to save new regions: ${insertError.message}`);
        }
      }

      setSavedRegions([...selectedRegionIds]);
      alert("Regions saved successfully to your account!");
    } catch (err: any) {
      console.error('Detailed Save Error:', err);
      alert(err.message || "Failed to save regions. Please check your connection and try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedRegionIds(savedRegions);
  };

  const handleDropdownChange = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [`${agentMode}_${key}`]: value }));
  };

  const handleParamToggle = (groupId: string, option: string) => {
    setSelectedParams(prev => {
      const current = prev[groupId] || [];
      const updated = current.includes(option) 
        ? current.filter(o => o !== option) 
        : [...current, option];
      return { ...prev, [groupId]: updated };
    });
  };

  const renderCheckboxGroup = (label: string, id: string, options: string[]) => {
    const selected = selectedParams[id] || [];
    return (
      <div key={id} className="relative z-10 space-y-3 pb-2">
        <label className="block text-xs text-slate-500 font-bold mb-2 ml-1">{label}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => handleParamToggle(id, opt)}
              className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                selected.includes(opt)
                  ? 'bg-orange-500 border-orange-600 text-white shadow-sm'
                  : 'bg-purple-50/60 border-indigo-200/50 text-slate-600 hover:border-orange-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleAnalyze = async () => {
    if (!user || processing) return;

    // Validate valid zip selection
    if (!selectedZip || !selectedZip.value) {
      alert('Please select a valid zip code from the list.');
      return;
    }

    setProcessing(true);

    try {
      const { error } = await supabase
        .from('user_analyses')
        .insert([{ user_id: user.id, question: question, zip_code: selectedZip.value, mode: agentMode }]);

      if (!error) {
        setUsageCount(prev => prev + 1);
        alert("Analysis request sent to core engine.");
      } else {
        alert("Error recording analysis.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const limitReached = usageCount >= monthlyLimit;
  const hasSelectedAnyParam = Object.values(selectedParams).some(arr => arr.length > 0);
  const isFormValid = selectedRegionIds.length > 0 && selectedZip?.value && question.length > 0 && !limitReached && hasSelectedAnyParam;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed bg-gradient-to-br from-indigo-950 via-purple-900/30 to-amber-100/20 text-slate-900 font-sans"
      style={{ backgroundImage: 'url("/images/dashboard-bg.webp")' }}
    >
      {/* --- Header --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="relative w-8 h-8">
               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-sm">
                  <defs>
                    <linearGradient id="cubeGradientDash" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4338ca" />
                      <stop offset="1" stopColor="#312e81" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2L2.5 7.5V17.5L12 23L21.5 17.5V7.5L12 2Z" fill="url(#cubeGradientDash)" stroke="#6366f1" strokeWidth="1" strokeLinejoin="round"/>
                  <path d="M12 2V12.5M21.5 7.5L12 12.5M2.5 7.5L12 12.5" stroke="#6366f1" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="-1" y1="13" x2="25" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
               </svg>
            </div>
             <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase hidden md:block">HYDREL</h1>
             <span className="text-slate-300 text-2xl font-thin hidden md:block">|</span>
             <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Real Estate Intelligence</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/market-alpha/pricing');
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50/80 hover:bg-indigo-100 rounded-full text-xs font-bold text-indigo-700 transition-colors border border-indigo-200/50 shadow-sm"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Plans
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">OPERATOR</p>
              <p className="text-sm font-bold text-slate-900">{user?.email}</p>
            </div>
             <button onClick={() => signOut()} className="text-slate-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          
          {/* --- Left Column: Controls (Blue/Cyan Theme) --- */}
          <div className="space-y-8">
            
            {/* Agent Toggles */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setAgentMode('listing')}
                className={`p-6 rounded-2xl border-l-4 text-left transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md ${
                  agentMode === 'listing' 
                    ? 'bg-indigo-50/80 border-l-blue-500 border-y border-r border-indigo-200/50 ring-1 ring-blue-100' 
                    : 'bg-indigo-50/80 border-l-slate-200 border-y border-r border-indigo-200/50 hover:border-l-blue-300'
                }`}
              >
                <h3 className={`text-xl font-bold mb-1 ${agentMode === 'listing' ? 'text-blue-900' : 'text-slate-500'}`}>LISTING AGENT</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Seller Representation</p>
              </button>

              <button 
                onClick={() => setAgentMode('buying')}
                className={`p-6 rounded-2xl border-l-4 text-left transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md ${
                  agentMode === 'buying' 
                    ? 'bg-indigo-50/80 border-l-cyan-500 border-y border-r border-indigo-200/50 ring-1 ring-cyan-100' 
                    : 'bg-indigo-50/80 border-l-slate-200 border-y border-r border-indigo-200/50 hover:border-l-cyan-300'
                }`}
              >
                <h3 className={`text-xl font-bold mb-1 ${agentMode === 'buying' ? 'text-cyan-900' : 'text-slate-500'}`}>BUYING AGENT</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Buyer Representation</p>
              </button>
            </div>

            {/* Dynamic Dropdowns */}
            <div className="bg-indigo-50/80 border border-indigo-200/50 rounded-2xl p-6 space-y-5 shadow-sm relative overflow-hidden text-slate-900">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-indigo-100 pb-2 relative z-10">
                {agentMode === 'buying' ? 'Acquisition Parameters' : 'Disposition Parameters'}
              </h4>
              
              {(agentMode === 'buying' ? BUYER_DROPDOWNS : LISTING_DROPDOWNS).map((field) => (
                renderCheckboxGroup(field.label, field.id, field.options)
              ))}
            </div>
            
            <div className="bg-indigo-50/80 border border-indigo-200/50 rounded-2xl p-6 space-y-5 shadow-sm relative text-slate-900">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-indigo-100 pb-2">
                Property Filters
              </h4>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 font-bold mb-2 ml-1">Min SqFt</label>
                    <input type="number" placeholder="0" className="w-full bg-purple-50/60 border border-indigo-200/50 rounded-lg px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-bold mb-2 ml-1">Max SqFt</label>
                    <input type="number" placeholder="Max" className="w-full bg-purple-50/60 border border-indigo-200/50 rounded-lg px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none" />
                  </div>
               </div>
               {SHARED_DROPDOWNS.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs text-slate-500 font-bold mb-2 ml-1">{field.label}</label>
                  <select className="w-full bg-purple-50/60 border border-indigo-200/50 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-500 transition-all appearance-none">
                     <option value="">Select option...</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* --- Right Column: Map & Analysis (Orange Theme) --- */}
          <div className="flex flex-col gap-6">
            
            {/* Region Selector */}
            <div 
              onClick={() => setIsMapOpen(true)}
              className="bg-indigo-50/80 border border-orange-200/80 rounded-2xl p-8 cursor-pointer hover:border-orange-400 hover:bg-orange-50/20 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-orange-100 group-hover:bg-orange-400 transition-colors"></div>
              
              <div className="flex items-center justify-between relative z-10 pl-4">
                <div>
                   <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
                    {selectedRegionIds.length === 0 ? 'Select Target Region' : `${selectedRegionIds.length} Region${selectedRegionIds.length !== 1 ? 's' : ''} Selected`}
                  </h3>
                   <p className="text-slate-500 text-sm">
                    {selectedRegionIds.length === 0 
                      ? 'Click to open geographical intelligence map' 
                      : `Analysis Scope: [${selectedRegionIds.join(', ')}]`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-all group-hover:scale-110">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" /></svg>
                </div>
              </div>
            </div>

            {/* Zip Code Selector */}
            {selectedRegionIds.length > 0 && (
               <div className="bg-indigo-50/80 border border-orange-200/80 rounded-2xl p-6 animate-fade-in shadow-sm relative overflow-visible z-30">
                 <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-50 rounded-full blur-xl pointer-events-none"></div>
                 <label className="block text-xs text-orange-600 font-bold mb-3 ml-1 uppercase tracking-widest relative z-10">Select Market Zip Code</label>
                 <AsyncSelect
                    cacheOptions
                    loadOptions={debouncedLoadOptions}
                    defaultOptions={false}
                    value={selectedZip}
                    onChange={(opt) => setSelectedZip(opt)}
                    placeholder="Type at least 2 digits to search..."
                    isClearable
                    noOptionsMessage={({ inputValue }) =>
                      !inputValue || inputValue.length < 2
                        ? "Type at least 2 digits"
                        : "No matching zip codes"
                    }
                    className="w-full relative z-20"
                    classNamePrefix="react-select"
                    components={{ MenuList: VirtualizedMenuList }}
                    styles={{
                      control: (base) => ({ 
                        ...base, 
                        backgroundColor: '#f8fafc', 
                        borderColor: '#e2e8f0',
                        minHeight: '44px',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#f97316' }
                      }),
                      menu: (base) => ({ ...base, zIndex: 50 }),
                      option: (base, { isFocused, isSelected }) => ({
                        ...base,
                        backgroundColor: isSelected ? '#f97316' : isFocused ? '#fed7aa' : 'white',
                        color: isSelected ? 'white' : 'black',
                      })
                    }}
                 />
               </div>
            )}

            {/* Question Input & Analyze Button */}
            <div className="bg-indigo-50/80 border border-orange-200/80 rounded-2xl p-6 flex-grow flex flex-col shadow-sm relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-50/50 rounded-tl-full pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-4 relative z-10">
                 <label className="block text-xs text-slate-400 font-bold uppercase tracking-widest">Analysis Directive</label>
                 <span className={`text-[10px] uppercase font-bold ${limitReached ? 'text-red-500' : 'text-orange-500'}`}>
                    {limitReached ? 'Monthly Limit Reached' : `${usageCount} / ${monthlyLimit} Analyses Used`}
                 </span>
              </div>
              
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g., Compare this property to market trends, analyze investment potential vs local cap rates..."
                className="w-full flex-grow min-h-[150px] bg-purple-50/60 border border-indigo-200/50 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none mb-6 relative z-10"
              />

              <button 
                onClick={handleAnalyze}
                disabled={!isFormValid || processing}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all relative z-10 ${
                  isFormValid 
                    ? 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-[1.01] hover:shadow-orange-500/30' 
                    : 'bg-amber-50/40 text-slate-400 cursor-not-allowed border border-indigo-200/50'
                }`}
              >
                {limitReached 
                  ? 'Limit Reached - Upgrade Plan' 
                  : processing 
                    ? 'Processing...' 
                    : 'Generate Intelligence Report'
                }
              </button>
            </div>

            {/* Placeholder Report Area */}
            <div className="border border-indigo-200/50 rounded-2xl p-8 bg-amber-50/40">
               <div className="flex items-center gap-2 mb-6 opacity-40">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Report Preview Area</span>
               </div>
               <div className="space-y-4 opacity-10">
                  <div className="h-4 bg-slate-900 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-900 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-900 rounded w-full"></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Map Modal --- */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-indigo-50 via-purple-50/30 to-amber-50/20 flex flex-col animate-fade-in">
          <div className="h-20 border-b border-indigo-200/50 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md shadow-sm">
             <div className="flex items-center gap-4">
               {/* Back Button */}
               <button 
                 onClick={() => setIsMapOpen(false)}
                 className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                 </svg>
                 <span className="text-sm font-bold">Back to Dashboard</span>
               </button>
               <h2 className="text-xl font-bold text-slate-900 tracking-wider border-l border-indigo-200/50 pl-4 ml-2">REGIONAL SELECTION</h2>
             </div>

             <div className="hidden lg:flex items-center gap-4 bg-amber-50 px-4 py-2 rounded-full border border-amber-100 animate-pulse">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-tight">
                  Map slow? Go to dashboard and come back – loads faster second time.
                </p>
             </div>
             
             <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-indigo-50 rounded-full text-xs font-bold text-indigo-500 border border-indigo-200/50">
                  {selectedRegionIds.length} / {maxRegions} Selected
               </div>
             </div>
          </div>
          
          <div className="flex-grow relative p-4 md:p-8 overflow-y-auto flex flex-col items-center">
             <div className="w-full max-w-6xl flex flex-col gap-6">
                
                {/* State List Section - MOVED TO TOP and MADE CLICKABLE */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-indigo-200/50 p-6">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-indigo-50 pb-2">Click a region below to select</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {(Object.keys(REGION_STATES) as Array<keyof typeof REGION_STATES>).map((region) => {
                         const isSelected = selectedRegionIds.includes(region);
                         return (
                            <div 
                              key={region} 
                              className="space-y-3 cursor-pointer hover:opacity-80 transition-all group"
                              onClick={() => toggleRegion(region)}
                            >
                               <h4 className={`text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isSelected ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'bg-slate-300'}`}></div>
                                  {region}
                               </h4>
                               <div className="flex flex-wrap gap-2">
                                  {REGION_STATES[region].map((state) => (
                                     <div 
                                        key={state.abbr}
                                        title={state.name}
                                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all duration-300 border ${
                                           isSelected 
                                           ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                           : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:border-slate-200'
                                        }`}
                                     >
                                        {state.abbr}
                                     </div>
                                  ))}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>

                {/* Map Section - MOVED BELOW and made non-clickable */}
                <div className="relative pointer-events-none opacity-90 grayscale-[0.2]">
                   <USAmap 
                      selectedRegions={selectedRegionIds}
                      savedRegions={savedRegions}
                      maxRegions={maxRegions}
                      onRegionClick={() => {}} // Disabled via pointer-events-none
                   />
                </div>

                {/* Region Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-indigo-200/50 px-6">
                   <div className="flex items-center gap-3 flex-grow sm:flex-grow-0">
                      <button 
                        onClick={handleSaveRegions}
                        disabled={processing || JSON.stringify(selectedRegionIds.sort()) === JSON.stringify(savedRegions.sort())}
                        className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-emerald-500/10 min-w-[140px]"
                      >
                        {processing ? 'Saving...' : 'Save Regions'}
                      </button>
                      <button 
                        onClick={handleReset}
                        className="px-8 py-3 bg-white text-slate-600 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm min-w-[140px]"
                      >
                        Reset Changes
                      </button>
                   </div>
                   <div className="h-8 w-px bg-indigo-100 hidden sm:block"></div>
                   <button 
                    onClick={() => setIsMapOpen(false)}
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-sm shadow-lg min-w-[140px]"
                  >
                    Close Map
                  </button>
                </div>

                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-indigo-200/50 text-slate-500 flex items-start gap-4">
                    <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 mb-1">Selection Guidance</p>
                        <p className="text-sm leading-relaxed">
                            Click any region name or its state group above to toggle selection. 
                            {hasAnalyzed 
                            ? <span className="text-orange-600 font-bold ml-1">Note: Existing regions are locked due to prior analysis history. You may only add new regions if your plan allows.</span>
                            : " You can freely change regions before clicking 'Save Regions'."
                            }
                        </p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}
      {showIntro && <DashboardIntroOverlay onClose={() => setShowIntro(false)} />}
    </div>
  );
};
