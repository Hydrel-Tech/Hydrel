
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import ScrollToTop from './components/ScrollToTop';

// Pages
import { MarketAlpha } from './pages/MarketAlpha';
import { MarketAlphaPricing } from './pages/MarketAlphaPricing';
import { HyperPersonalizedOutboundSystem } from './pages/HyperPersonalizedOutboundSystem';
import { UnifiedMarketingIntelligence } from './pages/UnifiedMarketingIntelligence';
import { NicheCommercialDataMining } from './pages/NicheCommercialDataMining';

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
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar scrolled={scrolled} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/market-alpha" element={<MarketAlpha />} />
            <Route path="/market-alpha/pricing" element={<MarketAlphaPricing />} />
            <Route path="/HyperPersonalizedOutboundSystem" element={<HyperPersonalizedOutboundSystem />} />
            <Route path="/UnifiedMarketingIntelligence" element={<UnifiedMarketingIntelligence />} />
            <Route path="/NicheCommercialDataMining" element={<NicheCommercialDataMining />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
