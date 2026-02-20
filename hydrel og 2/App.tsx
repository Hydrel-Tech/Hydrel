
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';

// Pages
import { MarketAlpha } from './pages/MarketAlpha';
import { MarketAlphaPricing } from './pages/MarketAlphaPricing';
import { MarketAlphaDashboard } from './pages/MarketAlphaDashboard';
import { HyperPersonalizedOutboundSystem } from './pages/HyperPersonalizedOutboundSystem';
import { UnifiedMarketingIntelligence } from './pages/UnifiedMarketingIntelligence';
import { NicheCommercialDataMining } from './pages/NicheCommercialDataMining';
import { Signup } from './pages/Signup';
import IntroPage from './pages/IntroPage';
import { useNavigate, useLocation } from 'react-router-dom';

const FirstVisitRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    // Only redirect to intro if we are on the root or home page and haven't seen intro yet
    if (!hasSeenIntro && (location.pathname === '/' || location.pathname === '/market-alpha')) {
      localStorage.setItem('hasSeenIntro', 'true');
      navigate('/intro');
    }
  }, [navigate, location]);
  
  return null;
};

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <FirstVisitRedirect />
        <div className="min-h-screen flex flex-col">
          {/* Navbar is conditional inside Signup page if we wanted, but keeping it simple for now. 
              The Signup page design in requirements seemed standalone (nested subpage), 
              so we might conditionally render Navbar or let the Signup page cover it.
              Based on the design, Signup page has its own back button, but Navbar is global.
              We can hide Navbar on signup route if desired, but user didn't explicitly ask to hide it.
          */}
          <Routes>
             <Route path="/intro" element={<></>} />
             <Route path="/signup" element={<></>} />
             <Route path="/market-alpha/dashboard" element={<></>} /> {/* Hide default navbar on dashboard */}
             <Route path="*" element={<Navbar scrolled={scrolled} />} />
          </Routes>
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/intro" element={<IntroPage />} />
              <Route path="/market-alpha" element={<MarketAlpha />} />
              <Route path="/market-alpha/pricing" element={<MarketAlphaPricing />} />
              <Route path="/market-alpha/dashboard" element={<MarketAlphaDashboard />} />
              <Route path="/HyperPersonalizedOutboundSystem" element={<HyperPersonalizedOutboundSystem />} />
              <Route path="/UnifiedMarketingIntelligence" element={<UnifiedMarketingIntelligence />} />
              <Route path="/NicheCommercialDataMining" element={<NicheCommercialDataMining />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>

          <Routes>
            <Route path="/intro" element={<></>} />
            <Route path="/signup" element={<></>} />
            <Route path="/market-alpha/dashboard" element={<></>} /> {/* Hide default footer on dashboard */}
            <Route path="*" element={<Footer />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
