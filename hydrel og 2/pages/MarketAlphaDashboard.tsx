
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Types & Constants ---
type AgentMode = 'buying' | 'listing';

const BUYER_DROPDOWNS = [
  {
    id: 'focus',
    label: 'Analysis Focus',
    options: ['Making an Offer', 'Investment Analysis', 'Comparison Shopping', 'Risk Assessment', 'Long-term Value']
  },
  {
    id: 'concerns',
    label: 'Specific Concerns (Multi-select)',
    options: ['School Quality', 'Flood Risk', 'Noise/Traffic', 'Future Resale', 'Renovation Needs', 'HOA Issues', 'Crime/Safety']
  },
  {
    id: 'horizon',
    label: 'Investment Horizon',
    options: ['Short-term (<3 yrs)', 'Medium (3-7 yrs)', 'Long-term (7+ yrs)']
  },
  {
    id: 'posture',
    label: 'Negotiation Posture',
    options: ['Aggressive – Lowest Possible', 'Balanced – Fair Market', 'Competitive – Must Win', 'Cautious – Risk Averse']
  }
];

const LISTING_DROPDOWNS = [
  {
    id: 'goal',
    label: 'Listing Goal',
    options: ['Price Optimization', 'Fast Sale', 'Premium Positioning', 'Competitive Edge', 'Investor Targeting']
  },
  {
    id: 'timeline',
    label: 'Seller Timeline',
    options: ['Immediate (<30 days)', 'Flexible (30-60 days)', 'Patient (60+ days)']
  },
  {
    id: 'budget',
    label: 'Improvement Budget',
    options: ['None – Sell As-Is', 'Minimal (<$5k)', 'Moderate ($5-15k)', 'Full ($15k+)']
  },
  {
    id: 'target',
    label: 'Target Buyer',
    options: ['First-Time Buyers', 'Families', 'Empty Nesters', 'Investors', 'Luxury Buyers', 'No Preference']
  },
  {
    id: 'stance',
    label: 'Competitive Stance',
    options: ['Price Leader (Below Market)', 'Market Matched', 'Premium Positioned', 'Luxury Niche']
  }
];

const SHARED_DROPDOWNS = [
  {
    id: 'beds',
    label: 'Bedrooms',
    options: ['Any', '1+', '2+', '3+', '4+', '5+']
  },
  {
    id: 'status',
    label: 'Status',
    options: ['Active Only', 'Active + Pending', 'All (Include Sold)']
  },
  {
    id: 'sort',
    label: 'Sort By',
    options: ['Relevance', 'Price (Low to High)', 'Price (High to Low)', 'Newest First', 'Days on Market']
  }
];

const MOCK_ZIPS: Record<string, string[]> = {
  '1': ['10001 - New York, NY', '02108 - Boston, MA', '19104 - Philadelphia, PA'],
  '2': ['33101 - Miami, FL', '30301 - Atlanta, GA', '78701 - Austin, TX'],
  '3': ['60601 - Chicago, IL', '48201 - Detroit, MI', '43215 - Columbus, OH'],
  '4': ['90210 - Beverly Hills, CA', '98101 - Seattle, WA', '80202 - Denver, CO']
};

export const MarketAlphaDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [agentMode, setAgentMode] = useState<AgentMode>('buying');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [selectedZip, setSelectedZip] = useState('');
  const [question, setQuestion] = useState('');
  const [maxRegions, setMaxRegions] = useState(2); // Mock based on tier
  const [formState, setFormState] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const toggleRegion = (id: string) => {
    if (selectedRegionIds.includes(id)) {
      setSelectedRegionIds(selectedRegionIds.filter(rid => rid !== id));
    } else {
      if (selectedRegionIds.length < maxRegions) {
        setSelectedRegionIds([...selectedRegionIds, id]);
      }
    }
  };

  const handleDropdownChange = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [`${agentMode}_${key}`]: value }));
  };

  const getAvailableZips = () => {
    let zips: string[] = [];
    selectedRegionIds.forEach(id => {
      if (MOCK_ZIPS[id]) zips = [...zips, ...MOCK_ZIPS[id]];
    });
    return zips;
  };

  const isFormValid = selectedRegionIds.length > 0 && selectedZip && question.length > 0;

  return (
    <div className="min-h-screen bg-[#1A0B1A] text-slate-200 font-sans selection:bg-purple-500 selection:text-white">
      {/* --- Header --- */}
      <header className="border-b border-white/5 bg-[#1A0B1A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8">
               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-sm">
                  <path d="M12 2L2.5 7.5V17.5L12 23L21.5 17.5V7.5L12 2Z" fill="#312e81" stroke="#6366f1" strokeWidth="1" strokeLinejoin="round"/>
                  <path d="M12 2V12.5M21.5 7.5L12 12.5M2.5 7.5L12 12.5" stroke="#6366f1" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="-1" y1="13" x2="25" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
               </svg>
             </div>
             <h1 className="text-sm font-bold tracking-[0.2em] text-emerald-400 uppercase hidden md:block">Real Estate Analytics System</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 font-medium">OPERATOR</p>
              <p className="text-sm font-bold text-white">{user?.email}</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-600/30 transition-colors">
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
                    ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500 shadow-lg shadow-indigo-900/20' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${agentMode === 'listing' ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                <h3 className={`text-xl font-bold mb-1 ${agentMode === 'listing' ? 'text-white' : 'text-slate-400'}`}>LISTING AGENT</h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Seller Representation</p>
              </button>

              <button 
                onClick={() => setAgentMode('buying')}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  agentMode === 'buying' 
                    ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500 shadow-lg shadow-indigo-900/20' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${agentMode === 'buying' ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                <h3 className={`text-xl font-bold mb-1 ${agentMode === 'buying' ? 'text-white' : 'text-slate-400'}`}>BUYING AGENT</h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Buyer Representation</p>
              </button>
            </div>

            {/* Dynamic Dropdowns */}
            <div className="bg-[#130813] border border-white/5 rounded-2xl p-6 space-y-5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">
                {agentMode === 'buying' ? 'Acquisition Parameters' : 'Disposition Parameters'}
              </h4>
              
              {(agentMode === 'buying' ? BUYER_DROPDOWNS : LISTING_DROPDOWNS).map((field) => (
                <div key={field.id}>
                  <label className="block text-xs text-indigo-300 font-bold mb-2 ml-1">{field.label}</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                    value={formState[`${agentMode}_${field.id}`] || ''}
                    onChange={(e) => handleDropdownChange(field.id, e.target.value)}
                  >
                    <option value="">Select option...</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
            
            <div className="bg-[#130813] border border-white/5 rounded-2xl p-6 space-y-5">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">
                Property Filters
              </h4>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-indigo-300 font-bold mb-2 ml-1">Min SqFt</label>
                    <input type="number" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-indigo-300 font-bold mb-2 ml-1">Max SqFt</label>
                    <input type="number" placeholder="Max" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none" />
                  </div>
               </div>
               {SHARED_DROPDOWNS.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs text-indigo-300 font-bold mb-2 ml-1">{field.label}</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all appearance-none">
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
              className="bg-[#241224] border border-dashed border-white/20 rounded-2xl p-8 cursor-pointer hover:border-indigo-500 hover:bg-[#2a152a] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {selectedRegionIds.length === 0 ? 'Select Target Region' : `${selectedRegionIds.length} Region${selectedRegionIds.length !== 1 ? 's' : ''} Selected`}
                  </h3>
                   <p className="text-slate-400 text-sm">
                    {selectedRegionIds.length === 0 ? 'Click to open geographical intelligence map' : `Analysis Scope: Region IDs [${selectedRegionIds.join(', ')}]`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" /></svg>
                </div>
              </div>
            </div>

            {/* Zip Code Selector (Conditional) */}
            {selectedRegionIds.length > 0 && (
               <div className="bg-[#130813] border border-white/5 rounded-2xl p-6 animate-fade-in">
                 <label className="block text-xs text-indigo-300 font-bold mb-3 ml-1 uppercase tracking-widest">Select Market Zip Code</label>
                 <select 
                   value={selectedZip}
                   onChange={(e) => setSelectedZip(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                 >
                   <option value="">-- Choose Zip Code from Selected Regions --</option>
                   {getAvailableZips().map(zip => (
                     <option key={zip} value={zip}>{zip}</option>
                   ))}
                 </select>
               </div>
            )}

            {/* Question Input */}
            <div className="bg-[#130813] border border-white/5 rounded-2xl p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <label className="block text-xs text-indigo-300 font-bold uppercase tracking-widest">Analysis Directive</label>
                 <span className="text-[10px] text-slate-500 uppercase">{question.length} chars</span>
              </div>
              
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g., Compare this property to market trends, analyze investment potential vs local cap rates..."
                className="w-full flex-grow min-h-[150px] bg-white/5 border border-white/10 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none mb-6"
              />

              <button 
                disabled={!isFormValid}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all ${
                  isFormValid 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-500/20 hover:scale-[1.01]' 
                    : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                }`}
              >
                {isFormValid ? 'Generate Intelligence Report' : 'Complete Selection to Generate'}
              </button>
            </div>

            {/* Placeholder Report Area */}
            <div className="border border-white/5 rounded-2xl p-8 bg-[#130813]/50">
               <div className="flex items-center gap-2 mb-6 opacity-50">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Report Preview Area</span>
               </div>
               <div className="space-y-4 opacity-30">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-5/6"></div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- Footer (Simple) --- */}
      <footer className="border-t border-white/5 bg-[#130813] py-8 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
           <p className="text-xs text-slate-600">Hydrel Systems v3.2.1 • Secure Connection Established</p>
        </div>
      </footer>

      {/* --- Map Modal --- */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1A0B1A] flex flex-col animate-fade-in">
          <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#1A0B1A]">
             <h2 className="text-xl font-bold text-white tracking-wider">REGIONAL SELECTION</h2>
             <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-slate-800 rounded-full text-xs font-bold text-slate-400 border border-slate-700">
                  {selectedRegionIds.length} / {maxRegions} Selected
               </div>
               <button 
                onClick={() => setIsMapOpen(false)}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors text-sm"
              >
                CONFIRM SELECTION
              </button>
             </div>
          </div>
          
          <div className="flex-grow relative flex items-center justify-center p-10 overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 to-[#1A0B1A]">
             {/* Abstract US Map SVG */}
             <div className="relative w-full max-w-5xl aspect-[16/9]">
               <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-2xl">
                 <defs>
                   <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                     <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                   </pattern>
                 </defs>
                 
                 {/* West (Region 4) */}
                 <path 
                    d="M 50 20 L 300 20 L 300 150 L 250 150 L 250 350 L 200 450 L 20 400 L 20 100 Z"
                    className={`transition-all duration-300 cursor-pointer hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] ${selectedRegionIds.includes('4') ? 'fill-blue-600/30' : 'fill-transparent hover:fill-blue-500/10'}`}
                    stroke={selectedRegionIds.includes('4') ? '#60a5fa' : '#fbbf24'} // Yellow lines usually, Blue if selected
                    strokeWidth="2"
                    onClick={() => toggleRegion('4')}
                 />
                 <text x="150" y="200" fill="white" className="text-xs font-bold opacity-50 pointer-events-none">REGION 4 (WEST)</text>

                 {/* Midwest (Region 3) */}
                 <path 
                    d="M 300 20 L 550 20 L 580 80 L 580 200 L 450 200 L 450 250 L 300 250 Z"
                    className={`transition-all duration-300 cursor-pointer hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] ${selectedRegionIds.includes('3') ? 'fill-blue-600/30' : 'fill-transparent hover:fill-blue-500/10'}`}
                    stroke={selectedRegionIds.includes('3') ? '#60a5fa' : '#fbbf24'}
                    strokeWidth="2"
                    onClick={() => toggleRegion('3')}
                 />
                 <text x="400" y="150" fill="white" className="text-xs font-bold opacity-50 pointer-events-none">REGION 3 (MIDWEST)</text>

                 {/* Northeast (Region 1) */}
                 <path 
                    d="M 550 20 L 750 10 L 780 150 L 650 200 L 580 200 L 580 80 Z"
                    className={`transition-all duration-300 cursor-pointer hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] ${selectedRegionIds.includes('1') ? 'fill-blue-600/30' : 'fill-transparent hover:fill-blue-500/10'}`}
                    stroke={selectedRegionIds.includes('1') ? '#60a5fa' : '#fbbf24'}
                    strokeWidth="2"
                    onClick={() => toggleRegion('1')}
                 />
                 <text x="650" y="100" fill="white" className="text-xs font-bold opacity-50 pointer-events-none">REGION 1 (NE)</text>

                 {/* Southeast (Region 2) */}
                 <path 
                    d="M 300 250 L 450 250 L 450 200 L 650 200 L 620 350 L 680 450 L 500 450 L 350 400 L 300 300 Z"
                    className={`transition-all duration-300 cursor-pointer hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] ${selectedRegionIds.includes('2') ? 'fill-blue-600/30' : 'fill-transparent hover:fill-blue-500/10'}`}
                    stroke={selectedRegionIds.includes('2') ? '#60a5fa' : '#fbbf24'}
                    strokeWidth="2"
                    onClick={() => toggleRegion('2')}
                 />
                 <text x="500" y="350" fill="white" className="text-xs font-bold opacity-50 pointer-events-none">REGION 2 (SE)</text>
                 
                 {/* Decorative Grid Overlay */}
                 <rect width="100%" height="100%" fill="url(#grid)" className="pointer-events-none" />
                 
                 {/* State Border Simulation (Red Lines) - Abstracted */}
                 <path d="M 300 20 L 300 250" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" className="opacity-70 pointer-events-none"/>
                 <path d="M 580 80 L 580 200" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" className="opacity-70 pointer-events-none"/>
                 <path d="M 450 200 L 450 250" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" className="opacity-70 pointer-events-none"/>
                 
               </svg>
             </div>
             
             <div className="absolute bottom-10 left-10 text-slate-500 text-xs font-mono">
               <p>MAP_PROJECTION: MERCATOR_SIMPLIFIED</p>
               <p>BOUNDARY_LAYER: ACTIVE</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
