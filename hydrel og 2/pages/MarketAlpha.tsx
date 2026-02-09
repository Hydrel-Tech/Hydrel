
import React from 'react';

export const MarketAlpha: React.FC = () => {
  return (
    <div className="bg-[#f6f9fc] min-h-screen pt-24 pb-20">
      {/* Hero Header */}
      <div className="bg-emerald-900 text-white relative overflow-hidden -mt-24 pt-40 pb-24 mb-16">
         <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full transform skew-y-[-3deg] origin-top-left bg-emerald-800 translate-y-[-10%] opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-2/3 h-full bg-gradient-to-tl from-teal-500/20 to-emerald-600/20 blur-3xl rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-xs font-bold uppercase tracking-widest mb-6">
            Architecture 01
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Real Estate Investment Analytics
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl leading-relaxed">
            The "Deal Finder" — A structural framework that scans markets to find and evaluate profitable property deals automatically.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Layman Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">System Overview</h2>
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
            <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
              Instead of paying thousands of dollars for Bloomberg terminals or premium data feeds like CoreLogic or CoStar, this "Deal Finder" service stitches together free, high-quality data sources to democratize institutional-grade analysis.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              In highly competitive real estate markets, speed and data are the only real advantages. This system acts as an automated analyst that doesn't just look for houses, but "underwrites" them instantly.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              By combining listing prices with deep neighborhood data and rental estimates, the architecture calculates potential returns before a human ever looks at the property. It filters out the 99% of "noise" to present only the top 1% of investment opportunities that meet strict profitability criteria.
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
              <h3 className="text-lg font-bold text-slate-800 mb-3">3.2.1 Listing Data Aggregation</h3>
              <p className="text-slate-600 leading-relaxed text-sm mb-4">
                The primary input is active listing data. Realtor.com or smaller, local MLS aggregators are often more accessible for low-volume, targeted scraping.
              </p>
              <ul className="space-y-3 pl-4 border-l-2 border-emerald-500/30">
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Mechanism:</strong> A Python script using Selenium or Playwright navigates to target searches (e.g., "3bd 2ba houses in 78702 under $600k").
                </li>
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Extraction:</strong> It extracts key fields: Price, Address, SqFt, Days on Market, and Image URLs.
                </li>
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Compliance:</strong> The scraper respects robots.txt where possible and uses rate limiting (e.g., one request every 10-20 seconds) to act as a "polite" human browser, avoiding IP bans.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">3.2.2 Demographic and Economic Context</h3>
              <p className="text-slate-600 leading-relaxed text-sm mb-4">
                A listing price is meaningless without context. The US Census Bureau API is a powerful, free resource that provides granular data on household income, population growth, and employment stats at the census tract level.
              </p>
              <ul className="space-y-3 pl-4 border-l-2 border-emerald-500/30">
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Integration:</strong> The Python script takes the property's Zip Code or FIPS code and queries the Census API.
                </li>
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Insight:</strong> It appends data points like "Median Household Income Growth (5yr)" or "Owner-Occupied vs. Renter-Occupied Ratio" to the listing data. This helps investors identify gentrifying neighborhoods.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">3.2.3 Rental and Valuation Data</h3>
              <p className="text-slate-600 leading-relaxed text-sm mb-4">
                To calculate ROI, investors need rental estimates. The RentCast API offers a free tier (50 calls/month).
              </p>
              <ul className="space-y-3 pl-4 border-l-2 border-emerald-500/30">
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Strategic Usage:</strong> To stay within the free limit, the system does not query RentCast for every property. Instead, the script first filters the 100 scraped listings down to the "Top 10" based on price-per-sqft and demographic trends. Only these Top 10 are sent to the RentCast API for precise rental valuation. This "funnel" approach maximizes the value.
                </li>
              </ul>
            </section>

             <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">3.3 The "Reasoning Engine": Gemini's Role</h3>
              <p className="text-slate-600 leading-relaxed text-sm mb-4">
                Once the raw data is aggregated (Listing + Demographics + Rent), it is fed into Google Gemini.
              </p>
              <ul className="space-y-3 pl-4 border-l-2 border-emerald-500/30">
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Prompt Engineering:</strong> "Act as a senior real estate investment analyst. Review the following property data:. Calculate the estimated Gross Yield and Cash-on-Cash return assuming 20% down. Compare this to the 'Rule of 1%'. Identify two pros and two risks for this specific investment based on the demographic trends."
                </li>
                <li className="text-sm text-slate-600">
                  <strong className="text-slate-800">Output:</strong> Gemini generates a narrative paragraph for each property, explaining why it is a good or bad deal. This mimics the output of a human analyst.
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button className="px-10 py-5 bg-emerald-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 hover:scale-[1.02] transition-all transform duration-200">
            Get System
          </button>
          <p className="mt-4 text-xs text-slate-400 font-medium">Deployed within 48 hours to secure infrastructure.</p>
        </div>
      </div>
    </div>
  );
};
