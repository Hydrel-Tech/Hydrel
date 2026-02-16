
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';

interface NavbarProps {
  scrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user, signOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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

  const handleAuthClick = () => {
    if (user) {
      // Optional: Add a dropdown or simple sign out for now
      const confirmLogout = window.confirm("Do you want to log out?");
      if(confirmLogout) signOut();
    } else {
      setIsLoginOpen(true);
    }
  };

  // Safe access to username
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transform group-hover:scale-110 transition-transform duration-300">
               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-sm">
                  <defs>
                    <linearGradient id="cubeGradientNav" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4338ca" />
                      <stop offset="1" stopColor="#312e81" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2L2.5 7.5V17.5L12 23L21.5 17.5V7.5L12 2Z" fill="url(#cubeGradientNav)" stroke="#6366f1" strokeWidth="1" strokeLinejoin="round"/>
                  <path d="M12 2V12.5M21.5 7.5L12 12.5M2.5 7.5L12 12.5" stroke="#6366f1" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="-1" y1="13" x2="25" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
               </svg>
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
             <button
              onClick={handleAuthClick}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 border ${
                scrolled 
                  ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50' 
                  : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              {user ? username : 'Log In / Sign Up'}
            </button>

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

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};
