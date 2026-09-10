import React from 'react';
import { Star, Flame, Truck, Smile } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: Star,
      title: 'PREMIUM QUALITY',
      desc: 'Only the best ingredients, always fresh.'
    },
    {
      icon: Flame,
      title: 'MADE HOT',
      desc: 'Cooked fresh & served hot every time.'
    },
    {
      icon: Truck,
      title: 'FAST DELIVERY',
      desc: 'Delivered hot & fresh in just 20 minutes.'
    },
    {
      icon: Smile,
      title: 'CUSTOMER FIRST',
      desc: 'Your satisfaction is our top priority.'
    }
  ];

  return (
    <section className="bg-[#120f0d] border-y border-white/5 py-8 sm:py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-start sm:items-center gap-3 group p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="font-bebas text-base sm:text-lg text-white tracking-wider leading-none">
                    {badge.title}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-snug">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
