import { Hero } from '@/components/Hero'
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
}