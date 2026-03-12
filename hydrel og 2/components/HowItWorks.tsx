
import React from 'react';

const steps = [
  {
    title: 'Input',
    desc: 'Unstructured data ingestion from vertical signals.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    )
  },
  {
    title: 'Processing',
    desc: 'Algorithmic filtering and schema transformation.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  },
  {
    title: 'Insight',
    desc: 'Proprietary intelligence generation and mapping.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    title: 'Execution',
    desc: 'Actionable output delivery to strategic teams.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 transition-colors duration-300">
      <div className="text-center mb-20">
        <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-4 [-webkit-text-stroke:1px_white] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.2)]">Core Methodology</h2>
        <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Built for clarity and performance</h3>
        <p className="text-xl text-white dark:text-slate-300 max-w-2xl mx-auto [-webkit-text-stroke:1px_white] dark:[-webkit-text-stroke:0px] transition-colors duration-300">
          Our systems follow a rigid methodology to ensure every unit of intelligence is verified and executable.
        </p>
      </div>

      <div className="relative">
        {/* Connection line */}
        <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px bg-slate-200 dark:bg-slate-700 transition-colors duration-300"></div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center mb-8 shadow-sm group hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors duration-300">
                <div className="text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
                  {step.icon}
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">{step.title}</h4>
              <p className="text-white dark:text-slate-400 text-lg leading-relaxed px-4 [-webkit-text-stroke:1px_white] dark:[-webkit-text-stroke:0px] transition-colors duration-300">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
