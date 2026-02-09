
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
            Technical Specifications
          </h2>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">5.2 The Zero-Cost Tech Stack</h3>
               <ul className="space-y-3 pl-4 border-l-2 border-emerald-500/30">
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Data Sources:</strong> Facebook Marketing API (Free access), Google Ads API (Free access), Google Analytics 4 API. All of these have free tiers for data retrieval.
                </li>
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Backend:</strong> Python script using official client libraries (google-ads, facebook_business) to fetch daily performance data.
                </li>
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Storage:</strong> Google Sheets (acting as a lightweight, free database) or local JSON files stored in the repo.
                </li>
                 <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Frontend:</strong> Streamlit dashboard hosted on Vercel or Streamlit Community Cloud.
                </li>
              </ul>
            </section>

             <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">5.3 Technical Implementation: The "Connector" Script</h3>
              
              <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">5.3.1 API Authentication & Retrieval</h4>
                  <p className="text-slate-600 text-sm mb-2">The core of this service is a Python script that handles the OAuth2 authentication flows to connect to the client's ad accounts. This is a one-time setup complexity that the service provider manages, creating "vendor lock-in" via convenience.</p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      <li><strong>Logic:</strong> The script fetches "Yesterday's Spend," "Clicks," "Impressions," and "Conversions" from all platforms.</li>
                      <li><strong>Transformation:</strong> It normalizes the data (e.g., matching Facebook's "Ad Spend" column with Google's "Cost" column) to create a unified dataset.</li>
                  </ul>
              </div>

              <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">5.3.2 The "AI Analyst" Feature</h4>
                  <p className="text-slate-600 text-sm mb-2">Unlike generic dashboards (like Looker Studio), a Python-based dashboard allows for complex logic and AI integration.</p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      <li><strong>Gemini Integration:</strong> The script feeds the daily performance summary to Gemini.</li>
                      <li><strong>Prompt:</strong> "Analyze yesterday's ad performance across Facebook and Google. Total Spend: $500. Facebook ROAS: 2.1. Google ROAS: 4.5. CPA on Facebook increased by 20%. Suggest three optimization actions for the media buyer."</li>
                      <li><strong>Value:</strong> The dashboard displays these AI-generated insights in a "Morning Briefing" widget. This elevates the tool from a passive report to an active consultant.</li>
                  </ul>
              </div>

               <div className="mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">5.3.3 Automated Reporting</h4>
                  <p className="text-slate-600 text-sm mb-2">The system can also use the Gmail API to email a PDF summary (generated via Python's FPDF library) of the dashboard to the client every Monday morning automatically. This "push" notification ensures the client sees value even if they don't log in.</p>
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
