
import React from 'react';

export const HyperPersonalizedOutboundSystem: React.FC = () => {
  return (
    <div className="bg-[#f6f9fc] min-h-screen pt-24 pb-20">
      <div className="bg-emerald-900 text-white relative overflow-hidden -mt-24 pt-40 pb-24 mb-16">
         <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full transform skew-y-[-3deg] origin-top-left bg-emerald-800 translate-y-[-10%] opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-2/3 h-full bg-gradient-to-tl from-teal-500/20 to-emerald-600/20 blur-3xl rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-xs font-bold uppercase tracking-widest mb-6">
            Architecture 02
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Hyper-personalized Outbound System
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl leading-relaxed">
            The "Automated Sales Machine" — Finds ideal customers and sends unique, tailored messages to start sales conversations.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Layman Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">System Overview</h2>
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Generic "spam" emails don't work anymore. To get a response, you need to show you know who you are talking to. This architecture automates the research phase of sales.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              It acts like a tireless research assistant that browses the web for potential clients, reads their websites to understand their business, and drafts a highly specific opening message that proves you've done your homework—allowing you to reach thousands of people with the personal touch of a one-on-one email.
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
              <h3 className="text-lg font-bold text-slate-800 mb-3">4.2 The Zero-Cost Tech Stack</h3>
               <ul className="space-y-3 pl-4 border-l-2 border-emerald-500/30">
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Lead Identification:</strong> Google Maps Scraper (Python/Selenium) to find businesses in specific niches (e.g., "Plumbers in Austin" or "Marketing Agencies in New York").
                </li>
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Data Enrichment:</strong> Custom scripts that visit the business website to extract owner names, "About Us" text, and recent news.
                </li>
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Content Generation:</strong> Google Gemini API to read the website text and generate a personalized icebreaker.
                </li>
                 <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Orchestration:</strong> Google Sheets acts as the database, utilizing its API to read/write data, often triggered by local Python scripts.
                </li>
              </ul>
            </section>

             <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">4.3 Technical Implementation: The Personalization Engine</h3>
              
              <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">4.3.1 Step 1: The "Harvester" (Maps Scraper)</h4>
                  <p className="text-slate-600 text-sm mb-2">A Python script uses Selenium to browse Google Maps results. Google Maps is an underestimated source of B2B leads, containing up-to-date websites and phone numbers for millions of small businesses.</p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      <li><strong>Logic:</strong> The script searches for a keyword (e.g., "Dental Clinic"), scrolls through the results sidebar, and extracts the "Website" and "Name" fields.</li>
                      <li><strong>Zero Cost Advantage:</strong> This replaces tools like Apollo or ZoomInfo for local business leads, saving the client hundreds of dollars a month.</li>
                  </ul>
              </div>

              <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">4.3.2 Step 2: The "Researcher" (Website Scraper)</h4>
                  <p className="text-slate-600 text-sm mb-2">The system iterates through the list of collected websites.</p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      <li><strong>Action:</strong> It visits each URL and scrapes the text from the Homepage and the "About Us" page.</li>
                      <li><strong>Filtering:</strong> It checks for keywords that indicate a good fit (e.g., "expanding," "hiring," "new location") or a bad fit (e.g., "no soliciting," "closed").</li>
                  </ul>
              </div>

               <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">4.3.3 Step 3: The "Copywriter" (Gemini)</h4>
                  <p className="text-slate-600 text-sm mb-2">The scraped website text is fed into Gemini with a strict prompt to generate a "First Line."</p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      <li><strong>Prompt Strategy:</strong> "You are a sales researcher. Read the following text from a Dental Clinic's website:. Identify a unique selling point, a specific doctor's name, or a recent award they won. Write a single sentence complimenting them on this specific detail. The sentence must be casual, under 20 words, and sound like it was written by a human. Do not use buzzwords."</li>
                      <li><strong>Result:</strong> "Saw Dr. Smith won the local 'Best Smiles' award last month—congrats on the recognition.".</li>
                  </ul>
              </div>

               <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">4.3.4 Step 4: Verification and Delivery</h4>
                  <p className="text-slate-600 text-sm mb-2">Before delivery, the script verifies the email format (if scraped) or simply prepares the file for the client to find emails. The final deliverable is a Google Sheet or CSV containing 500-1,000 leads, each with a bespoke, AI-written opening line.</p>
              </div>

            </section>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-16 text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
           <span className="inline-block px-4 py-1 rounded-full bg-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">
            In Development
          </span>
          <p className="text-slate-500 text-sm">This system architecture is currently undergoing final validation tests.</p>
        </div>
      </div>
    </div>
  );
};
