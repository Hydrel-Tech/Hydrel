
import { BorderGlow } from '../src/components/react-bits/BorderGlow';
import { Strands } from '../src/components/react-bits/Strands';
import React, { useState } from 'react';

export const ContactSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 transition-colors duration-300">
      <BorderGlow>
        <div className="flex flex-col md:flex-row items-center justify-between gap-16 p-8 md:p-20 rounded-[3rem] bg-white/90 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-colors duration-300 backdrop-blur-sm relative overflow-hidden">
          {/* Strands Effect Background */}
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
          <Strands 
            colors={['#5227ff', '#ff9ffc', '#5227ff']} 
            count={3} 
            opacity={0.3} 
          />
        </div>

        <div className="max-w-xl text-center md:text-left relative z-10">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight transition-colors duration-300">
            Ready to simulate your <br className="hidden lg:block" /> next architecture?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 transition-colors duration-300">
            Contact our engineering team to explore how our service architectures can integrate into your institutional workflow.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-12">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-2xl transition-colors duration-300">4+</p>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors duration-300">Architectures</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-2xl transition-colors duration-300">0.0%</p>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors duration-300">Hype Index</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
          {submitted ? (
            <div className="p-8 rounded-2xl bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 text-center animate-fade-in transition-colors duration-300">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-green-800 dark:text-green-400 font-bold mb-2 transition-colors duration-300">Access Requested</h4>
              <p className="text-green-700 dark:text-green-500 text-sm transition-colors duration-300">Our systems team will review your profile shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors duration-300">Work Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.com"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 hover:scale-[1.02] transition-all"
              >
                Request Simulation
              </button>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 px-4 leading-tight transition-colors duration-300">
                Only use this form if you require a guided demonstration or video proof of the active architecture. For all other inquiries or to deploy immediately, please use the "Learn More" buttons on the specific architecture pages.
              </p>
            </form>
          )}
        </div>
      </BorderGlow>
    </div>
  );
};
