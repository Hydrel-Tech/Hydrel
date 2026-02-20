
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const pricingTiers = [
  {
    name: 'Starter',
    price: '$0',
    desc: 'Basic analytics only. Get a feel for the system with essential insights in a limited geographical range. Ideal for trying out the core capabilities of the platform without commitment.',
    color: 'bg-[#FFFDF5]', // Very light gold
    textColor: 'text-slate-800'
  },
  {
    name: 'Student',
    price: '$89',
    desc: 'Pro features for students. Includes advanced analytics, enhanced reports, limited data exports, and priority support. Designed for postgraduates, senior or junior interns in real estate programs.',
    discount: 'Discounted ~40% from full Pro',
    color: 'bg-[#FFF8F5]', // Gold with slight red/warmth
    textColor: 'text-slate-900'
  },
  {
    name: 'Pro',
    price: '$179',
    desc: 'Full Pro features. Everything Student has plus advanced alerts, expert insights, and actionable recommendations. Ideal for serious analysts looking to boost at least one extra property per month. Moderate geographical range.',
    color: 'bg-[#FFF0F0]', // Light reddish tint
    textColor: 'text-slate-900'
  },
  {
    name: 'Ultra',
    price: '$279',
    desc: 'Advanced analytics for high-volume users. Includes all Pro features, advanced insights, detailed reports, wider geographical range across metropolitan America, enhanced exports and alerts. Perfect for professionals managing multiple metro areas.',
    color: 'bg-[#FFE5E5]', // Stronger red tint
    textColor: 'text-slate-900'
  },
  {
    name: 'Ultra Plus',
    price: '$379',
    desc: 'Unlimited power. Everything Ultra has but with unlimited zip codes and coverage across all USA metro areas. Designed for agencies and power users who need complete access and maximum flexibility.',
    color: 'bg-[#FFD6D6]', // Deepest red tint
    textColor: 'text-slate-900'
  }
];

export const MarketAlphaPricing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // -1 indicates not logged in or no tier loaded yet (default state for visitors)
  const [currentTierLevel, setCurrentTierLevel] = useState<number>(-1); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // If no user, reset to -1 immediately so buttons show "Choose Plan"
    if (!user) {
      setCurrentTierLevel(-1);
      setLoading(false);
      return;
    }

    const fetchUserTier = async () => {
      try {
        const { data, error } = await supabase
          .from('user_tiers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching tier:', error);
          setCurrentTierLevel(0); // Default to starter if error
        } else if (data) {
          // Determine tier level based on flags
          if (data.is_ultra_plus) setCurrentTierLevel(4);
          else if (data.is_ultra) setCurrentTierLevel(3);
          else if (data.is_pro) setCurrentTierLevel(2);
          else if (data.is_student) setCurrentTierLevel(1);
          else setCurrentTierLevel(0); // Starter
        } else {
          setCurrentTierLevel(0); // Default if no record found (implicit starter)
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setCurrentTierLevel(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTier();
  }, [user]);

  const handlePlanClick = (index: number) => {
    if (!user) {
        // If not logged in, redirect to login or signup (for this demo, maybe just alert or go to signup)
        // Since the prompt requested the popup logic on "Get System", here we assume standard flow.
        navigate('/signup'); 
        return;
    }

    if (index === currentTierLevel) {
      navigate('/market-alpha/dashboard', { state: { showIntro: true } });
    } else if (index > currentTierLevel) {
      // Logic to upgrade (e.g. Stripe checkout)
      alert("Redirecting to payment gateway...");
    }
  };

  return (
    <div className="bg-[#f6f9fc] min-h-screen pt-24 pb-20">
      {/* Header */}
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
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading subscription data...</div>
        ) : (
          <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-4">
            {pricingTiers.map((tier, index) => {
              // Logic:
              // If not logged in (currentTierLevel === -1), treat everyone as "Higher Tier" (enabled, Choose Plan).
              // If logged in:
              //   Equal -> Current (Continue)
              //   Greater -> Higher (Choose Plan)
              //   Less -> Lower (Disabled)
              
              const isVisitor = currentTierLevel === -1;
              const isCurrentTier = !isVisitor && index === currentTierLevel;
              const isHigherTier = isVisitor || index > currentTierLevel;
              const isLowerTier = !isVisitor && index < currentTierLevel;

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
                        ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300 shadow-yellow-400/20 scale-105 ring-2 ring-yellow-400 ring-offset-2' 
                        : isHigherTier
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02] shadow-emerald-600/20'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      }
                    `}
                  >
                    {isCurrentTier ? 'CONTINUE' : 'CHOOSE PLAN'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
