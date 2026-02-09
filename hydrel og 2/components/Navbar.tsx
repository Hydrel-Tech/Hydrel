
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  scrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrollToSection = (id: string) => {
    if (!isHome) {
      // If not on home, just let the Link to="/" handle routing, 
      // but we lose the hash scroll unless we handle it specifically.
      // For simplicity in this refactor, we just link to Home.
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
            <div className="w-4 h-4 bg-white rounded-sm rotate-12 group-hover:rotate-0 transition-transform duration-300" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            HYDREL
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {['Architectures', 'Process', 'Featured'].map((item) => (
            isHome ? (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`text-sm font-medium transition-colors hover:opacity-70 ${
                  scrolled ? 'text-slate-600' : 'text-white/90'
                }`}
              >
                {item}
              </button>
            ) : (
              <Link
                key={item}
                to={`/#${item.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:opacity-70 ${
                  scrolled ? 'text-slate-600' : 'text-white/90'
                }`}
              >
                {item}
              </Link>
            )
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/#contact"
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
              scrolled 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
            }`}
          >
            Request Simulation
          </Link>
        </div>
      </div>
    </nav>
  );
};
