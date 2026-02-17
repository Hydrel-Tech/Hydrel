
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
        // In real app, trigger backend analysis here
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
    <div className="min-h-screen bg-[#1A0F1F] text-slate-200 font-sans selection:bg-[#BB86FC] selection:text-[#1A0F1F]">
      {/* --- Header --- */}
      <header className="border-b border-[#BB86FC]/10 bg-[#1A0F1F]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 flex items-center justify-center bg-[#2D1B32] rounded border border-[#BB86FC]/20">
               <span className="text-[#03DAC6] font-bold">H</span>
             </div>
             <h1 className="text-sm font-bold tracking-[0.2em] text-[#03DAC6] uppercase hidden md:block">Real Estate Analytics System</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-[#BB86FC] font-bold tracking-widest uppercase">OPERATOR</p>
              <p className="text-sm font-bold text-white">{user?.email}</p>
            </div>
            <button className="px-4 py-2 bg-[#BB86FC]/10 text-[#BB86FC] border border-[#BB86FC]/30 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#BB86FC]/20 transition-colors">
              Request Simulation
            </button>
             <button onClick={() => signOut()} className="text-slate-500 hover:text-white transition-colors">
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
                className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  agentMode === 'listing' 
                    ? 'bg-gradient-to-br from-[#2D1B32] to-[#3a2044] border-[#BB86FC] shadow-[0_0_20px_rgba(187,134,252,0.15)]' 
                    : 'bg-[#2D1B32]/40 border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${agentMode === 'listing' ? 'bg-[#BB86FC]' : 'bg-transparent'}`}></div>
                <h3 className={`text-xl font-bold mb-1 ${agentMode === 'listing' ? 'text-white' : 'text-slate-400'}`}>LISTING AGENT</h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Seller Representation</p>
              </button>

              <button 
                onClick={() => setAgentMode('buying')}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  agentMode === 'buying' 
                    ? 'bg-gradient-to-br from-[#2D1B32] to-[#3a2044] border-[#03DAC6] shadow-[0_0_20px_rgba(3,218,198,0.15)]' 
                    : 'bg-[#2D1B32]/40 border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${agentMode === 'buying' ? 'bg-[#03DAC6]' : 'bg-transparent'}`}></div>
                <h3 className={`text-xl font-bold mb-1 ${agentMode === 'buying' ? 'text-white' : 'text-slate-400'}`}>BUYING AGENT</h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Buyer Representation</p>
              </button>
            </div>

            {/* Dynamic Dropdowns */}
            <div className="bg-[#2D1B32] border border-[#BB86FC]/10 rounded-2xl p-6 space-y-5 shadow-lg">
              <h4 className="text-xs font-bold text-[#BB86FC] uppercase tracking-widest border-b border-white/5 pb-2">
                {agentMode === 'buying' ? 'Acquisition Parameters' : 'Disposition Parameters'}
              </h4>
              
              {(agentMode === 'buying' ? BUYER_DROPDOWNS : LISTING_DROPDOWNS).map((field) => (
                <div key={field.id}>
                  <label className="block text-xs text-slate-400 font-bold mb-2 ml-1">{field.label}</label>
                  <select 
                    className="w-full bg-[#1A0F1F] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-[#BB86FC] focus:ring-1 focus:ring-[#BB86FC] transition-all appearance-none"
                    value={formState[`${agentMode}_${field.id}`] || ''}
                    onChange={(e) => handleDropdownChange(field.id, e.target.value)}
                  >
                    <option value="">Select option...</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
            
            <div className="bg-[#2D1B32] border border-[#BB86FC]/10 rounded-2xl p-6 space-y-5 shadow-lg">
               <h4 className="text-xs font-bold text-[#BB86FC] uppercase tracking-widest border-b border-white/5 pb-2">
                Property Filters
              </h4>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-2 ml-1">Min SqFt</label>
                    <input type="number" placeholder="0" className="w-full bg-[#1A0F1F] border border-white/10 rounded-lg px-3 py-3 text-sm text-slate-300 focus:border-[#BB86FC] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-2 ml-1">Max SqFt</label>
                    <input type="number" placeholder="Max" className="w-full bg-[#1A0F1F] border border-white/10 rounded-lg px-3 py-3 text-sm text-slate-300 focus:border-[#BB86FC] focus:outline-none" />
                  </div>
               </div>
               {SHARED_DROPDOWNS.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs text-slate-400 font-bold mb-2 ml-1">{field.label}</label>
                  <select className="w-full bg-[#1A0F1F] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-[#BB86FC] transition-all appearance-none">
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
              className="bg-[#2D1B32] border border-dashed border-[#BB86FC]/30 rounded-2xl p-8 cursor-pointer hover:border-[#BB86FC] hover:bg-[#341f3a] transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#BB86FC]"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                   <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#BB86FC] transition-colors">
                    {selectedRegionIds.length === 0 ? 'Select Target Region' : `${selectedRegionIds.length} Region${selectedRegionIds.length !== 1 ? 's' : ''} Selected`}
                  </h3>
                   <p className="text-slate-400 text-sm">
                    {selectedRegionIds.length === 0 
                      ? 'Click to open geographical intelligence map' 
                      : `Analysis Scope: Region IDs [${selectedRegionIds.join(', ')}]`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#BB86FC]/10 flex items-center justify-center text-[#BB86FC] group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" /></svg>
                </div>
              </div>
            </div>

            {/* Zip Code Selector */}
            {selectedRegionIds.length > 0 && (
               <div className="bg-[#2D1B32] border border-[#BB86FC]/10 rounded-2xl p-6 animate-fade-in shadow-lg">
                 <label className="block text-xs text-[#03DAC6] font-bold mb-3 ml-1 uppercase tracking-widest">Select Market Zip Code</label>
                 <select 
                   value={selectedZip}
                   onChange={(e) => setSelectedZip(e.target.value)}
                   className="w-full bg-[#1A0F1F] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#03DAC6] focus:ring-1 focus:ring-[#03DAC6] transition-all appearance-none"
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
            <div className="bg-[#2D1B32] border border-[#BB86FC]/10 rounded-2xl p-6 flex-grow flex flex-col shadow-lg">
              <div className="flex justify-between items-center mb-4">
                 <label className="block text-xs text-[#BB86FC] font-bold uppercase tracking-widest">Analysis Directive</label>
                 <span className={`text-[10px] uppercase font-bold ${limitReached ? 'text-red-500' : 'text-[#03DAC6]'}`}>
                    {limitReached ? 'Monthly Limit Reached' : `${usageCount} / ${monthlyLimit} Analyses Used`}
                 </span>
              </div>
              
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g., Compare this property to market trends, analyze investment potential vs local cap rates..."
                className="w-full flex-grow min-h-[150px] bg-[#1A0F1F] border border-white/10 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#BB86FC] focus:ring-1 focus:ring-[#BB86FC] transition-all resize-none mb-6"
              />

              <button 
                onClick={handleAnalyze}
                disabled={!isFormValid || processing}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all ${
                  isFormValid 
                    ? 'bg-[#03DAC6] text-[#1A0F1F] hover:bg-[#02b3a2] hover:scale-[1.01] hover:shadow-[#03DAC6]/30' 
                    : 'bg-[#1A0F1F] text-slate-600 cursor-not-allowed border border-white/5'
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
            <div className="border border-white/5 rounded-2xl p-8 bg-[#1A0F1F]/50">
               <div className="flex items-center gap-2 mb-6 opacity-50">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Report Preview Area</span>
               </div>
               <div className="space-y-4 opacity-30">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- Footer (Simple) --- */}
      <footer className="border-t border-white/5 bg-[#1A0F1F] py-8 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
           <p className="text-xs text-slate-600">Hydrel Systems v3.2.1 • Secure Connection Established</p>
        </div>
      </footer>

      {/* --- Map Modal --- */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1A0F1F] flex flex-col animate-fade-in">
          <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#2D1B32]">
             <h2 className="text-xl font-bold text-white tracking-wider">REGIONAL SELECTION</h2>
             <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-[#1A0F1F] rounded-full text-xs font-bold text-slate-400 border border-slate-700">
                  {selectedRegionIds.length} / {maxRegions} Selected
               </div>
               <button 
                onClick={() => setIsMapOpen(false)}
                className="px-6 py-2 bg-[#03DAC6] text-[#1A0F1F] font-bold rounded-lg hover:bg-[#02b3a2] transition-colors text-sm"
              >
                CONFIRM SELECTION
              </button>
             </div>
          </div>
          
          <div className="flex-grow relative flex items-center justify-center p-10 overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2D1B32] to-[#1A0F1F]">
             <div className="relative w-full max-w-5xl aspect-[16/9]">
               <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-2xl">
                 <defs>
                   <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                     <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                   </pattern>
                 </defs>
                 
                 {/* Map Logic: 
                     Region 1 (NE) = ID '1'
                     Region 2 (SE) = ID '2'
                     Region 3 (Midwest) = ID '3'
                     Region 4 (West) = ID '4'
                 */}

                 {/* West (Region 4) */}
                 <path 
                    d="M 50 20 L 300 20 L 300 150 L 250 150 L 250 350 L 200 450 L 20 400 L 20 100 Z"
                    className={`transition-all duration-300 cursor-pointer ${
                      selectedRegionIds.includes('4') ? 'fill-[#BB86FC]/40' : 'fill-transparent hover:fill-[#BB86FC]/10'
                    }`}
                    stroke="#ef4444" 
                    strokeWidth="2"
                    onClick={() => toggleRegion('4')}
                 />
                 <text x="150" y="200" fill="white" className="text-xs font-bold opacity-50 pointer-events-none">REGION 4 (WEST)</text>

                 {/* Midwest (Region 3) */}
                 <path 
                    d="M 300 20 L 550 20 L 580 80 L 580 200 L 450 200 L 450 250 L 300 250 Z"
                    className={`transition-all duration-300 cursor-pointer ${
                      selectedRegionIds.includes('3') ? 'fill-[#BB86FC]/40' : 'fill-transparent hover:fill-[#BB86FC]/10'
                    }`}
                    stroke="#ef4444"
                    strokeWidth="2"
                    onClick={() => toggleRegion('3')}
                 />
                 <text x="400" y="150" fill="white" className="text-xs font-bold opacity-50 pointer-events-none">REGION 3 (MIDWEST)</text>

                 {/* Northeast (Region 1) */}
                 <path 
                    d="M 550 20 L 750 10 L 780 150 L 650 200 L 580 200 L 580 80 Z"
                    className={`transition-all duration-300 cursor-pointer ${
                      selectedRegionIds.includes('1') ? 'fill-[#BB86FC]/40' : 'fill-transparent hover:fill-[#BB86FC]/10'
                    }`}
                    stroke="#ef4444"
                    strokeWidth="2"
                    onClick={() => toggleRegion('1')}
                 />
                 <text x="650" y="100" fill="white" className="text-xs font-bold opacity-50 pointer-events-none">REGION 1 (NE)</text>

                 {/* Southeast (Region 2) */}
                 <path 
                    d="M 300 250 L 450 250 L 450 200 L 650 200 L 620 350 L 680 450 L 500 450 L 350 400 L 300 300 Z"
                    className={`transition-all duration-300 cursor-pointer ${
                      selectedRegionIds.includes('2') ? 'fill-[#BB86FC]/40' : 'fill-transparent hover:fill-[#BB86FC]/10'
                    }`}
                    stroke="#ef4444"
                    strokeWidth="2"
                    onClick={() => toggleRegion('2')}
                 />
                 <text x="500" y="350" fill="white" className="text-xs font-bold opacity-50 pointer-events-none">REGION 2 (SE)</text>
                 
                 {/* Decorative Grid Overlay */}
                 <rect width="100%" height="100%" fill="url(#grid)" className="pointer-events-none" />
                 
                 {/* Thick Yellow Region Division Lines */}
                 <path d="M 300 20 L 300 250" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className="pointer-events-none opacity-80"/>
                 <path d="M 580 80 L 580 200" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className="pointer-events-none opacity-80"/>
                 <path d="M 450 200 L 450 250" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className="pointer-events-none opacity-80"/>
                 <path d="M 450 250 L 300 250" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className="pointer-events-none opacity-80"/>
                 <path d="M 450 200 L 650 200" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className="pointer-events-none opacity-80"/>
                 
               </svg>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
