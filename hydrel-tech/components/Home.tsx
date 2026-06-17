
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from './Hero';
import { ArchitecturesGrid } from './ArchitecturesGrid';
import { FeaturedSystem } from './FeaturedSystem';
import { HowItWorks } from './HowItWorks';
import { ContactSection } from './ContactSection';
import Lightfall from '../src/components/react-bits/Lightfall';

export const Home: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        // Delay slightly to ensure content is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <div className="relative transition-colors duration-300">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Lightfall
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#000000"
          speed={0.5}
          streakCount={3}
          opacity={0.8}
        />
      </div>
      {/* Dynamic overlay to enhance background visibility and depth */}
      <div className="absolute inset-0 bg-indigo-950/10 dark:bg-slate-950/80 pointer-events-none transition-colors duration-300 z-0"></div>
      
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
