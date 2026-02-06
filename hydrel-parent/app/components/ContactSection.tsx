'use client';
import React, { useState } from 'react';

export const ContactSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-16 p-8 md:p-20 rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
            Ready to simulate your <br className="hidden lg:block" /> next architecture?
          </h2>
          <p className="text-slate-500 text-lg mb-8">
            Contact our engineering team to explore how our service architectures can integrate into your institutional workflow.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-12">
            <div>
              <p className="font-bold text-slate-900 text-2xl">4+</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Architectures</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-2xl">0.0%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hype Index</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
          {submitted ? (
            <div className="p-8 rounded-2xl bg-green-50 border border-green-100 text-center animate-fade-in">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-green-800 font-bold mb-2">Access Requested</h4>
              <p className="text-green-700 text-sm">Our systems team will review your profile shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.com"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.02] transition-all"
              >
                Request Access
              </button>
              <p className="text-[10px] text-center text-slate-400 px-8">
                By requesting access, you agree to our professional engagement protocols and data protection standards.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
