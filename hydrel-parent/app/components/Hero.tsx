
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-900">
      {/* Stripe-style slanted background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full transform skew-y-[-6deg] origin-top-left bg-indigo-600 translate-y-[-10%] opacity-20"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 blur-3xl rounded-full translate-x-1/2 translate-y-[-20%]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-[1.2fr_0.8fr] gap-12 pt-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-white tracking-widest uppercase">System Intelligence v3.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight text-balance">
            Infrastructure for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400">Decision Excellence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
            Hydrel builds high-fidelity data pipelines and execution systems that transform complex market variables into clear institutional outcomes.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a href="#architectures" className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-lg shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform">
              Explore the Systems
            </a>
            <a href="#featured" className="px-8 py-4 bg-transparent border border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
              View Architectures
            </a>
          </div>
        </div>

        <div className="hidden md:block relative h-full min-h-[400px]">
          {/* Abstract system visual */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full aspect-square max-w-[500px]">
            <div className="absolute inset-0 border border-white/10 rounded-3xl rotate-12 animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute inset-4 border border-white/20 rounded-[40px] -rotate-12 animate-[spin_40s_linear_infinite_reverse]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-indigo-500/30 blur-3xl rounded-full"></div>
              <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
