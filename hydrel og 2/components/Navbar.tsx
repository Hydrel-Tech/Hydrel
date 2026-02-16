
import React, { useState, useRef, useEffect } from 'react';
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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setShowDropdown(!showDropdown);
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setShowDropdown(false);
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
             <div className="relative" ref={dropdownRef}>
               <button
                onClick={handleAuthClick}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 border flex items-center gap-2 ${
                  scrolled 
                    ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50' 
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
              >
                {user ? (
                  <>
                    {username}
                    <svg className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                ) : 'Log In / Sign Up'}
              </button>
              
              {user && showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-fade-in-up origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                  </div>
                   <button 
                     onClick={handleLogout}
                     className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                     </svg>
                     Log Out
                   </button>
                </div>
              )}
            </div>

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
