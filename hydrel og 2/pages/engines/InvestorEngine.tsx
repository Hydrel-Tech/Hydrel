/**
 * engines/InvestorEngine.tsx
 */

import React, { useState } from 'react';
import { SharedDashboardProps } from '../DashboardLayout';
import { EngineLayout, inputClass, selectClass, playClick } from './EngineLayout';

const COLOR = '#10b981';

const InvestorEngine: React.FC<SharedDashboardProps> = (props) => {
  const { handleAnalyze, selectedZip } = props;

  const [question,    setQuestion]    = useState('');
  const [minPrice,    setMinPrice]    = useState('');
  const [maxPrice,    setMaxPrice]    = useState('');
  const [minSqft,     setMinSqft]     = useState('');
  const [maxSqft,     setMaxSqft]     = useState('');
  const [capRate,     setCapRate]     = useState('');
  const [riskTol,     setRiskTol]     = useState('medium');
  const [holdPeriod,  setHoldPeriod]  = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [maxPurchase, setMaxPurchase] = useState('');
  const [financing,   setFinancing]   = useState('');
  const [beds,   setBeds]   = useState('Any');
  const [baths,  setBaths]  = useState('Any');
  const [status, setStatus] = useState('Active Only');
  const [sort,   setSort]   = useState('Relevance');

  const isValid = !!minPrice || !!maxPrice || !!capRate;

  const onSubmit = async () => {
    if (!selectedZip?.value) { alert('Select a zip code.'); return; }
    const params = {
      zip_code:            selectedZip.value,
      min_price:           Number(minPrice)    || 0,
      max_price:           Number(maxPrice)    || 0,
      min_sqft:            Number(minSqft)     || 0,
      max_sqft:            Number(maxSqft)     || 0,
      bedrooms:            beds,
      bathrooms:           baths,
      status,
      sort_by:             sort,
      target_cap_rate:     Number(capRate)     || 0,
      risk_tolerance:      riskTol.charAt(0).toUpperCase() + riskTol.slice(1),
      holding_period:      Number(holdPeriod)  || 0,
      down_payment_percent:Number(downPayment) || 0,
      analysis_directive:  question,
      mortgage_rate:       null,
      garage:              'Any',
    };
    await handleAnalyze('investor', params);
  };

  const paramRows = (
    <>
      <div className="min-w-[200px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Range ($)</p>
        <div className="flex gap-2">
          <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
            placeholder="Min" className={inputClass} />
          <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            placeholder="Max" className={inputClass} />
        </div>
      </div>

      <div className="min-w-[200px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sqft Range</p>
        <div className="flex gap-2">
          <input type="number" value={minSqft} onChange={e => setMinSqft(e.target.value)}
            placeholder="Min" className={inputClass} />
          <input type="number" value={maxSqft} onChange={e => setMaxSqft(e.target.value)}
            placeholder="Max" className={inputClass} />
        </div>
      </div>

      <div className="min-w-[130px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Cap Rate (%)</p>
        <input type="number" value={capRate} onChange={e => setCapRate(e.target.value)}
          placeholder="e.g. 7.5" className={inputClass} />
      </div>

      <div className="min-w-[140px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk Tolerance</p>
        <select value={riskTol} onChange={e => setRiskTol(e.target.value)} className={selectClass}>
          <option value="low">Low (Conservative)</option>
          <option value="medium">Medium (Moderate)</option>
          <option value="high">High (Aggressive)</option>
        </select>
      </div>

      <div className="min-w-[120px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Down Payment (%)</p>
        <input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)}
          placeholder="e.g. 20" className={inputClass} />
      </div>

      <div className="min-w-[130px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Holding Period (yrs)</p>
        <input type="number" value={holdPeriod} onChange={e => setHoldPeriod(e.target.value)}
          placeholder="e.g. 5" className={inputClass} />
      </div>

      <div className="min-w-[150px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Purchase ($)</p>
        <input type="number" value={maxPurchase} onChange={e => setMaxPurchase(e.target.value)}
          placeholder="e.g. 750000" className={inputClass} />
      </div>

      <div className="min-w-[170px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Financing</p>
        <input type="text" value={financing} onChange={e => setFinancing(e.target.value)}
          placeholder="e.g. Conventional" className={inputClass} />
      </div>

      <div className="min-w-[120px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bedrooms</p>
        <select value={beds} onChange={e => setBeds(e.target.value)} className={selectClass}>
          {['Any','1+','2+','3+','4+','5+'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="min-w-[120px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</p>
        <select value={status} onChange={e => setStatus(e.target.value)} className={selectClass}>
          {['Active Only','Active + Pending','All (Include Sold)'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <EngineLayout {...props} engineColor={COLOR} paramRows={paramRows}
      isValid={isValid} onSubmit={onSubmit} question={question} setQuestion={setQuestion} />
  );
};

export default InvestorEngine;
