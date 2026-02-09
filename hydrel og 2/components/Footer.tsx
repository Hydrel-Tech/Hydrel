
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center transform -rotate-12">
                <div className="w-3 h-3 bg-white rounded-sm rotate-12" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                HYDREL
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">
              Advancing institutional execution through high-fidelity systems and architectural precision.
            </p>
            
            {/* About Us Dropdown */}
            <div>
              <button 
                onClick={() => setShowAbout(!showAbout)}
                className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors focus:outline-none"
              >
                About Us
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showAbout ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`mt-4 text-sm text-slate-500 leading-relaxed overflow-hidden transition-all duration-300 ${showAbout ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  Hydrel is a new systems company that is concurrently working to renovate solar energy mechanics to a consumable scale for the average consumer while increasing efficiency. These architectures serve as a byproduct of what Hydrel offers to give to the planet as a whole in the future, stay tuned!
                </p>
              </div>
            </div>
          </div>

          {/* Architectures Column */}
          <div>
            <h5 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-widest">Architectures</h5>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="/market-alpha" className="hover:text-indigo-600 transition-colors">Real Estate Analytics</Link></li>
              <li><Link to="/HyperPersonalizedOutboundSystem" className="hover:text-indigo-600 transition-colors">Outbound Pipeline</Link></li>
              <li><Link to="/UnifiedMarketingIntelligence" className="hover:text-indigo-600 transition-colors">Marketing Intelligence</Link></li>
              <li><Link to="/NicheCommercialDataMining" className="hover:text-indigo-600 transition-colors">Commercial Data Mining</Link></li>
            </ul>
          </div>

          {/* Ideal For Column */}
          <div>
             <h5 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-widest">Ideal For</h5>
             <ul className="space-y-3 text-sm text-slate-500">
                <li>Entrepreneurship</li>
                <li>Consulting</li>
                <li>Finance & Investment</li>
                <li>E-commerce & Retail</li>
                <li>Sales & Marketing</li>
                <li>Business Intelligence & Analytics</li>
                <li>Real Estate</li>
             </ul>
          </div>

          {/* Company Column */}
          <div>
            <h5 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-widest">Company</h5>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="/#contact" className="hover:text-indigo-600 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} Hydrel Systems Architecture. All systems operational.
          </p>
          <div className="flex gap-8">
            <span className="text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer">Privacy Protocol</span>
            <span className="text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer">Service Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
