/**
 * engines/FlipperEngine.tsx
 */

import React, { useState } from 'react';
import { SharedDashboardProps } from '../DashboardLayout';
import { EngineLayout, inputClass, selectClass, playClick } from './EngineLayout';

const COLOR = '#f59e0b';

const FlipperEngine: React.FC<SharedDashboardProps> = (props) => {
  const { handleAnalyze, selectedZip } = props;

  const [question,     setQuestion]     = useState('');
  const [minPrice,     setMinPrice]     = useState('');
  const [maxPrice,     setMaxPrice]     = useState('');
  const [purchasePrice,setPurchasePrice]= useState('');
  const [renoBudget,   setRenoBudget]   = useState('');
  const [targetProfit, setTargetProfit] = useState('');
  const [profitType,   setProfitType]   = useState('usd');
  const [holdPeriod,   setHoldPeriod]   = useState('');
  const [minSqft,      setMinSqft]      = useState('');
  const [maxSqft,      setMaxSqft]      = useState('');
  const [beds,   setBeds]   = useState('Any');
  const [baths,  setBaths]  = useState('Any');
  const [status, setStatus] = useState('Active Only');

  const isValid = (!!minPrice || !!maxPrice) && !!purchasePrice;

  const validatePriceRange = () => {
    const p = parseFloat(purchasePrice);
    const mn = parseFloat(minPrice);
    const mx = parseFloat(maxPrice);
    if (!isNaN(mn) && !isNaN(mx) && mn > mx) return false;
    if (!isNaN(p) && !isNaN(mn) && p < mn)    return false;
    if (!isNaN(p) && !isNaN(mx) && p > mx)    return false;
    return true;
  };

  const onSubmit = async () => {
    if (!selectedZip?.value) { alert('Select a zip code.'); return; }
    if (!validatePriceRange()) { alert('Invalid price configuration.'); return; }
    const params = {
      zip_code:            selectedZip.value,
      min_price:           Number(minPrice)      || 0,
      max_price:           Number(maxPrice)      || 0,
      min_sqft:            Number(minSqft)       || 0,
      max_sqft:            Number(maxSqft)       || 0,
      bedrooms:            beds,
      bathrooms:           baths,
      status,
      sort_by:             'Relevance',
      purchase_price:      Number(purchasePrice) || 0,
      renovation_budget:   Number(renoBudget)    || 0,
      target_profit:       targetProfit + (profitType === 'percentage' ? '%' : ''),
      holding_period:      Number(holdPeriod)    || 0,
      analysis_directive:  question,
      condition_preference:'Needs Work',
      garage:              'Any',
    };
    await handleAnalyze('flipper', params);
  };

  const paramRows = (
    <>
      <div className="min-w-[200px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Price Range ($)</p>
        <div className="flex gap-2">
          <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
            placeholder="Min" className={inputClass} />
          <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            placeholder="Max" className={inputClass} />
        </div>
      </div>

      <div className="min-w-[140px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Price ($) *</p>
        <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)}
          placeholder="e.g. 300000" className={inputClass} />
      </div>

      <div className="min-w-[140px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Renovation Budget ($)</p>
        <input type="number" value={renoBudget} onChange={e => setRenoBudget(e.target.value)}
          placeholder="e.g. 50000" className={inputClass} />
      </div>

      <div className="min-w-[160px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Profit</p>
        <div className="flex gap-2">
          <input type="number" value={targetProfit} onChange={e => setTargetProfit(e.target.value)}
            placeholder="e.g. 40000" className={inputClass} />
          <select value={profitType} onChange={e => setProfitType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700
                       rounded-xl px-3 py-3 text-sm font-medium focus:border-amber-500 focus:outline-none
                       transition-all appearance-none dark:text-white">
            <option value="usd">$</option>
            <option value="percentage">%</option>
          </select>
        </div>
      </div>

      <div className="min-w-[130px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Holding Period (mo)</p>
        <input type="number" value={holdPeriod} onChange={e => setHoldPeriod(e.target.value)}
          placeholder="e.g. 6" className={inputClass} />
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

      <div className="min-w-[120px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bedrooms</p>
        <select value={beds} onChange={e => setBeds(e.target.value)} className={selectClass}>
          {['Any','1+','2+','3+','4+','5+'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="min-w-[120px] flex-1 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bathrooms</p>
        <select value={baths} onChange={e => setBaths(e.target.value)} className={selectClass}>
          {['Any','1+','2+','3+','4+','5+'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="min-w-[140px] flex-1 space-y-2">
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

export default FlipperEngine;
