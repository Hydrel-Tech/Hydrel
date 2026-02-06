// app/page.tsx
// This is the equivalent of the root rendered by /index.tsx in the original setup.
// Move the complete content/logic from your original /index.tsx here as functional components.
// The original <div id="root"></div> is replaced by Next.js SSR/CSR rendering.

import React from "react";

export default function Page() {
  return (
    <>
      {import { Hero } from '@/components/Hero'
import { ArchitecturesGrid } from '@/components/ArchitecturesGrid'
import { FeaturedSystem } from '@/components/FeaturedSystem'
import { HowItWorks } from '@/components/HowItWorks'
import { ContactSection } from '@/components/ContactSection'

export default function Home() {
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
  )
}}
    </>
  );
}
