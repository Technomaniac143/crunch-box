import React, { useState } from 'react';
import { ViewTab } from '../types';
import { ShoppingBag, Menu as MenuIcon, X, Flame } from 'lucide-react';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, cartCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; tab: ViewTab }[] = [
    { label: 'Home', tab: 'home' },
    { label: 'Menu', tab: 'menu' },
    { label: 'Combos', tab: 'combos' },
    { label: 'About Us', tab: 'about' },
    { label: 'Contact', tab: 'contact' },
  ];

  const handleNavClick = (tab: ViewTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0807]/95 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group text-left focus:outline-none cursor-pointer"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-amber-500 p-1 flex items-center justify-center bg-[#151210] group-hover:scale-105 transition-transform duration-200 shadow-md shadow-amber-500/20">
            {/* Fries Icon */}
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 transition-transform duration-300 group-hover:rotate-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 19h16v2H4zM6 9h3v8H6zm5-4h3v12h-3zm5 2h3v10h-3zM5.5 5.5l2.12-2.12 2.12 2.12L7.62 7.62zm10.76 0l2.12-2.12 2.12 2.12-2.12 2.12z"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bebas text-2xl sm:text-3xl text-white tracking-widest leading-none group-hover:text-amber-400 transition-colors">
              CRUNCH BOX
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-amber-400 font-bold uppercase">
              French Fries • Loaded Fries
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wider uppercase text-neutral-300">
          {navLinks.map((link) => (
            <button
              key={link.tab}
              onClick={() => handleNavClick(link.tab)}
              className={`nav-link-anim transition-colors duration-200 cursor-pointer ${
                activeTab === link.tab
                  ? 'text-amber-400 active font-bold'
                  : 'text-neutral-300 hover:text-amber-400'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions: Cart & Order Now */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Icon */}
          <button
            onClick={() => handleNavClick('checkout')}
            aria-label="View Cart"
            className="relative p-2 text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer flex items-center justify-center rounded-lg hover:bg-white/5"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-bebas text-xs rounded-full px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center font-bold shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* ORDER NOW CTA */}
          <button
            onClick={() => handleNavClick('combos')}
            className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-black px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-black" />
            ORDER NOW
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-white rounded-lg focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e0c0a] border-b border-white/10 px-4 py-5 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.tab}
                onClick={() => handleNavClick(link.tab)}
                className={`text-left py-2.5 px-3 rounded-lg font-bebas text-xl tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-between ${
                  activeTab === link.tab
                    ? 'bg-amber-500/10 text-amber-400 border-l-4 border-amber-500'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2 border-t border-white/10">
            <button
              onClick={() => handleNavClick('checkout')}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-lg uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>VIEW CRATE ({cartCount} ITEMS)</span>
            </button>
            <button
              onClick={() => handleNavClick('combos')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3 rounded-lg uppercase tracking-wider text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-black" />
              <span>ORDER MIDNIGHT FEAST</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
