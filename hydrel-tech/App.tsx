
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import SplashCursor from './src/components/react-bits/SplashCursor';

// Pages
import { MarketAlpha } from './pages/MarketAlpha';
import { MarketAlphaPricing } from './pages/MarketAlphaPricing';
import { MarketAlphaDashboard } from './pages/MarketAlphaDashboard';
import { HyperPersonalizedOutboundSystem } from './pages/HyperPersonalizedOutboundSystem';
import { UnifiedMarketingIntelligence } from './pages/UnifiedMarketingIntelligence';
import { NicheCommercialDataMining } from './pages/NicheCommercialDataMining';
import { Signup } from './pages/Signup';
import IntroPage from './pages/IntroPage';

const FirstVisitRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    // Only redirect to intro if we haven't seen it yet and we are on the root path
    if (!hasSeenIntro && location.pathname === '/') {
      localStorage.setItem('hasSeenIntro', 'true');
      navigate('/intro');
    }
  }, [navigate, location]);
  
  return null;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine if Navbar and Footer should be hidden
  const hideLayout = ['/intro', '/signup', '/market-alpha/dashboard'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <SplashCursor 
        DENSITY_DISSIPATION={3.5} 
        VELOCITY_DISSIPATION={2} 
        PRESSURE={0.1} 
        CURL={3} 
        SPLAT_RADIUS={0.2} 
        SPLAT_FORCE={6000} 
        COLOR_UPDATE_SPEED={10} 
        SHADING={true}
        RAINBOW_MODE={false} 
        COLOR="#A855F7" 
      />
      {!hideLayout && <Navbar scrolled={scrolled} />}
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/market-alpha" element={<MarketAlpha />} />
          <Route path="/market-alpha/pricing" element={<MarketAlphaPricing />} />
          <Route path="/market-alpha/dashboard" element={<MarketAlphaDashboard />} />
          <Route path="/hyper-personalized-outbound-system" element={<HyperPersonalizedOutboundSystem />} />
          <Route path="/unified-marketing-intelligence" element={<UnifiedMarketingIntelligence />} />
          <Route path="/niche-commercial-data-mining" element={<NicheCommercialDataMining />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <FirstVisitRedirect />
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
