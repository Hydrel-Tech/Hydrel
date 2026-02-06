
import React from 'react';

interface NavbarProps {
  scrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform -rotate-12">
            <div className="w-4 h-4 bg-white rounded-sm rotate-12" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            HYDREL
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {['Architectures', 'Process', 'Featured'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`text-sm font-medium transition-colors hover:opacity-70 ${
                scrolled ? 'text-slate-600' : 'text-white/90'
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#contact"
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
              scrolled 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
            }`}
          >
            Request Simulation
          </a>
        </div>
      </div>
    </nav>
  );
};
