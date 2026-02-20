
import React from 'react';
import { Hero } from './Hero';
import { ArchitecturesGrid } from './ArchitecturesGrid';
import { FeaturedSystem } from './FeaturedSystem';
import { HowItWorks } from './HowItWorks';
import { ContactSection } from './ContactSection';

export const Home: React.FC = () => {
  return (
    <div 
      className="bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: 'url("/images/dashboard-bg.webp")' }}
    >
      {/* Dynamic overlay to enhance background visibility and depth */}
      <div className="absolute inset-0 bg-indigo-950/10 pointer-events-none"></div>
      
      <section id="hero" className="relative z-10">
        <Hero />
      </section>

      <section id="architectures" className="py-24 bg-white/30 backdrop-blur-xl overflow-hidden relative z-10">
        <ArchitecturesGrid />
      </section>

      <section id="featured" className="py-24 bg-slate-900/5 backdrop-blur-xl relative z-10">
        <FeaturedSystem />
      </section>

      <section id="process" className="py-24 bg-white/30 backdrop-blur-xl relative z-10">
        <HowItWorks />
      </section>

      <section id="contact" className="py-24 bg-slate-900/5 backdrop-blur-xl relative z-10">
        <ContactSection />
      </section>
    </div>
  );
};
