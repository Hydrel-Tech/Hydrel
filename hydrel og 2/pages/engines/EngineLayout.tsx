/**
 * engines/EngineLayout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared layout used by BuyerEngine, ListingEngine, InvestorEngine, FlipperEngine.
 *
 * Structure:
 *   Row 1: [Region selector card]  [Zip selector]
 *   Row 2: [Parameters — horizontal wrap]
 *   Row 3: [Analysis directive textarea]
 *   Row 4: [Generate button]
 *   Row 5: [Output feed placeholder]
 */

import React, { useState, useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import { FixedSizeList as List } from 'react-window';
import { motion, AnimatePresence } from 'framer-motion';
import { SharedDashboardProps } from '../DashboardLayout';

// ─── Virtualized zip menu ─────────────────────────────────────────────────────

const ITEM_H = 35;

const VirtualizedMenuList = (props: any) => {
  const { options, children, maxHeight, getValue } = props;
  const arr = React.Children.toArray(children);
  const [sel] = getValue();
  const height = Math.min(maxHeight || 300, arr.length * ITEM_H);
  if (arr.length === 0) return (
    <div className="p-4 text-center text-slate-500 text-sm">No matching zip codes</div>
  );
  return (
    <List height={height} itemCount={arr.length} itemSize={ITEM_H}
      initialScrollOffset={sel ? options.indexOf(sel) * ITEM_H : 0} width="100%">
      {({ index, style }) => <div style={style}>{arr[index]}</div>}
    </List>
  );
};

// ─── Debounce ─────────────────────────────────────────────────────────────────

function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ─── Shared input classes ─────────────────────────────────────────────────────

export const inputClass =
  'w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 ' +
  'rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 focus:outline-none ' +
  'transition-all dark:text-white';

export const selectClass = inputClass + ' appearance-none';

// ─── Pill checkbox group ──────────────────────────────────────────────────────

interface PillGroupProps {
  label:    string;
  options:  string[];
  selected: string[];
  onToggle: (opt: string) => void;
  color:    string;
}

export const PillGroup: React.FC<PillGroupProps> = ({
  label, options, selected, onToggle, color,
}) => (
  <div className="min-w-[180px] flex-1">
    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase
                  tracking-widest mb-2 ml-1">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <motion.button
            key={opt}
            onClick={() => onToggle(opt)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.93 }}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors border"
            style={active
              ? { background: color, borderColor: color, color: '#fff' }
              : { background: 'transparent', borderColor: color + '33', color: '#64748b' }
            }
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  </div>
);

// ─── Synthetic click sound ────────────────────────────────────────────────────

export const playClick = () => {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.10, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.09);
  } catch (_) {}
};

// ─── EngineLayout ─────────────────────────────────────────────────────────────

interface EngineLayoutProps extends SharedDashboardProps {
  engineColor:   string;
  // Parameters rendered horizontally — passed by each engine
  paramRows:     React.ReactNode;
  // Validation — each engine provides its own
  isValid:       boolean;
  onSubmit:      () => Promise<void>;
  question:      string;
  setQuestion:   (q: string) => void;
}

export const EngineLayout: React.FC<EngineLayoutProps> = ({
  engineColor,
  paramRows,
  isValid,
  onSubmit,
  question,
  setQuestion,
  // SharedDashboardProps
  selectedRegionIds,
  savedRegions,
  maxRegions,
  selectedZip,
  setSelectedZip,
  loadZipOptions,
  openMapModal,
  processing,
  limitReached,
  usageCount,
  monthlyLimit,
  isDarkMode,
}) => {

  const debouncedLoad = useCallback(
    debounce((input: string, cb: (opts: any[]) => void) => {
      loadZipOptions(input).then(cb);
    }, 300),
    [loadZipOptions],
  );

  const formValid = isValid && !!selectedZip?.value && question.length > 0 && !limitReached;

  return (
    <div className="space-y-5">

      {/* ── Row 1: Region + Zip ─────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Region selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 360, damping: 30 }}
          onClick={() => { playClick(); openMapModal(); }}
          whileHover={{ scale: 1.015, y: -3 }}
          whileTap={{ scale: 0.985 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border rounded-2xl
                     p-5 cursor-pointer group relative overflow-hidden shadow-sm transition-colors"
          style={{ borderColor: engineColor + '44' }}
        >
          <div className="absolute top-0 left-0 w-1.5 h-full transition-colors rounded-l-2xl"
               style={{ background: selectedRegionIds.length > 0 ? engineColor : engineColor + '33' }} />
          <div className="pl-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1"
                 style={{ color: engineColor }}>Target Region</p>
              <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {selectedRegionIds.length === 0
                  ? 'Select Region'
                  : `${selectedRegionIds.length} Region${selectedRegionIds.length !== 1 ? 's' : ''} Active`}
              </p>
              {selectedRegionIds.length > 0 && (
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  [{selectedRegionIds.join(', ')}]
                </p>
              )}
            </div>
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: engineColor + '1a', color: engineColor }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Zip selector */}
        <AnimatePresence>
          {selectedRegionIds.length > 0 ? (
            <motion.div
              key="zip"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="bg-white dark:bg-slate-800 border border-slate-200
                         dark:border-slate-700 rounded-2xl p-5 shadow-sm relative z-30"
            >
              <p className="text-[9px] font-black uppercase tracking-widest mb-3 ml-1"
                 style={{ color: engineColor }}>Target Market Index (Zip)</p>
              <AsyncSelect
                cacheOptions
                loadOptions={debouncedLoad}
                defaultOptions={false}
                value={selectedZip}
                onChange={opt => { playClick(); setSelectedZip(opt); }}
                placeholder="Search zip code (e.g. 90210)"
                isClearable
                noOptionsMessage={({ inputValue }) =>
                  !inputValue || inputValue.length < 2 ? 'Enter at least 2 digits' : 'No results'
                }
                className="w-full"
                classNamePrefix="react-select"
                components={{ MenuList: VirtualizedMenuList }}
                styles={{
                  control: base => ({
                    ...base,
                    backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    borderRadius: '12px', minHeight: '44px', boxShadow: 'none',
                    borderWidth: '2px',
                    '&:hover': { borderColor: engineColor },
                    '&:focus-within': { borderColor: engineColor },
                  }),
                  menu: base => ({
                    ...base, zIndex: 50, borderRadius: '12px', overflow: 'hidden',
                    backgroundColor: isDarkMode ? '#1e293b' : 'white',
                  }),
                  option: (base, { isFocused, isSelected }) => ({
                    ...base,
                    backgroundColor: isSelected ? engineColor
                      : isFocused ? (isDarkMode ? '#334155' : '#f1f5f9') : 'transparent',
                    color: isSelected ? '#fff' : isDarkMode ? '#f8fafc' : '#1e293b',
                    fontSize: '13px', padding: '8px 16px',
                  }),
                  singleValue: base => ({ ...base, color: isDarkMode ? '#f8fafc' : '#1e293b' }),
                  input: base => ({ ...base, color: isDarkMode ? '#f8fafc' : '#1e293b' }),
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="zip-empty"
              className="bg-slate-50 dark:bg-slate-800/50 border border-dashed
                         border-slate-200 dark:border-slate-700 rounded-2xl p-5
                         flex items-center justify-center"
            >
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                Select a region first
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Row 2: Parameters (horizontal) ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 340, damping: 30 }}
        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border
                   border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500
                        uppercase tracking-widest">Engine Parameters</p>
          <span className="px-2.5 py-1 text-[9px] font-black rounded-full uppercase text-white"
                style={{ background: engineColor }}>
            Required
          </span>
        </div>
        {/* Horizontal scroll container on mobile, wrap on desktop */}
        <div className="flex flex-wrap gap-5">
          {paramRows}
        </div>
      </motion.div>

      {/* ── Row 3: Analysis directive ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 340, damping: 30 }}
        className="bg-white dark:bg-slate-800 border border-slate-200
                   dark:border-slate-700 rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500
                        uppercase tracking-widest">Analysis Directive</p>
          <span className={`text-[9px] font-black uppercase
            ${limitReached ? 'text-red-500' : 'text-slate-400'}`}>
            {limitReached ? 'Monthly Limit Reached' : `${usageCount} / ${monthlyLimit} used`}
          </span>
        </div>
        <motion.textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onFocus={() => playClick()}
          placeholder="E.g., Compare this market to local trends, identify risk factors, find hidden value..."
          whileFocus={{ boxShadow: `0 0 0 3px ${engineColor}22` }}
          className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-900 border-2
                     border-slate-100 dark:border-slate-700 rounded-xl p-4
                     text-slate-800 dark:text-slate-100 placeholder-slate-400
                     dark:placeholder-slate-600 focus:outline-none transition-all
                     resize-none font-medium text-sm"
          style={{ ['--tw-ring-color' as any]: engineColor }}
        />
      </motion.div>

      {/* ── Row 4: Generate button ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 340, damping: 30 }}
        className="relative"
      >
        {/* Pulse ring when valid */}
        <AnimatePresence>
          {formValid && !processing && (
            <motion.div
              key="ring"
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ border: `2px solid ${engineColor}55` }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={async () => { playClick(); await onSubmit(); }}
          disabled={!formValid || processing}
          whileHover={formValid && !processing ? { scale: 1.02, y: -1 } : {}}
          whileTap={formValid && !processing ? { scale: 0.97 } : {}}
          animate={formValid && !processing ? {
            boxShadow: [
              `0 4px 20px ${engineColor}33`,
              `0 8px 36px ${engineColor}66`,
              `0 4px 20px ${engineColor}33`,
            ],
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full py-4 rounded-2xl font-black text-xs uppercase
                     tracking-[0.2em] transition-colors relative z-10"
          style={formValid
            ? { background: engineColor, color: '#fff' }
            : { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', border: '1px solid #e2e8f0' }
          }
        >
          {limitReached
            ? 'Limit Reached — Upgrade Plan'
            : processing
            ? 'Processing…'
            : 'Generate Intelligence Report'}
        </motion.button>
      </motion.div>

      {/* ── Row 5: Output feed placeholder ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.28 }}
        className="border-2 border-dashed border-slate-200 dark:border-slate-700
                   rounded-2xl p-8 bg-slate-50/50 dark:bg-slate-800/50"
      >
        <div className="flex items-center gap-2 mb-5 opacity-40">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Intelligence Output Feed
          </span>
        </div>
        <div className="space-y-3 opacity-5">
          <div className="h-2.5 bg-slate-900 dark:bg-white rounded-full w-3/4" />
          <div className="h-2.5 bg-slate-900 dark:bg-white rounded-full w-1/2" />
          <div className="h-2.5 bg-slate-900 dark:bg-white rounded-full w-full" />
          <div className="h-2.5 bg-slate-900 dark:bg-white rounded-full w-2/3" />
        </div>
      </motion.div>
    </div>
  );
};
