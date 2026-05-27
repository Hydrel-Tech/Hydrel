import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const [showAbout,   setShowAbout]   = useState(false);
  const [showContact, setShowContact] = useState(false);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setShowContact(false);
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 pt-20 pb-10 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="relative w-6 h-6">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-sm">
                  <defs>
                    <linearGradient id="cubeGradientFooter" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4338ca" />
                      <stop offset="1" stopColor="#312e81" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2L2.5 7.5V17.5L12 23L21.5 17.5V7.5L12 2Z" fill="url(#cubeGradientFooter)" stroke="#6366f1" strokeWidth="1" strokeLinejoin="round"/>
                  <path d="M12 2V12.5M21.5 7.5L12 12.5M2.5 7.5L12 12.5" stroke="#6366f1" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="-1" y1="13" x2="25" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white transition-colors duration-300">HYDREL</span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed mb-6 transition-colors duration-300">
              Advancing institutional execution through high-fidelity systems and architectural precision.
            </p>

            {/* About Us Dropdown */}
            <div className="mb-4">
              <button
                onClick={() => setShowAbout(!showAbout)}
                className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
              >
                About Us
                <svg className={`w-4 h-4 transition-transform duration-200 ${showAbout ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed overflow-hidden transition-all duration-300 ${showAbout ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-colors duration-300">
                  Hydrel is a new systems company concurrently working to renovate solar energy mechanics to a consumable scale for the average consumer while increasing efficiency. These architectures serve as a byproduct of what Hydrel offers to give to the planet as a whole in the future, stay tuned!
                </p>
              </div>
            </div>
          </div>

          {/* Architectures Column */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-6 uppercase tracking-widest transition-colors duration-300">Architectures</h5>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/market-alpha" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Real Estate Analytics</Link></li>
              <li><Link to="/hyper-personalized-outbound-system" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Outbound Pipeline</Link></li>
              <li><Link to="/unified-marketing-intelligence" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Marketing Intelligence</Link></li>
              <li><Link to="/niche-commercial-data-mining" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Commercial Data Mining</Link></li>
            </ul>
          </div>

          {/* Ideal For Column */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-6 uppercase tracking-widest transition-colors duration-300">Ideal For</h5>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>Entrepreneurship</li>
              <li>Consulting</li>
              <li>Finance &amp; Investment</li>
              <li>E-commerce &amp; Retail</li>
              <li>Sales &amp; Marketing</li>
              <li>Business Intelligence &amp; Analytics</li>
              <li>Real Estate</li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-6 uppercase tracking-widest transition-colors duration-300">Company</h5>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">

              {/* Contact — expandable dropdown */}
              <li>
                <button
                  onClick={() => setShowContact(!showContact)}
                  className="flex items-center gap-2 font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none w-full text-left"
                >
                  Contact
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showContact ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${showContact ? 'max-h-64 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm space-y-3 transition-colors duration-300">

                    {/* Email */}
                    <a
                      href="mailto:mcegad2020@gmail.com"
                      className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="break-all">mcegad2020@gmail.com</span>
                    </a>

                    {/* Phone */}
                    <a
                      href="tel:+254794986621"
                      className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      +254 794 986 621
                    </a>

                    {/* Divider */}
                    <div className="border-t border-slate-100 dark:border-slate-700" />

                    {/* Send a message → scroll to contact form */}
                    <button
                      onClick={scrollToContact}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send a Message
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-300">
          <p className="text-slate-400 dark:text-slate-500 text-xs transition-colors duration-300">
            © {new Date().getFullYear()} Hydrel Systems Architecture. All systems operational.
          </p>
          <div className="flex gap-8">
            <span className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition-colors cursor-default">Privacy Protocol</span>
            <span className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition-colors cursor-default">Service Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
