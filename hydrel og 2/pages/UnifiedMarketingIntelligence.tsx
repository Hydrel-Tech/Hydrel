
import React from 'react';

export const UnifiedMarketingIntelligence: React.FC = () => {
  return (
    <div className="bg-[#f6f9fc] min-h-screen pt-24 pb-20">
      <div className="bg-emerald-900 text-white relative overflow-hidden -mt-24 pt-40 pb-24 mb-16">
         <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full transform skew-y-[-3deg] origin-top-left bg-emerald-800 translate-y-[-10%] opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-2/3 h-full bg-gradient-to-tl from-teal-500/20 to-emerald-600/20 blur-3xl rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-xs font-bold uppercase tracking-widest mb-6">
            Architecture 03
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Unified Marketing Intelligence
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl leading-relaxed">
            The "Unified Business View" — Eliminates the chaos of tracking data across multiple tabs. Automates and unifies all your research and metrics.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Layman Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">System Overview</h2>
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Marketing data is usually messy, scattered across Facebook Ads, Google Analytics, and spreadsheets. This leads to "analysis paralysis" or simply missing critical trends because you didn't check the right tab.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              This system acts as a central brain that pulls everything together. It doesn't just display numbers; it uses intelligence to analyze yesterday's performance and give you a clear, written briefing on what happened, why it happened, and what you should do about it today.
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
              <h3 className="text-lg font-bold text-slate-800 mb-3">5.2 Cross-Platform Data Normalization</h3>
               <p className="text-slate-600 leading-relaxed text-sm mb-4">
                 The architecture functions as a universal data bridge, establishing secure, authenticated pipelines into disparate advertising and analytics environments. It autonomously retrieves disparate metric sets and subjects them to a rigorous normalization protocol. This standardization process ensures that "apples-to-apples" comparisons can be made across channels, eliminating the friction of manual data aggregation.
               </p>
            </section>

             <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">5.3 The "Connector" Protocol</h3>
              
              <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">5.3.1 Ingestion & Transformation</h4>
                  <p className="text-slate-600 text-sm mb-2">
                    The system executes scheduled data pulls to harvest performance telemetry. It creates a unified schema that maps varying definitions of "conversion" and "spend" into a singular, coherent truth source. This backend complexity is entirely abstracted from the user, providing a seamless data lake experience without the infrastructure overhead.
                  </p>
              </div>

              <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">5.3.2 Narrative Intelligence Generation</h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Beyond visualization, the architecture employs an advanced analytical layer to detect anomalies and trend deviations. It transforms raw numeric variation into semantic briefings—generating written, strategic insights that explain performance shifts. This elevates the system from a passive dashboard to an active intelligence officer that pushes recommendations to stakeholders.
                  </p>
              </div>

               <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">5.3.3 Push-Protocol Delivery</h4>
                  <p className="text-slate-600 text-sm mb-2">
                    To ensure strategic alignment, the system utilizes a push-protocol to deliver synthesized intelligence directly to decision-makers. This automated dissemination ensures that critical performance data and optimization strategies are reviewed without requiring active login, maintaining high situational awareness across the growth team.
                  </p>
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
