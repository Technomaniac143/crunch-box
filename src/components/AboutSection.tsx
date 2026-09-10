import React from 'react';

interface AboutSectionProps {
  onLearnMoreClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onLearnMoreClick }) => {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-[#0e0c0a] to-[#120f0d] border-t border-white/5 relative overflow-hidden" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* About Narrative Text */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-bebas text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide leading-none">
              ABOUT <span className="text-amber-500">CRUNCH BOX</span>
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              At Crunch Box, we're all about bold flavors, crispy perfection, and unforgettable crunch. From classic golden fries dusted with secret house spices to generously loaded delights topped with melted cheddar, zesty garlic mayo, and juicy peri-peri chicken – we’ve got your late-night cravings covered!
            </p>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Each serving is crafted hot to order using premium quality potatoes, proprietary sauces, and high-heat frying techniques to guarantee that unmistakable satisfying crunch in every single bite.
            </p>
            <div className="pt-2">
              <button
                onClick={onLearnMoreClick}
                className="cursor-pointer inline-block bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-xs tracking-widest px-8 py-3.5 rounded-lg shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                LEARN MORE
              </button>
            </div>
          </div>

          {/* About Food Hero Photo */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                alt="Signature Loaded Fries Box"
                className="w-full h-80 sm:h-96 object-cover object-bottom scale-100 group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida/AEtjO1VsuiBe-m8CRKfQPt00vyQTj4Z3O_CnsgTyKMYDmX2td-0KfoMu9BfekANXnCfQnqJl-uGBeez-T7dQargSUBWpoy4SYBhsJ_h_fSE6LDWEah6CrWUCTk-BklaClFhDs_b2OqpxL5CY0ua_N39Z8n9avdcsg8rmHNAYdl0pKwhAT1TGRMEvlkpD9NhLM2R-1dwMvjZhX4rgA6c7N6WJlQ08wCFzjUwGMWixFX-fc1joiT8CDi40JygXhBKv"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-black/60 px-4 py-1.5 rounded-full border border-amber-500/30 backdrop-blur-sm">
                  Signature Loaded Fries Box
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
