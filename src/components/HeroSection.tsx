import React from 'react';
import { ViewTab } from '../types';
import { Clock, Zap, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onOrderClick: () => void;
  onMenuClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOrderClick, onMenuClick }) => {
  return (
    <section className="relative min-h-[580px] lg:min-h-[680px] bg-gradient-to-b from-[#0e0c0a] via-[#14110f] to-[#0a0807] overflow-hidden pt-8 pb-14 lg:py-16 border-b border-white/5" id="home">
      {/* Background ambient lighting glows */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-0 top-1/3 w-[28rem] h-[28rem] bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Information Badges */}
          <div className="lg:col-span-6 space-y-6">
            {/* Distressed Large Title */}
            <div className="space-y-1">
              <h1 className="font-bebas text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] text-white">
                CRISPY.<br />
                <span className="text-amber-500 text-glow">LOADED.</span><br />
                IRRESISTIBLE.
              </h1>

              {/* Distressed Stamp Tag */}
              <div className="pt-3 inline-block">
                <div className="badge-stamp px-4 sm:px-5 py-1.5 font-bebas text-lg sm:text-2xl font-black text-black tracking-wider uppercase shadow-md rotate-[-1.5deg] hover:rotate-0 transition-transform duration-300">
                  FRENCH FRIES &amp; MORE
                </div>
              </div>
            </div>

            {/* Operating Highlights Badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-neutral-300 font-semibold text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 group">
                <span className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform duration-200">
                  <Clock className="w-4 h-4 text-amber-500" />
                </span>
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-tight">OPEN HOURS</p>
                  <p className="font-bold text-white uppercase tracking-wider">6 PM – 3 AM</p>
                </div>
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

              <div className="flex items-center gap-2.5 group">
                <span className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform duration-200">
                  <Zap className="w-4 h-4 text-amber-500" />
                </span>
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-tight">SPEEDY</p>
                  <p className="font-bold text-white uppercase tracking-wider">20-MINUTE DELIVERY</p>
                </div>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOrderClick}
                className="cursor-pointer inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-8 py-3.5 rounded-lg uppercase tracking-wider text-sm shadow-xl shadow-amber-500/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              >
                <span>ORDER NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onMenuClick}
                className="cursor-pointer inline-flex items-center bg-transparent hover:bg-white/5 text-white border-2 border-amber-500/60 hover:border-amber-500 font-bold px-8 py-3 rounded-lg uppercase tracking-wider text-sm transition-all duration-200"
              >
                VIEW MENU
              </button>
            </div>
          </div>

          {/* Right Column: Hero Food Photograph with Floating Seal */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-lg lg:max-w-xl aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                alt="Crunch Box Signature Loaded Fries, Crispy French Fries, Peri Peri Chicken and Chilled Drink Combo"
                className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out brightness-95 contrast-105"
                src="https://lh3.googleusercontent.com/aida/AEtjO1XW3CDn2HUPsdo-fNJ9gX73DR32kA3fww9ZpOBcs-wTR4QvhcabU6i1MFToelWrERheEXb6mtAjq77oGqQAd5wDDs7GY62_auqikURekPMn55VvBf1uVHtPuThn1aynpUWx5l-yGx-v5DnrPALQT0mCpTaHF750UoKiWU3alIdN1O9L8TRxU8DFwHKBo4zY6JwrvahRb2KSraslR6fB5DAtlVbau_EL8jALtXQMvM1Ge9itKH64LfqUIJM"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0807]/70 via-transparent to-transparent pointer-events-none"></div>

              {/* Floating 'Made Fresh Served Hot' Seal Badge */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-[#0a0807]/90 border-2 border-dashed border-amber-500 rounded-full p-2.5 sm:p-3 text-center w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm animate-float-slow glow-pulse-amber">
                <span className="text-[8px] sm:text-[9px] uppercase font-bold text-neutral-400 tracking-wider">MADE FRESH</span>
                <span className="font-bebas text-sm sm:text-base text-amber-400 font-bold leading-tight">
                  SERVED<br />HOT
                </span>
                <div className="w-5 h-0.5 bg-amber-500 my-0.5"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
