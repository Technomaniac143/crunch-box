import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface StickyCartBarProps {
  totalItems: number;
  subtotal: number;
  onViewCrate: () => void;
}

export const StickyCartBar: React.FC<StickyCartBarProps> = ({
  totalItems,
  subtotal,
  onViewCrate,
}) => {
  if (totalItems === 0) return null;

  return (
    <aside aria-label="Cart Summary" className="fixed bottom-16 sm:bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div className="bg-[#14110f] border-2 border-amber-500 rounded-xl p-3 sm:p-4 shadow-2xl shadow-amber-500/20 flex items-center justify-between gap-4 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold relative shrink-0">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-black text-amber-400 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            </div>
            <div>
              <span className="text-white font-bold text-xs uppercase block tracking-wider">
                CRATE SUB-TOTAL
              </span>
              <span className="font-bebas text-xl sm:text-2xl text-amber-400 leading-none">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={onViewCrate}
            className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-5 py-2.5 rounded-lg uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
          >
            <span>VIEW CRATE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </div>
    </aside>
  );
};
