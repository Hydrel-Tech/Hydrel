
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from '../components/LoginModal';
import BorderGlow from '../src/components/react-bits/BorderGlow';

export const MarketAlpha: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleGetSystem = () => {
    if (user) {
      navigate('/market-alpha/pricing');
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="bg-[#f6f9fc] dark:bg-slate-900 min-h-screen pt-24 pb-20 transition-colors duration-300">
      {/* Home Navigation */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-emerald-900 dark:bg-emerald-950 text-white relative overflow-hidden -mt-8 pt-40 pb-24 mb-16 transition-colors duration-300">
         <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full transform skew-y-[-3deg] origin-top-left bg-emerald-800 dark:bg-emerald-900 translate-y-[-10%] opacity-30 transition-colors duration-300"></div>
          <div className="absolute bottom-0 right-0 w-2/3 h-full bg-gradient-to-tl from-teal-500/20 to-emerald-600/20 blur-3xl rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-xs font-bold uppercase tracking-widest mb-6">
            Architecture 01
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Real Estate Investment Analytics
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl leading-relaxed">
            The "Deal Finder" — A structural framework that scans markets to find and evaluate profitable property deals automatically.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Layman Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">System Overview</h2>
          
          <div className="inline-block px-5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 mb-6 shadow-sm transition-colors duration-300">
             <p className="text-sm font-bold text-red-600 dark:text-red-400 tracking-wide transition-colors duration-300">
               Secure <span className="font-black">AT LEAST ONE</span> extra deal monthly!
             </p>
          </div>

          <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50 transition-colors duration-300">
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium transition-colors duration-300">
              Instead of paying thousands of dollars for Bloomberg terminals or premium data feeds, this "Deal Finder" service stitches together free, high-quality data sources to democratize institutional-grade analysis.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 transition-colors duration-300">
              In highly competitive real estate markets, speed and data are the only real advantages. This system acts as an automated analyst that doesn't just look for houses, but "underwrites" them instantly.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
              By combining listing prices with deep neighborhood data and rental estimates, the architecture calculates potential returns before a human ever looks at the property. It filters out the 99% of "noise" to present only the top 1% of investment opportunities that meet strict profitability criteria.
            </p>
          </div>
        </div>

        {/* Technical Deep Dive */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 transition-colors duration-300">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-bold transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </span>
            Technical Analysis
          </h2>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 transition-colors duration-300">3.2.1 Autonomous Market Ingestion</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-4 transition-colors duration-300">
                The architecture employs a decentralized intake protocol that continuously monitors market availability across fractured endpoints. Rather than relying on static feeds, the system actively queries localized indices to ensure real-time fidelity of asset availability, pricing latency, and visual condition markers.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 transition-colors duration-300">3.2.2 Contextual Demographic Layering</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-4 transition-colors duration-300">
                Raw asset data is insufficient for institutional decision-making. The system automatically overlays high-dimensional socioeconomic vectors onto every target asset. This includes longitudinal trends in household economics, population density shifts, and stability metrics, allowing for an immediate assessment of neighborhood gentrification trajectories and long-term holding viability.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 transition-colors duration-300">3.2.3 Predictive Yield Modeling</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-4 transition-colors duration-300">
                To move beyond simple price-per-square-foot analysis, the infrastructure utilizes a multi-stage funnel for valuation. By cross-referencing localized rental performance data with acquisition costs, the system synthesizes a projected profitability index. This ensures that only assets with a mathematically probable spread between cap rate and cost of capital are surfaced for review.
              </p>
            </section>

             <section>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 transition-colors duration-300">3.3 The Reasoning Engine</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-4 transition-colors duration-300">
                The final layer of the architecture is a probabilistic reasoning engine that acts as a synthetic underwriter. It ingests the aggregated technical and demographic data to produce a qualitative narrative risk assessment. This output mimics senior analyst scrutiny, identifying non-numerical risks and advantages to provide a "go/no-go" recommendation with explainable logic.
              </p>
            </section>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button 
            onClick={handleGetSystem}
            className="inline-block px-10 py-5 bg-emerald-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 hover:scale-[1.02] transition-all transform duration-200"
          >
            Get System
          </button>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors duration-300">Deployed within 48 hours to secure infrastructure.</p>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};
