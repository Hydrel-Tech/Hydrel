
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

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

export const MarketAlphaDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // UI State
  const [agentMode, setAgentMode] = useState<AgentMode>('buying');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [selectedZip, setSelectedZip] = useState('');
  const [question, setQuestion] = useState('');
  const [processing, setProcessing] = useState(false);

  // Data State
  const [maxRegions, setMaxRegions] = useState(1);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [usageCount, setUsageCount] = useState(0);
  const [availableZips, setAvailableZips] = useState<{zip_code: string, city: string, state: string}[]>([]);
  
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
    };

    fetchUserData();
  }, [user, navigate]);

  // Fetch Zips when regions change
  useEffect(() => {
    const fetchZips = async () => {
      if (selectedRegionIds.length === 0) {
        setAvailableZips([]);
        return;
      }
      
      const { data } = await supabase
        .from('zip_codes')
        .select('zip_code, city, state')
        .in('region_id', selectedRegionIds);
        
      if (data) {
        setAvailableZips(data);
      }
    };
    fetchZips();
  }, [selectedRegionIds]);

  const toggleRegion = (id: string) => {
    if (selectedRegionIds.includes(id)) {
      setSelectedRegionIds(selectedRegionIds.filter(rid => rid !== id));
      setSelectedZip(''); // Reset zip if region removed
    } else {
      if (selectedRegionIds.length < maxRegions) {
        setSelectedRegionIds([...selectedRegionIds, id]);
      }
    }
  };

  const handleDropdownChange = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [`${agentMode}_${key}`]: value }));
  };

  const handleAnalyze = async () => {
    if (!user || processing) return;
    setProcessing(true);

    try {
      // Record analysis
      const { error } = await supabase
        .from('user_analyses')
        .insert([{ user_id: user.id, question: question, zip_code: selectedZip, mode: agentMode }]);

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
  const isFormValid = selectedRegionIds.length > 0 && selectedZip && question.length > 0 && !limitReached;

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-slate-900 font-sans">
      {/* --- Header --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded border border-emerald-200">
               <span className="text-emerald-600 font-bold">H</span>
             </div>
             <h1 className="text-sm font-bold tracking-[0.2em] text-slate-800 uppercase hidden md:block">Real Estate Analytics System</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">OPERATOR</p>
              <p className="text-sm font-bold text-slate-900">{user?.email}</p>
            </div>
            <button className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors">
              Request Simulation
            </button>
             <button onClick={() => signOut()} className="text-slate-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          
          {/* --- Left Column: Controls --- */}
          <div className="space-y-8">
            
            {/* Agent Toggles */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setAgentMode('listing')}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md ${
                  agentMode === 'listing' 
                    ? 'bg-white border-emerald-500 ring-1 ring-emerald-500' 
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${agentMode === 'listing' ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                <h3 className={`text-xl font-bold mb-1 ${agentMode === 'listing' ? 'text-emerald-900' : 'text-slate-500'}`}>LISTING AGENT</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Seller Representation</p>
              </button>

              <button 
                onClick={() => setAgentMode('buying')}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md ${
                  agentMode === 'buying' 
                    ? 'bg-white border-cyan-500 ring-1 ring-cyan-500' 
                    : 'bg-white border-slate-200 hover:border-cyan-300'
                }`}
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${agentMode === 'buying' ? 'bg-cyan-500' : 'bg-transparent'}`}></div>
                <h3 className={`text-xl font-bold mb-1 ${agentMode === 'buying' ? 'text-cyan-900' : 'text-slate-500'}`}>BUYING AGENT</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Buyer Representation</p>
              </button>
            </div>

            {/* Dynamic Dropdowns */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                {agentMode === 'buying' ? 'Acquisition Parameters' : 'Disposition Parameters'}
              </h4>
              
              {(agentMode === 'buying' ? BUYER_DROPDOWNS : LISTING_DROPDOWNS).map((field) => (
                <div key={field.id}>
                  <label className="block text-xs text-slate-500 font-bold mb-2 ml-1">{field.label}</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
                    value={formState[`${agentMode}_${field.id}`] || ''}
                    onChange={(e) => handleDropdownChange(field.id, e.target.value)}
                  >
                    <option value="">Select option...</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                Property Filters
              </h4>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 font-bold mb-2 ml-1">Min SqFt</label>
                    <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-bold mb-2 ml-1">Max SqFt</label>
                    <input type="number" placeholder="Max" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none" />
                  </div>
               </div>
               {SHARED_DROPDOWNS.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs text-slate-500 font-bold mb-2 ml-1">{field.label}</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all appearance-none">
                     <option value="">Select option...</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>

          </div>

          {/* --- Right Column: Map & Analysis --- */}
          <div className="flex flex-col gap-6">
            
            {/* Region Selector */}
            <div 
              onClick={() => setIsMapOpen(true)}
              className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-emerald-500 transition-colors"></div>
              <div className="flex items-center justify-between relative z-10 pl-2">
                <div>
                   <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                    {selectedRegionIds.length === 0 ? 'Select Target Region' : `${selectedRegionIds.length} Region${selectedRegionIds.length !== 1 ? 's' : ''} Selected`}
                  </h3>
                   <p className="text-slate-500 text-sm">
                    {selectedRegionIds.length === 0 
                      ? 'Click to open geographical intelligence map' 
                      : `Analysis Scope: Region IDs [${selectedRegionIds.join(', ')}]`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all group-hover:scale-110">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" /></svg>
                </div>
              </div>
            </div>

            {/* Zip Code Selector */}
            {selectedRegionIds.length > 0 && (
               <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-fade-in shadow-sm">
                 <label className="block text-xs text-emerald-600 font-bold mb-3 ml-1 uppercase tracking-widest">Select Market Zip Code</label>
                 <select 
                   value={selectedZip}
                   onChange={(e) => setSelectedZip(e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
                 >
                   <option value="">-- Choose Zip Code from Selected Regions --</option>
                   {availableZips.length === 0 && <option disabled>Loading zip codes...</option>}
                   {availableZips.map(zip => (
                     <option key={zip.zip_code} value={zip.zip_code}>{zip.zip_code} - {zip.city}, {zip.state}</option>
                   ))}
                 </select>
               </div>
            )}

            {/* Question Input & Analyze Button */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex-grow flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <label className="block text-xs text-slate-400 font-bold uppercase tracking-widest">Analysis Directive</label>
                 <span className={`text-[10px] uppercase font-bold ${limitReached ? 'text-red-500' : 'text-emerald-600'}`}>
                    {limitReached ? 'Monthly Limit Reached' : `${usageCount} / ${monthlyLimit} Analyses Used`}
                 </span>
              </div>
              
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g., Compare this property to market trends, analyze investment potential vs local cap rates..."
                className="w-full flex-grow min-h-[150px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none mb-6"
              />

              <button 
                onClick={handleAnalyze}
                disabled={!isFormValid || processing}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all ${
                  isFormValid 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.01] hover:shadow-emerald-500/30' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
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
            <div className="border border-slate-200 rounded-2xl p-8 bg-white/50">
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

      {/* --- Footer (Simple) --- */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
           <p className="text-xs text-slate-400">Hydrel Systems v3.2.1 • Secure Connection Established</p>
        </div>
      </footer>

      {/* --- Map Modal --- */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[100] bg-[#f6f9fc] flex flex-col animate-fade-in">
          <div className="h-20 border-b border-slate-200 flex items-center justify-between px-8 bg-white">
             <h2 className="text-xl font-bold text-slate-900 tracking-wider">REGIONAL SELECTION</h2>
             <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-500 border border-slate-200">
                  {selectedRegionIds.length} / {maxRegions} Selected
               </div>
               <button 
                onClick={() => setIsMapOpen(false)}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                CONFIRM SELECTION
              </button>
             </div>
          </div>
          
          <div className="flex-grow relative flex items-center justify-center p-10 overflow-hidden bg-slate-50">
             <div className="relative w-full max-w-5xl aspect-[16/9]">
               <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-2xl">
                 <defs>
                   <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                     <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                   </pattern>
                 </defs>
                 
                 {/* West (Region 4) */}
                 <path 
                    d="M 50 20 L 300 20 L 300 150 L 250 150 L 250 350 L 200 450 L 20 400 L 20 100 Z"
                    className={`transition-all duration-300 cursor-pointer ${
                      selectedRegionIds.includes('4') ? 'fill-cyan-500/20 stroke-cyan-500' : 'fill-white hover:fill-cyan-50 stroke-slate-300'
                    }`}
                    strokeWidth="2"
                    onClick={() => toggleRegion('4')}
                 />
                 <text x="150" y="200" fill="#64748b" className="text-xs font-bold opacity-50 pointer-events-none">REGION 4 (WEST)</text>

                 {/* Midwest (Region 3) */}
                 <path 
                    d="M 300 20 L 550 20 L 580 80 L 580 200 L 450 200 L 450 250 L 300 250 Z"
                    className={`transition-all duration-300 cursor-pointer ${
                      selectedRegionIds.includes('3') ? 'fill-emerald-500/20 stroke-emerald-500' : 'fill-white hover:fill-emerald-50 stroke-slate-300'
                    }`}
                    strokeWidth="2"
                    onClick={() => toggleRegion('3')}
                 />
                 <text x="400" y="150" fill="#64748b" className="text-xs font-bold opacity-50 pointer-events-none">REGION 3 (MIDWEST)</text>

                 {/* Northeast (Region 1) */}
                 <path 
                    d="M 550 20 L 750 10 L 780 150 L 650 200 L 580 200 L 580 80 Z"
                    className={`transition-all duration-300 cursor-pointer ${
                      selectedRegionIds.includes('1') ? 'fill-indigo-500/20 stroke-indigo-500' : 'fill-white hover:fill-indigo-50 stroke-slate-300'
                    }`}
                    strokeWidth="2"
                    onClick={() => toggleRegion('1')}
                 />
                 <text x="650" y="100" fill="#64748b" className="text-xs font-bold opacity-50 pointer-events-none">REGION 1 (NE)</text>

                 {/* Southeast (Region 2) */}
                 <path 
                    d="M 300 250 L 450 250 L 450 200 L 650 200 L 620 350 L 680 450 L 500 450 L 350 400 L 300 300 Z"
                    className={`transition-all duration-300 cursor-pointer ${
                      selectedRegionIds.includes('2') ? 'fill-amber-500/20 stroke-amber-500' : 'fill-white hover:fill-amber-50 stroke-slate-300'
                    }`}
                    strokeWidth="2"
                    onClick={() => toggleRegion('2')}
                 />
                 <text x="500" y="350" fill="#64748b" className="text-xs font-bold opacity-50 pointer-events-none">REGION 2 (SE)</text>
                 
                 {/* Decorative Grid Overlay */}
                 <rect width="100%" height="100%" fill="url(#grid)" className="pointer-events-none" />
                 
               </svg>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
