import React from 'react';
import { ViewTab } from '../types';
import { Phone, Mail, Clock, MapPin, Instagram, Facebook, Twitter, Flame } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: ViewTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="bg-[#0c0a09] border-t border-white/10 text-neutral-300 pt-16 pb-24 sm:pb-16" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Brand Info (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-amber-500 p-1 flex items-center justify-center bg-[#151210]">
                <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 19h16v2H4zM6 9h3v8H6zm5-4h3v12h-3zm5 2h3v10h-3zM5.5 5.5l2.12-2.12 2.12 2.12L7.62 7.62zm10.76 0l2.12-2.12 2.12 2.12-2.12 2.12z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bebas text-2xl text-white tracking-widest leading-none">
                  CRUNCH BOX
                </span>
                <span className="text-[9px] tracking-[0.2em] text-amber-400 font-bold uppercase">
                  French Fries • Loaded Fries
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              Hot, crispy French fries and generously loaded savory crates delivered in 20 minutes. Satisfying nocturnal cravings 365 nights a year.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#contact"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:bg-neutral-700 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:bg-neutral-700 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:bg-neutral-700 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-bebas text-lg text-white uppercase tracking-wider">
              QUICK LINKS
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavClick('home')}
                  className="cursor-pointer hover:text-amber-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('menu')}
                  className="cursor-pointer hover:text-amber-400 transition-colors"
                >
                  Full Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('combos')}
                  className="cursor-pointer hover:text-amber-400 transition-colors"
                >
                  Midnight Combos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('about')}
                  className="cursor-pointer hover:text-amber-400 transition-colors"
                >
                  About Our Kitchen
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('checkout')}
                  className="cursor-pointer hover:text-amber-400 transition-colors"
                >
                  View My Crate
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-bebas text-lg text-white uppercase tracking-wider">
              CATEGORIES
            </h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>Loaded Fries Crates</li>
              <li>Classic Cut Potatoes</li>
              <li>Peri-Peri Strips Combos</li>
              <li>Gourmet Cheese Dips</li>
              <li>Chilled Midnight Drinks</li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-3">
            <h3 className="font-bebas text-lg text-white uppercase tracking-wider">
              CONTACT &amp; HOURS
            </h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>6:00 PM – 3:00 AM Daily</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-white font-bold">+91 93451 22062</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>orders@crunchbox.in</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Hub #04, Neon Blvd, Sector 9</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Crunch Box India. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-neutral-400 transition-colors cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-neutral-400 transition-colors cursor-pointer">FSSAI Lic. #10022022001889</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
