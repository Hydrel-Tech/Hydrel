
import React from 'react';
import { Hero } from './Hero';
import { ArchitecturesGrid } from './ArchitecturesGrid';
import { FeaturedSystem } from './FeaturedSystem';
import { HowItWorks } from './HowItWorks';
import { ContactSection } from './ContactSection';

export const Home: React.FC = () => {
  return (
    <div 
      className="bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url("/images/hero-bg.webp")' }}
    >
      <section id="hero">
        <Hero />
      </section>

      <section id="architectures" className="py-24 bg-white/90 backdrop-blur-sm overflow-hidden">
        <ArchitecturesGrid />
      </section>

      <section id="featured" className="py-24 bg-[#f6f9fc]/90 backdrop-blur-sm">
        <FeaturedSystem />
      </section>

      <section id="process" className="py-24 bg-white/90 backdrop-blur-sm">
        <HowItWorks />
      </section>

      <section id="contact" className="py-24 bg-[#f6f9fc]/90 backdrop-blur-sm">
        <ContactSection />
      </section>
    </div>
  );
};
