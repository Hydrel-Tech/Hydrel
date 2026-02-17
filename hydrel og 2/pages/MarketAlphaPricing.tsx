
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

// Simplified for demo: assume these IDs map to the array index
// 0: Starter, 1: Student, 2: Pro, 3: Ultra, 4: Ultra Plus
const TIER_LEVELS = {
  'Starter': 0,
  'Student': 1,
  'Pro': 2,
  'Ultra': 3,
  'Ultra Plus': 4
};

const pricingTiers = [
  {
    name: 'Starter (Low Netty)',
    price: '$0',
    zips: '2',
    desc: 'Basic analytics only. Get a feel for the system with essential insights in a limited geographical range. Ideal for trying out the core capabilities of the platform without commitment.',
    color: 'bg-[#FFFDF5]', // Very light gold
    buttonColor: 'bg-emerald-600',
    textColor: 'text-slate-800'
  },
  {
    name: 'Student',
    price: '$89',
    zips: '6',
    desc: 'Pro features for students. Includes advanced analytics, enhanced reports, limited data exports, and priority support. Designed for postgraduates, senior or junior interns in real estate programs.',
    discount: 'Discounted ~40% from full Pro',
    color: 'bg-[#FFF8F5]', // Gold with slight red/warmth
    buttonColor: 'bg-emerald-600',
    textColor: 'text-slate-900'
  },
  {
    name: 'Pro',
    price: '$179',
    zips: '10',
    desc: 'Full Pro features. Everything Student has plus advanced alerts, expert insights, and actionable recommendations. Ideal for serious analysts looking to boost at least one extra property per month. Moderate geographical range.',
    color: 'bg-[#FFF0F0]', // Light reddish tint
    buttonColor: 'bg-emerald-600',
    textColor: 'text-slate-900'
  },
  {
    name: 'Ultra',
    price: '$279',
    zips: '30',
    desc: 'Advanced analytics for high-volume users. Includes all Pro features, advanced insights, detailed reports, wider geographical range across metropolitan America, enhanced exports and alerts. Perfect for professionals managing multiple metro areas.',
    color: 'bg-[#FFE5E5]', // Stronger red tint
    buttonColor: 'bg-emerald-600',
    textColor: 'text-slate-900'
  },
  {
    name: 'Ultra Plus',
    price: '$379',
    zips: 'Unlimited',
    desc: 'Unlimited power. Everything Ultra has but with unlimited zip codes and coverage across all USA metro areas. Designed for agencies and power users who need complete access and maximum flexibility.',
    color: 'bg-[#FFD6D6]', // Deepest red tint
    buttonColor: 'bg-emerald-600',
    textColor: 'text-slate-900'
  }
];

export const MarketAlphaPricing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTierLevel, setCurrentTierLevel] = useState<number>(0); 

  useEffect(() => {
    // Simulate fetching user tier. In a real app, query supabase table 'user_tiers'.
    // For this demo, we'll assume a logged in user is on the 'Pro' tier (Level 2).
    if (user) {
      // Mock fetch
      setCurrentTierLevel(2); 
    } else {
      setCurrentTierLevel(-1); // Not logged in
    }
  }, [user]);

  const handlePlanClick = (index: number) => {
    if (index === currentTierLevel) {
      navigate('/market-alpha/dashboard');
    } else if (index > currentTierLevel) {
      // Logic to upgrade (e.g. Stripe checkout)
      alert("Redirecting to payment gateway...");
    }
    // Tiers below current are disabled/grayed out
  };

  return (
    <div className="bg-[#f6f9fc] min-h-screen pt-24 pb-20">
      {/* Reused Header from MarketAlpha for consistency */}
      <div className="bg-emerald-900 text-white relative overflow-hidden -mt-24 pt-40 pb-24 mb-16">
         <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full transform skew-y-[-3deg] origin-top-left bg-emerald-800 translate-y-[-10%] opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-2/3 h-full bg-gradient-to-tl from-teal-500/20 to-emerald-600/20 blur-3xl rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link to="/market-alpha" className="inline-block px-4 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-xs font-bold uppercase tracking-widest mb-6 hover:bg-emerald-500/40 transition-colors cursor-pointer">
            ← Back to Architecture
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            System Access Plans
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl leading-relaxed">
            Select the capacity that aligns with your institutional analysis requirements.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-4">
          {pricingTiers.map((tier, index) => {
            const isCurrentTier = index === currentTierLevel;
            const isHigherTier = index > currentTierLevel;
            const isLowerTier = index < currentTierLevel;

            return (
              <div 
                key={index} 
                className={`flex flex-col p-6 rounded-3xl border transition-all duration-300 ${
                  isLowerTier 
                    ? 'bg-slate-100 border-slate-200 opacity-60' 
                    : `shadow-sm hover:shadow-xl ${tier.color} border-slate-200`
                }`}
              >
                <div className="mb-4">
                  <h3 className={`text-lg font-bold ${tier.textColor} mb-2`}>{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{tier.price}</span>
                    {tier.price !== '$0' && <span className="text-xs text-slate-500 font-bold uppercase">/mo</span>}
                  </div>
                  {tier.discount && (
                    <span className="inline-block mt-2 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {tier.discount}
                    </span>
                  )}
                </div>

                <div className="mb-6 pb-6 border-b border-slate-900/5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                  <p className="font-semibold text-slate-700">
                    {tier.zips} Zip Codes <span className="text-slate-400 font-normal">/ month</span>
                  </p>
                </div>

                <div className="flex-grow mb-8">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {tier.desc}
                  </p>
                </div>

                <button 
                  onClick={() => handlePlanClick(index)}
                  disabled={isLowerTier}
                  className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider
                    ${isCurrentTier 
                      ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300 shadow-yellow-400/20' 
                      : isHigherTier
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02] shadow-emerald-600/20'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    }
                  `}
                >
                  {isCurrentTier ? 'Continue' : 'Choose Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
