import React from 'react';

interface PromotionalBannerProps {
  onOrderClick: () => void;
}

export const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ onOrderClick }) => {
  return (
    <section className="py-14 sm:py-16 bg-[#171310] border-y border-white/10 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 to-transparent opacity-40 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h2 className="font-bebas text-3xl sm:text-4xl lg:text-5xl text-white tracking-wider">
              CRAVING SOMETHING CRUNCHY?
            </h2>
            <p className="text-amber-500 font-bold uppercase text-xs sm:text-sm md:text-base tracking-widest">
              ORDER NOW &amp; GET IT DELIVERED FAST!
            </p>
          </div>

          {/* Order Action & Curved Decorative Graphic Indicator */}
          <div className="flex items-center gap-6">
            <button
              onClick={onOrderClick}
              className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-8 sm:px-10 py-3.5 sm:py-4 rounded-lg uppercase tracking-wider text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              ORDER NOW
            </button>

            {/* Hand-drawn curved arrow indicator with gentle floating animation */}
            <div className="hidden lg:block text-amber-500 transform rotate-12 animate-float-slow">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
