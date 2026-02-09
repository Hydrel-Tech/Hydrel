
import React from 'react';

export const NicheCommercialDataMining: React.FC = () => {
  return (
    <div className="bg-[#f6f9fc] min-h-screen pt-24 pb-20">
      <div className="bg-emerald-900 text-white relative overflow-hidden -mt-24 pt-40 pb-24 mb-16">
         <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full transform skew-y-[-3deg] origin-top-left bg-emerald-800 translate-y-[-10%] opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-2/3 h-full bg-gradient-to-tl from-teal-500/20 to-emerald-600/20 blur-3xl rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-xs font-bold uppercase tracking-widest mb-6">
            Architecture 04
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Niche Commercial Data Mining
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl leading-relaxed">
            The "Targeted Data Delivery" — A protocol that extracts specific, hard-to-find datasets to give you an edge in commercial markets.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Layman Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">System Overview</h2>
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Many business opportunities are hidden in places that traditional lists can't reach—like daily job postings, forum requests, or specialized industry directories.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              This system works like a sophisticated digital radar. It constantly monitors specific corners of the internet for high-value signals (like a company asking for a specific service) or extracts verified contact details from private trade association rosters, delivering exclusive leads that your competitors don't have.
            </p>
          </div>
        </div>

        {/* Technical Deep Dive */}
        <div className="mb-16">
           <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </span>
            Technical Specifications
          </h2>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">6.2 The Zero-Cost Tech Stack</h3>
               <ul className="space-y-3 pl-4 border-l-2 border-emerald-500/30">
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Scraping:</strong> Playwright or Selenium for dynamic sites (Craigslist, Yelp, Industry Directories).
                </li>
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Anti-Blocking:</strong> Managing headers, User-Agents, and request timing (randomized delays) to avoid detection without paying for premium proxies.
                </li>
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Filtering:</strong> Using Python text analysis or Gemini to filter out bad leads (e.g., removing businesses with "no soliciting" on their site).
                </li>
              </ul>
            </section>

             <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">6.3 Technical Implementation: The Directory Monitor</h3>
              
              <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">6.3.1 The "Craigslist/Directory" Scraper</h4>
                  <p className="text-slate-600 text-sm mb-2">Many service businesses (e.g., Commercial Cleaners) still find leads on Craigslist "Gigs" or specialized forums.</p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      <li><strong>Workflow:</strong> A Python script monitors the "Services Needed" or "Gigs" section of Craigslist in 50 major cities.</li>
                      <li><strong>Alerting:</strong> When a relevant post appears (e.g., "Need commercial cleaning for 5000 sq ft office"), the script captures the contact info.</li>
                       <li><strong>AI Drafting:</strong> It uses Gemini to read the post and draft a specific reply: "Hi, I see you need cleaning for a 5k sq ft office. We specialize in mid-sized commercial spaces...".</li>
                  </ul>
              </div>

              <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">6.3.2 The "Association" Miner</h4>
                  <p className="text-slate-600 text-sm mb-2">Many industries have trade associations with public member directories (e.g., "American Dental Association" local chapters). These are high-quality, verified businesses.</p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      <li><strong>Workflow:</strong> A custom script iterates through the directory pages, extracting member details.</li>
                      <li><strong>Enrichment:</strong> It then visits each member's website to find the specific email of the "Practice Manager" (often listed on the "Team" page), bypassing the generic " info@ " email.</li>
                  </ul>
              </div>

            </section>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-16 text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
           <span className="inline-block px-4 py-1 rounded-full bg-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">
            Coming Soon
          </span>
          <p className="text-slate-500 text-sm">This system architecture is currently in the development pipeline.</p>
        </div>
      </div>
    </div>
  );
};
