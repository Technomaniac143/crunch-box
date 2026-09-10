import React, { useState, useMemo } from 'react';
import { MenuItem } from '../types';
import { SIGNATURE_LOADED, COMBO_OFFERS, CLASSIC_FRIES, DIPS_AND_SIPS, ALL_MENU_ITEMS } from '../data';
import { Search, Flame, Star, Check, Sparkles, Clock, ShieldCheck } from 'lucide-react';

interface MenuSectionProps {
  onAddToCart: (item: MenuItem, size?: string) => void;
  onCheckoutClick: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onAddToCart, onCheckoutClick }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'loaded' | 'fries' | 'combos' | 'dips' | 'veg'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterPills: { id: 'all' | 'loaded' | 'fries' | 'combos' | 'dips' | 'veg'; label: string; count?: number }[] = [
    { id: 'all', label: 'All (14)' },
    { id: 'loaded', label: 'Loaded Fries' },
    { id: 'fries', label: 'French Fries' },
    { id: 'combos', label: 'Combos' },
    { id: 'dips', label: 'Beverages & Dips' },
    { id: 'veg', label: 'Veg Friendly' },
  ];

  const filteredItems = useMemo(() => {
    let items = ALL_MENU_ITEMS;
    if (activeCategory === 'loaded') items = items.filter(i => i.category === 'loaded');
    else if (activeCategory === 'fries') items = items.filter(i => i.category === 'fries');
    else if (activeCategory === 'combos') items = items.filter(i => i.category === 'combos');
    else if (activeCategory === 'dips') items = items.filter(i => i.category === 'dips');
    else if (activeCategory === 'veg') items = items.filter(i => i.isVeg);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.description.toLowerCase().includes(q) ||
        (i.badge && i.badge.toLowerCase().includes(q))
      );
    }
    return items;
  }, [activeCategory, searchQuery]);

  return (
    <div className="w-full bg-[#0a0807] min-h-screen pb-28" id="menu">
      
      {/* Menu Hero Banner */}
      <section className="relative w-full bg-[#0f0e0c] overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0807] via-[#0f0e0c]/90 to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-full lg:w-3/5 h-full opacity-25 filter blur-[1px] mix-blend-screen pointer-events-none">
          <img
            alt="Crunch Box Signature Spread"
            className="w-full h-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida/AEtjO1W2_76WruQxgi0kSt8kOqeph_HtW-9xBC5t2WKrAzpjSsYzkx69wZ6HBwSJ8k6KvDqXh_Z7MuVaRPEsG8js1yMxN_KT5DYMYwi9ERW8KMbfw_DTlJvWCSTpNgB5KMKnsRJa0MIuM0_4Yy0WwElKXGj4wLAT650Gh1o_uy3BDLqD9vSiyz_kACNoRnsJCz62sAAcgNCT_G5xbyBi_SPDAPUxYK5Q4kbJyOefQ7Zxrw11sR9i8uTryQDepo3H"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col gap-6">
          {/* Announcement Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#2b2a27] text-amber-400 font-bebas text-sm uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              20-Min Midnight Express Drop
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/80 text-red-400 border border-red-800/40 font-bebas text-sm uppercase">
              <Flame className="w-3.5 h-3.5" /> Hot &amp; Fresh Guaranteed
            </span>
          </div>

          <div className="max-w-2xl">
            <h1 className="font-bebas text-5xl sm:text-7xl text-white uppercase tracking-wide leading-none">
              OUR CRUNCH <span className="text-amber-500">MENU</span>
            </h1>
            <p className="text-neutral-300 text-sm sm:text-base mt-2 leading-relaxed">
              Late-Night Cravings, Cooked Fresh &amp; Delivered in 20 Mins. Ultra-crispy double-fried potatoes, doused in melted aged cheese, and smothered with nocturnal spices.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search loaded boxes, peri peri dips, seasoned cuts..."
                className="w-full bg-[#1e1a17] text-white placeholder:text-neutral-500 pl-11 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 border border-white/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs uppercase"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar pt-1">
            {filterPills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => setActiveCategory(pill.id)}
                className={`cursor-pointer shrink-0 px-4 py-2 rounded-lg font-bebas text-base uppercase tracking-wider transition-all duration-200 ${
                  activeCategory === pill.id
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold'
                    : 'bg-[#1a1614] text-neutral-400 hover:text-white hover:bg-[#25201d] border border-white/5'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notice Strip */}
      <div className="w-full bg-[#120f0d] py-3 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>
              Late Night Kitchen Active: <strong className="text-white font-semibold">6:00 PM — 3:00 AM Daily</strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span>Delivery Radius: <strong className="text-white">5.5 KM from Midnight Hub</strong></span>
            <span>•</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 100% Guaranteed Crispy
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-14">
        
        {/* If searching or filtering actively, show flat results */}
        {(searchQuery || activeCategory !== 'all') ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bebas text-3xl text-white tracking-wider">
                {activeCategory === 'veg' ? 'VEGETARIAN DELIGHTS' : `${activeCategory.toUpperCase()} ITEMS`}
                {searchQuery && ` MATCHING "${searchQuery}"`}
              </h2>
              <span className="text-amber-500 font-bebas text-lg">
                {filteredItems.length} ITEMS FOUND
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-[#14110f] rounded-xl border border-white/10 p-8">
                <p className="text-neutral-400 text-base">No crunchy items found matching your criteria.</p>
                <button
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  className="mt-4 px-6 py-2.5 bg-amber-500 text-black font-bold uppercase rounded-lg text-xs tracking-wider"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Structured Category Sections when viewing "All" */
          <>
            {/* Section 1: Signature Loaded Crates */}
            <section className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bebas text-2xl sm:text-3xl text-amber-500 tracking-wide uppercase">
                      01 / SIGNATURE LOADED CRATES
                    </span>
                    <span className="font-bebas text-xs px-2.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40 uppercase">
                      CRAVING FAVORITES
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                    Double-blanched golden spuds smothered in volcanic cheeses and signature fiery toppings.
                  </p>
                </div>
                <span className="font-bebas text-amber-400 text-lg">4 ITEMS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {SIGNATURE_LOADED.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
                ))}
              </div>
            </section>

            {/* Section 2: Combos & Value Feasts */}
            <section className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bebas text-2xl sm:text-3xl text-amber-500 tracking-wide uppercase">
                      02 / MIDNIGHT COMBO CRAVINGS
                    </span>
                    <span className="font-bebas text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                      SAVE UP TO 25%
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                    Complete nocturnal feasts paired with crispy sides and ice-cold refreshments.
                  </p>
                </div>
                <span className="font-bebas text-amber-400 text-lg">3 FEASTS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {COMBO_OFFERS.map((combo) => (
                  <div
                    key={combo.id}
                    className="bg-[#14110f] rounded-xl overflow-hidden border border-white/10 flex flex-col justify-between group hover:border-amber-500/40 transition-all duration-300 shadow-xl"
                  >
                    <div className="relative w-full h-52 bg-black/40 overflow-hidden">
                      <img
                        alt={combo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={combo.image}
                      />
                      <div className="absolute top-3 left-3 bg-amber-500 text-black px-3 py-1 rounded font-bebas text-sm font-bold uppercase shadow">
                        {combo.badge}
                      </div>
                      <div className="absolute top-3 right-3 bg-black/90 px-3 py-1 rounded font-bebas text-xl text-amber-400 border border-amber-500/30 shadow">
                        ₹{combo.price}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <div>
                        <h3 className="font-bebas text-2xl text-white tracking-wide group-hover:text-amber-400 transition-colors">
                          {combo.name}
                        </h3>
                        <ul className="mt-2 space-y-1 text-xs text-neutral-300">
                          {combo.inclusions?.map((inc, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-xs text-neutral-400">Night Owl Combo</span>
                        <button
                          onClick={() => onAddToCart(combo)}
                          className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-xs px-5 py-2.5 rounded tracking-wider shadow-md active:scale-95 transition-all"
                        >
                          ORDER COMBO
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Classic & Seasoned Cut Fries */}
            <section className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bebas text-2xl sm:text-3xl text-amber-500 tracking-wide uppercase">
                      03 / CLASSIC &amp; SEASONED CUTS
                    </span>
                    <span className="font-bebas text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                      HOT SHAKEN
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                    Triple-cooked skin-on potatoes seasoned with our in-house midnight spice blends.
                  </p>
                </div>
                <span className="font-bebas text-amber-400 text-lg">3 STYLES</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CLASSIC_FRIES.map((fries) => (
                  <div
                    key={fries.id}
                    className="bg-[#14110f] rounded-xl p-5 border border-white/10 flex flex-col justify-between gap-4 group hover:border-amber-500/40 transition-all shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            VEG
                          </span>
                          {fries.badge && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded uppercase font-bold">
                              {fries.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bebas text-2xl text-white tracking-wide group-hover:text-amber-400 transition-colors">
                          {fries.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                          {fries.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bebas text-2xl text-amber-500 block leading-none">
                          ₹{fries.price}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase">Regular</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="text-xs text-neutral-400">
                        Large: <strong className="text-white">₹{fries.price + 50}</strong>
                      </div>
                      <button
                        onClick={() => onAddToCart(fries, 'Regular')}
                        className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-xs px-4 py-2 rounded tracking-wider active:scale-95 transition-all"
                      >
                        ADD +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Extra Dips & Midnight Sips */}
            <section className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bebas text-2xl sm:text-3xl text-amber-500 tracking-wide uppercase">
                      04 / EXTRA DIPS &amp; MIDNIGHT SIPS
                    </span>
                    <span className="font-bebas text-xs px-2.5 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase">
                      SIDES
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                    Crafted sauces and chilled beverages designed to pair perfectly with fry crunch.
                  </p>
                </div>
                <span className="font-bebas text-amber-400 text-lg">4 ADD-ONS</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {DIPS_AND_SIPS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#14110f] rounded-xl p-4 border border-white/10 flex flex-col justify-between gap-3 group hover:border-amber-500/40 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="font-bebas text-xl text-amber-500">₹{item.price}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 leading-snug">{item.description}</p>
                    </div>
                    <button
                      onClick={() => onAddToCart(item)}
                      className="cursor-pointer w-full py-2 bg-[#211d1a] hover:bg-amber-500 text-neutral-300 hover:text-black font-bold uppercase text-[11px] rounded transition-all tracking-wider"
                    >
                      + ADD TO CRATE
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

      </div>
    </div>
  );
};

// Sub-component for individual item cards
const MenuItemCard: React.FC<{ item: MenuItem; onAddToCart: (item: MenuItem) => void }> = ({
  item,
  onAddToCart,
}) => {
  return (
    <div className="bg-[#14110f] rounded-xl overflow-hidden border border-white/10 flex flex-col justify-between group hover:border-amber-500/50 transition-all duration-300 shadow-xl">
      <div className="relative w-full aspect-video bg-black/40 overflow-hidden">
        <img
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={item.image}
        />
        
        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded font-bebas text-xs text-white">
          <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          <span>{item.isVeg ? 'VEG' : 'NON-VEG'}</span>
        </div>

        {/* Price Tag */}
        <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-md px-3 py-0.5 rounded font-bebas text-xl text-amber-400 border border-amber-500/30 shadow-md">
          ₹{item.price}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
              {item.name}
            </h3>
            <div className="flex items-center text-amber-500 shrink-0 text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
              <span className="font-semibold text-white">{item.rating}</span>
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="text-[11px] text-neutral-400 font-medium">
            {item.spiceLevel ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Flame className="w-3.5 h-3.5" /> {item.spiceLevel}
              </span>
            ) : (
              <span className="text-neutral-500">Triple Fried</span>
            )}
          </div>
          <button
            onClick={() => onAddToCart(item)}
            className="cursor-pointer px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-xs rounded tracking-wider shadow active:scale-95 transition-all"
          >
            ADD +
          </button>
        </div>
      </div>
    </div>
  );
};
