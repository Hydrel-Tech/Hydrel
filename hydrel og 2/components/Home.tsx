
import React from 'react';
import { Hero } from './Hero';
import { ArchitecturesGrid } from './ArchitecturesGrid';
import { FeaturedSystem } from './FeaturedSystem';
import { HowItWorks } from './HowItWorks';
import { ContactSection } from './ContactSection';

export const Home: React.FC = () => {
  return (
    <>
      <section id="hero">
        <Hero />
      </section>

      <section id="architectures" className="py-24 bg-white overflow-hidden">
        <ArchitecturesGrid />
      </section>

      <section id="featured" className="py-24 bg-[#f6f9fc]">
        <FeaturedSystem />
      </section>

      <section id="process" className="py-24 bg-white">
        <HowItWorks />
      </section>

      <section id="contact" className="py-24 bg-[#f6f9fc]">
        <ContactSection />
      </section>
    </>
  );
};
