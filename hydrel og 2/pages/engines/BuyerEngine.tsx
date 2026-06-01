/**
 * engines/BuyerEngine.tsx
 * Buying Agent — all parameters + submit logic.
 * Supabase insert targets: buyer_parameters + user_analyses
 */

import React, { useState } from 'react';
import { SharedDashboardProps } from '../DashboardLayout';
import { EngineLayout, PillGroup, inputClass, selectClass, playClick } from './EngineLayout';

const COLOR = '#6366f1';

const FOCUS_OPTS    = ['Making an Offer','Investment Analysis','Comparison Shopping','Risk Assessment','Long-term Value'];
const CONCERN_OPTS  = ['School Quality','Flood Risk','Noise/Traffic','Future Resale','Renovation Needs','HOA Issues','Crime/Safety'];
const HORIZON_OPTS  = ['Short-term (<3 yrs)','Medium (3-7 yrs)','Long-term (7+ yrs)'];
const POSTURE_OPTS  = ['Aggressive – Lowest Possible','Balanced – Fair Market','Competitive – Must Win','Cautious – Risk Averse'];
const BED_OPTS      = ['Any','1+','2+','3+','4+','5+'];
const BATH_OPTS     = ['Any','1+','2+','3+','4+','5+'];
const STATUS_OPTS   = ['Active Only','Active + Pending','All (Include Sold)'];
const SORT_OPTS     = ['Relevance','Price (Low to High)','Price (High to Low)','Newest First','Days on Market'];

const BuyerEngine: React.FC<SharedDashboardProps> = (props) => {
  const { handleAnalyze, selectedZip } = props;

  const [question, setQuestion] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [budget,   setBudget]   = useState('');
  const [occupants, setOccupants] = useState('');
  const [schoolDist, setSchoolDist] = useState('');
  const [minBeds, setMinBeds] = useState('');
  const [safety, setSafety] = useState('medium');
  const [beds,   setBeds]   = useState('Any');
  const [baths,  setBaths]  = useState('Any');
  const [status, setStatus] = useState('Active Only');
  const [sort,   setSort]   = useState('Relevance');
  const [minSqft, setMinSqft] = useState('');
  const [maxSqft, setMaxSqft] = useState('');

  const [selectedFocus,   setSelectedFocus]   = useState<string[]>([]);
  const [selectedConcerns,setSelectedConcerns]= useState<string[]>([]);
  const [selectedHorizon, setSelectedHorizon] = useState<string[]>([]);
  const [selectedPosture, setSelectedPosture] = useState<string[]>([]);

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (opt: string) => {
    playClick();
    setter(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  };

  const isValid =
    selectedFocus.length > 0 &&
    selectedConcerns.length > 0 &&
    selectedHorizon.length > 0 &&
    selectedPosture.length > 0;

  const onSubmit = async () => {
    if (!selectedZip?.value) { alert('Select a zip code.'); return; }
    const params = {
      zip_code:           selectedZip.value,
      min_price:          Number(minPrice) || null,
      max_price:          Number(maxPrice) || null,
      min_sqft:           Number(minSqft)  || null,
      max_sqft:           Number(maxSqft)  || null,
      bedrooms:           beds,
      bathrooms:          baths,
      status:             status,
      sort_by:            sort,
      budget:             Number(budget)   || 0,
      family_size:        Number(occupants)|| 0,
      school_distance:    Number(schoolDist)||0,
      min_bedrooms:       Number(minBeds)  || 0,
      safety_priority:    safety.charAt(0).toUpperCase() + safety.slice(1),
      analysis_focus:     selectedFocus.join(', '),
      specific_concerns:  selectedConcerns,
      investment_horizon: selectedHorizon.join(', '),
      negotiation_posture:selectedPosture.join(', '),
      analysis_directive: question,
      condition_preference:'Any',
      garage:             'Any',
    };
    await handleAnalyze('buyer', params);
  };

  const paramRows = (
    <>
      {/* Price range */}
      <div className="min-w-[200px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Range ($)</p>
        <div className="flex gap-2">
          <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
            placeholder="Min" className={inputClass} />
          <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            placeholder="Max" className={inputClass} />
        </div>
      </div>

      {/* Budget */}
      <div className="min-w-[140px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget ($)</p>
        <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
          placeholder="e.g. 500000" className={inputClass} />
      </div>

      {/* Occupants */}
      <div className="min-w-[120px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Occupants</p>
        <input type="number" value={occupants} onChange={e => setOccupants(e.target.value)}
          placeholder="e.g. 4" className={inputClass} />
      </div>

      {/* School distance */}
      <div className="min-w-[120px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">School Dist (mi)</p>
        <input type="number" value={schoolDist} onChange={e => setSchoolDist(e.target.value)}
          placeholder="e.g. 2" className={inputClass} />
      </div>

      {/* Min bedrooms */}
      <div className="min-w-[110px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Beds</p>
        <input type="number" value={minBeds} onChange={e => setMinBeds(e.target.value)}
          placeholder="e.g. 3" className={inputClass} />
      </div>

      {/* Safety */}
      <div className="min-w-[130px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Safety Priority</p>
        <select value={safety} onChange={e => setSafety(e.target.value)} className={selectClass}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Sqft */}
      <div className="min-w-[200px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sqft Range</p>
        <div className="flex gap-2">
          <input type="number" value={minSqft} onChange={e => setMinSqft(e.target.value)}
            placeholder="Min" className={inputClass} />
          <input type="number" value={maxSqft} onChange={e => setMaxSqft(e.target.value)}
            placeholder="Max" className={inputClass} />
        </div>
      </div>

      {/* Shared dropdowns */}
      <div className="min-w-[120px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bedrooms</p>
        <select value={beds} onChange={e => setBeds(e.target.value)} className={selectClass}>
          {BED_OPTS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="min-w-[120px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bathrooms</p>
        <select value={baths} onChange={e => setBaths(e.target.value)} className={selectClass}>
          {BATH_OPTS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="min-w-[140px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</p>
        <select value={status} onChange={e => setStatus(e.target.value)} className={selectClass}>
          {STATUS_OPTS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Pill groups */}
      <PillGroup label="Analysis Focus *" options={FOCUS_OPTS}
        selected={selectedFocus} onToggle={toggle(setSelectedFocus)} color={COLOR} />
      <PillGroup label="Specific Concerns *" options={CONCERN_OPTS}
        selected={selectedConcerns} onToggle={toggle(setSelectedConcerns)} color={COLOR} />
      <PillGroup label="Investment Horizon *" options={HORIZON_OPTS}
        selected={selectedHorizon} onToggle={toggle(setSelectedHorizon)} color={COLOR} />
      <PillGroup label="Negotiation Posture *" options={POSTURE_OPTS}
        selected={selectedPosture} onToggle={toggle(setSelectedPosture)} color={COLOR} />
    </>
  );

  return (
    <EngineLayout
      {...props}
      engineColor={COLOR}
      paramRows={paramRows}
      isValid={isValid}
      onSubmit={onSubmit}
      question={question}
      setQuestion={setQuestion}
    />
  );
};

export default BuyerEngine;
