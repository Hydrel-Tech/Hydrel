
import React from 'react';
import { Link } from 'react-router-dom';
import { ARCHITECTURES } from '../constants';
import { SystemStatus } from '../types';

export const ArchitecturesGrid: React.FC = () => {
  const getRoute = (id: string) => {
    switch (id) {
      case 'real-estate': return '/market-alpha';
      case 'outbound': return '/HyperPersonalizedOutboundSystem';
      case 'marketing': return '/UnifiedMarketingIntelligence';
      case 'data-mining': return '/NicheCommercialDataMining';
      default: return '/';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-16">
        <h2 className="text-lg font-bold text-indigo-600 uppercase tracking-widest mb-4 [-webkit-text-stroke:1px_white]">Architecture Suite</h2>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h3 className="text-4xl font-bold text-slate-900 max-w-2xl">
            Modular intelligence systems designed for deep vertical execution.
          </h3>
          <p className="text-xl text-slate-500 max-w-sm [-webkit-text-stroke:1px_black]">
            Each architecture operates as a standalone pipeline or integrates into a unified infrastructure.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {ARCHITECTURES.map((system) => (
          <div 
            key={system.id} 
            className="group relative p-8 rounded-3xl bg-slate-50 border border-slate-100 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-8">
              <span className="text-4xl font-black text-slate-200 group-hover:text-indigo-100 transition-colors">
                {system.number}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                system.status === SystemStatus.ACTIVE 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {system.status}
              </span>
            </div>

            <h4 className="text-2xl font-bold text-slate-900 mb-4">{system.name}</h4>
            <p className="text-slate-600 mb-8 leading-relaxed">
              {system.description}
            </p>

            <ul className="space-y-3 mb-8">
              {system.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  {h}
                </li>
              ))}
            </ul>

            <Link 
              to={getRoute(system.id)}
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all"
            >
              Learn more
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
