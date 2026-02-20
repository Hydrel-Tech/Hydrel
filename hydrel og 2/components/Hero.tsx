
import React from 'react';

export const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-transparent">
      {/* Stripe-style gradient background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[120%] bg-white/10 skew-y-[-6deg] origin-top-left transform -translate-y-20">
             <div className="absolute inset-0 w-full h-full opacity-30" 
                  style={{
                    backgroundImage: `
                      radial-gradient(at 77% 12%, hsla(245, 68%, 78%, 0.4) 0px, transparent 50%),
                      radial-gradient(at 0% 12%, hsla(180, 77%, 78%, 0.4) 0px, transparent 50%),
                      radial-gradient(at 90% 90%, hsla(333, 64%, 81%, 0.4) 0px, transparent 50%),
                      radial-gradient(at 12% 84%, hsla(208, 62%, 84%, 0.4) 0px, transparent 50%)
                    `
                  }}>
             </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 pt-20">
        <div className="max-w-2xl pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 border border-slate-900/10 backdrop-blur-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600 tracking-widest uppercase [-webkit-text-stroke:1px_black]">System Intelligence v3.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight text-balance">
            Infrastructure for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Decision Excellence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl [-webkit-text-stroke:1px_black]">
            Hydrel builds high-fidelity data pipelines and execution systems that transform complex market variables into clear institutional outcomes.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => scrollToSection('architectures')}
              className="px-8 py-4 bg-slate-900 text-white font-bold rounded-full shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Explore the Systems
            </button>
            <button 
              onClick={() => scrollToSection('featured')}
              className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
            >
              View Active Architectures
            </button>
          </div>
        </div>

        <div className="hidden lg:block relative h-full min-h-[500px]">
          {/* Abstract system visual - Phone/Dashboard Mockup */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] perspective-1000">
             {/* Main Card */}
             <div className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 border border-slate-100 p-6 transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-[-8deg] hover:rotate-x-[2deg] transition-all duration-700 ease-out">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                   <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                     <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                   </div>
                   <div className="h-2 w-20 bg-slate-100 rounded-full"></div>
                </div>
                
                {/* Graph Area */}
                <div className="h-40 bg-gradient-to-b from-indigo-50 to-white rounded-xl mb-6 flex items-end justify-between px-4 pb-2 border border-indigo-50">
                   {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="w-8 bg-indigo-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                   ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-xl bg-slate-50">
                      <div className="text-xs text-slate-400 font-bold uppercase mb-1">Nodes Active</div>
                      <div className="text-xl font-bold text-slate-800">1,240</div>
                   </div>
                   <div className="p-4 rounded-xl bg-slate-50">
                      <div className="text-xs text-slate-400 font-bold uppercase mb-1">Latency</div>
                      <div className="text-xl font-bold text-slate-800">12ms</div>
                   </div>
                </div>
             </div>

             {/* Floating Elements */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-400/20 blur-3xl rounded-full"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
