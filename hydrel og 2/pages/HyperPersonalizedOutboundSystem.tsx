
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
            System Architecture
          </h2>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">4.2 Distributed Entity Recognition</h3>
               <p className="text-slate-600 leading-relaxed text-sm mb-4">
                 The system initiates by deploying a wide-net discovery protocol across geospatial indices and vertical-specific directories. Instead of relying on static databases, it performs real-time entity recognition to identify prospect organizations that match strict "ready-to-buy" signals. This ensures high-fidelity target lists that are updated to the second, bypassing the decay rates of traditional lead vendors.
               </p>
            </section>

             <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">4.3 The Personalization Engine</h3>
              
              <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">4.3.1 Contextual Signal Harvesting</h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Upon identification, the architecture deploys semantic crawlers to ingest public-facing organizational data. The system parses mission statements, recent news flashes, and leadership biographies to construct a comprehensive psychographic profile of the target entity.
                  </p>
              </div>

              <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">4.3.2 Generative Outreach Synthesis</h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Utilizing advanced large language model inference, the system synthesizes the harvested context into hyper-personalized communication artifacts. It does not simply fill in blanks; it constructs bespoke opening narratives that demonstrate deep research and relevance, mirroring the cognitive output of a human sales development representative but at infinite scale.
                  </p>
              </div>

               <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">4.3.3 Protocol Verification</h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Before final dispatch, all synthesized outputs undergo a structural verification process. This ensures communication protocols adhere to deliverability standards and domain reputation safeguards, maximizing the probability of inbox placement and positive engagement.
                  </p>
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
