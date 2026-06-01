/**
 * engines/ListingEngine.tsx
 */

import React, { useState } from 'react';
import { SharedDashboardProps } from '../DashboardLayout';
import { EngineLayout, PillGroup, inputClass, selectClass, playClick } from './EngineLayout';

const COLOR = '#f97316';

const GOAL_OPTS     = ['Price Optimization','Fast Sale','Premium Positioning','Competitive Edge','Investor Targeting','Maximize Price'];
const TIMELINE_OPTS = ['Immediate (<30 days)','Flexible (30-60 days)','Patient (60+ days)'];
const TARGET_OPTS   = ['First-Time Buyers','Families','Empty Nesters','Investors','Luxury Buyers','No Preference'];
const STANCE_OPTS   = ['Price Leader (Below Market)','Market Matched','Premium Positioned','Luxury Niche'];
const CONDITION_OPTS= ['Run down','Average','Good','Newly renovated'];

const ListingEngine: React.FC<SharedDashboardProps> = (props) => {
  const { handleAnalyze, selectedZip } = props;

  const [question, setQuestion] = useState('');
  const [improveBudget, setImproveBudget] = useState('');
  const [sqft, setSqft] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [kitchenCond, setKitchenCond] = useState('Average');
  const [bathCond,    setBathCond]    = useState('Average');
  const [garageCond,  setGarageCond]  = useState('Average');
  const [overallCond, setOverallCond] = useState('Average');

  const [selGoal,     setSelGoal]     = useState<string[]>([]);
  const [selTimeline, setSelTimeline] = useState<string[]>([]);
  const [selTarget,   setSelTarget]   = useState<string[]>([]);
  const [selStance,   setSelStance]   = useState<string[]>([]);

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, single?: boolean) =>
    (opt: string) => {
      playClick();
      setter(prev => {
        if (single) return [opt];
        if (prev.includes(opt)) return prev.filter(o => o !== opt);
        if (setter === setSelGoal && prev.length >= 2) return prev;
        return [...prev, opt];
      });
    };

  const isValid = selGoal.length > 0 && selTimeline.length > 0
               && selTarget.length > 0 && selStance.length > 0;

  const onSubmit = async () => {
    if (!selectedZip?.value) { alert('Select a zip code.'); return; }
    const params = {
      zip_code:           selectedZip.value,
      sqft:               Number(sqft)   || 0,
      bedrooms:           Number(beds)   || 0,
      bathrooms_full:     Number(baths)  || 0,
      bathrooms_half:     0,
      lot_size_sqft:      null,
      year_built:         null,
      seller_goal:        selGoal.join(', '),
      improvement_budget: Number(improveBudget) || 0,
      timeline:           selTimeline.join(', '),
      target_buyer:       selTarget.join(', '),
      competitive_stance: selStance.join(', '),
      kitchen_condition:  kitchenCond.toLowerCase(),
      bathroom_condition: bathCond.toLowerCase(),
      garage_condition:   garageCond === 'N/A' ? 'NA' : garageCond.toLowerCase(),
      overall_condition:  overallCond.toLowerCase(),
      analysis_directive: question,
    };
    await handleAnalyze('listing', params);
  };

  const paramRows = (
    <>
      <div className="min-w-[140px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Improvement Budget ($)</p>
        <input type="number" value={improveBudget} onChange={e => setImproveBudget(e.target.value)}
          placeholder="e.g. 10000" className={inputClass} />
      </div>

      <div className="min-w-[120px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sqft</p>
        <input type="number" value={sqft} onChange={e => setSqft(e.target.value)}
          placeholder="e.g. 1800" className={inputClass} />
      </div>

      <div className="min-w-[100px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Beds</p>
        <input type="number" value={beds} onChange={e => setBeds(e.target.value)}
          placeholder="e.g. 3" className={inputClass} />
      </div>

      <div className="min-w-[100px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Baths</p>
        <input type="number" value={baths} onChange={e => setBaths(e.target.value)}
          placeholder="e.g. 2" className={inputClass} />
      </div>

      {[
        { label: 'Kitchen Condition', val: kitchenCond, set: setKitchenCond, extra: false },
        { label: 'Bathroom Condition',val: bathCond,    set: setBathCond,    extra: false },
        { label: 'Garage Condition',  val: garageCond,  set: setGarageCond,  extra: true  },
        { label: 'Overall Condition', val: overallCond, set: setOverallCond, extra: false },
      ].map(({ label, val, set, extra }) => (
        <div key={label} className="min-w-[150px] flex-1 space-y-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</p>
          <select value={val} onChange={e => set(e.target.value)} className={selectClass}>
            {[...CONDITION_OPTS, ...(extra ? ['N/A'] : [])].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      ))}

      <PillGroup label="Seller Goal * (max 2)" options={GOAL_OPTS}
        selected={selGoal} onToggle={toggle(setSelGoal)} color={COLOR} />
      <PillGroup label="Timeline *" options={TIMELINE_OPTS}
        selected={selTimeline} onToggle={toggle(setSelTimeline, true)} color={COLOR} />
      <PillGroup label="Target Buyer *" options={TARGET_OPTS}
        selected={selTarget} onToggle={toggle(setSelTarget)} color={COLOR} />
      <PillGroup label="Competitive Stance *" options={STANCE_OPTS}
        selected={selStance} onToggle={toggle(setSelStance)} color={COLOR} />
    </>
  );

  return (
    <EngineLayout {...props} engineColor={COLOR} paramRows={paramRows}
      isValid={isValid} onSubmit={onSubmit} question={question} setQuestion={setQuestion} />
  );
};

export default ListingEngine;
