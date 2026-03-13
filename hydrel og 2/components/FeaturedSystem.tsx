
import React from 'react';
import { Link } from 'react-router-dom';

export const FeaturedSystem: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="relative p-8 md:p-16 rounded-[2.5rem] bg-indigo-900 text-white overflow-hidden shadow-2xl">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-xs font-bold uppercase tracking-widest mb-8">
              Current Focus
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Real Estate Investment Analytics
            </h2>
            <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
              A structural framework that scans markets to find and evaluate profitable property deals automatically. Our evaluation engine reduces deal identification latency from weeks to seconds by synchronizing disparate data sources into a unified profitable property finder.
            </p>
            
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <h4 className="font-bold text-indigo-300 text-sm uppercase mb-2">Core Component</h4>
                <p className="text-indigo-50 text-sm">Dynamic Risk Mapping</p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-300 text-sm uppercase mb-2">Throughput</h4>
                <p className="text-indigo-50 text-sm">50k+ Nodes Daily</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 flex-shrink-0 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm text-indigo-200">
                This architecture is active for selected partners. Other systems are currently in development phase.
              </p>
            </div>

            {/* Mobile: position it under the current focus section (the detailed log area), separate and not overlaying anything */}
            <div className="lg:hidden mt-10 flex justify-center">
              <Link 
                to="/market-alpha" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl shadow-xl transition-all group"
              >
                Take Me to the System
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="glass-card rounded-3xl p-8 border-indigo-400/20 shadow-2xl">
              <div className="flex items-center justify-between mb-12">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/50"></div>
                </div>
                <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest">System Monitor</div>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Proprietary Valuation Index', value: 98.4, color: 'bg-cyan-400' },
                  { label: 'Risk Calibration Level', value: 72.1, color: 'bg-indigo-400' },
                  { label: 'Market Sentiment Drift', value: 45.8, color: 'bg-purple-400' }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tighter">
                      <span>{stat.label}</span>
                      <span>{stat.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-4 rounded-xl bg-indigo-800/50 border border-white/5 font-mono text-[10px] text-indigo-300">
                <div className="flex justify-between mb-1">
                  <span>SYSTEM_LOAD:</span>
                  <span>OPTIMAL</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>API_SYNC:</span>
                  <span>ESTABLISHED</span>
                </div>
                <div className="flex justify-between">
                  <span>LATENCY:</span>
                  <span>14ms</span>
                </div>
              </div>
            </div>

            {/* Desktop: center it below the "proprietary valuation index / risk calculation level / market sentiment drift" graph (the little graph area) */}
            <div className="hidden lg:flex justify-center mt-8">
              <Link 
                to="/market-alpha" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl shadow-xl transition-all hover:-translate-y-1 group"
              >
                Take Me to the System
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Decorative floaters */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-400/20 blur-2xl rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
