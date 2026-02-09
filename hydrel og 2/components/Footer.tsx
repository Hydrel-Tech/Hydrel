
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center transform -rotate-12">
                <div className="w-3 h-3 bg-white rounded-sm rotate-12" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                HYDREL
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              Advancing institutional execution through high-fidelity systems and architectural precision.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-widest">Architectures</h5>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Real Estate</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Outbound Pipeline</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Marketing Intel</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Data Mining</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-widest">Resources</h5>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Methodology</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-widest">Company</h5>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Partners</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} Hydrel Systems Architecture. All systems operational.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 hover:text-slate-600 text-xs transition-colors">Privacy Protocol</a>
            <a href="#" className="text-slate-400 hover:text-slate-600 text-xs transition-colors">Service Standards</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
