
import React from 'react';
import { Hero } from './Hero';
import { ArchitecturesGrid } from './ArchitecturesGrid';
import { FeaturedSystem } from './FeaturedSystem';
import { HowItWorks } from './HowItWorks';
import { ContactSection } from './ContactSection';

export const Home: React.FC = () => {
  return (
    <div 
      className="bg-cover bg-center bg-fixed relative transition-colors duration-300"
      style={{ backgroundImage: 'url("/images/dashboard-bg.webp")' }}
    >
      {/* Dynamic overlay to enhance background visibility and depth */}
      <div className="absolute inset-0 bg-indigo-950/10 dark:bg-slate-950/80 pointer-events-none transition-colors duration-300"></div>
      
      <section id="hero" className="relative z-10">
        <Hero />
      </section>

      <section id="architectures" className="py-24 bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden relative z-10 transition-colors duration-300">
        <ArchitecturesGrid />
      </section>

      <section id="featured" className="py-24 bg-slate-900/5 dark:bg-slate-900/60 backdrop-blur-xl relative z-10 transition-colors duration-300">
        <FeaturedSystem />
      </section>

      <section id="process" className="py-24 bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl relative z-10 transition-colors duration-300">
        <HowItWorks />
      </section>

      <section id="contact" className="py-24 bg-slate-900/5 dark:bg-slate-900/60 backdrop-blur-xl relative z-10 transition-colors duration-300">
        <ContactSection />
      </section>
    </div>
  );
};
