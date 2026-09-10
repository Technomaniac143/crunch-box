import React from 'react';
import { MenuItem } from '../types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ComboSectionProps {
  combos: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  onViewAllClick: () => void;
}

export const ComboSection: React.FC<ComboSectionProps> = ({
  combos,
  onAddToCart,
  onViewAllClick
}) => {
  return (
    <section className="py-16 sm:py-20 bg-[#0a0807] relative" id="combos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12">
          <div className="text-center md:text-left mx-auto md:mx-0">
            <div className="inline-flex items-center gap-3">
              <span className="text-amber-500 font-bold text-xl sm:text-2xl tracking-widest">–&gt;</span>
              <h2 className="font-bebas text-3xl sm:text-5xl text-white tracking-widest">
                COMBO OFFERS
              </h2>
              <span className="text-amber-500 font-bold text-xl sm:text-2xl tracking-widest">&lt;–</span>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm font-medium mt-1">
              More Crunch. More Savings.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onViewAllClick}
              className="cursor-pointer border border-neutral-700 hover:border-amber-500 text-neutral-300 hover:text-amber-400 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1"
            >
              <span>View All Menu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Combo Cards Grid / Responsive Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className="torn-paper-border rounded-xl p-5 border border-white/10 flex flex-col justify-between group relative cursor-pointer"
              onClick={() => onAddToCart(combo)}
            >
              {/* Popular / Best Seller Badge */}
              {combo.badge === 'POPULAR' && (
                <span className="absolute -top-3 right-5 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg glow-pulse-amber">
                  POPULAR
                </span>
              )}

              <div>
                {/* Header Pill */}
                <div className="badge-stamp px-4 py-1 inline-block font-bebas text-lg font-bold text-black uppercase tracking-wider mb-4">
                  {combo.badge === 'POPULAR' ? 'COMBO 2' : combo.badge || 'COMBO'}
                </div>

                {/* Inclusions List */}
                <ul className="text-xs text-neutral-300 space-y-1.5 font-medium mb-5 min-h-[72px]">
                  {combo.inclusions?.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold leading-tight">•</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>

                {/* Image Showcase */}
                <div className="w-full h-48 rounded-lg overflow-hidden relative mb-5 bg-black/40 border border-white/5">
                  <img
                    alt={combo.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    src={combo.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Pricing Ribbon and CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="price-ribbon px-4 py-1 text-white font-bebas text-2xl font-bold tracking-wider">
                  ₹{combo.price}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(combo);
                  }}
                  className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-xs px-5 py-2.5 rounded tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  ORDER NOW
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Center Bottom CTA */}
        <div className="text-center mt-12">
          <button
            onClick={onViewAllClick}
            className="cursor-pointer inline-block border-2 border-amber-500/70 hover:border-amber-500 text-white hover:text-amber-400 font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-lg transition-colors duration-200"
          >
            VIEW ALL COMBOS &amp; SIDES
          </button>
        </div>

      </div>
    </section>
  );
};
