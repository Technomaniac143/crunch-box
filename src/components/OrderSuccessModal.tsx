import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';
import { CheckCircle2, Flame, Bike, Clock, ShieldCheck, MapPin, Sparkles, X } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: CartItem[];
  totalAmount: number;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderItems,
  totalAmount
}) => {
  const [countdown, setCountdown] = useState(1120); // ~18 mins 40 secs

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#14110f] rounded-2xl border border-amber-500/30 shadow-2xl p-6 sm:p-8 text-neutral-200 overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Confirmed Icon Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mx-auto text-amber-500 shadow-xl glow-pulse-amber">
            <Flame className="w-9 h-9 fill-amber-500 text-amber-500" />
          </div>

          <div className="inline-block badge-stamp px-3 py-0.5 text-xs font-black uppercase text-black">
            ORDER #CB-9942 CONFIRMED
          </div>

          <h2 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-wide leading-none pt-1">
            FRIES ARE HITTING <span className="text-amber-500">THE OIL!</span>
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm">
            Freshly double-blanched potatoes are submerged in crisping oil right now.
          </p>
        </div>

        {/* Live Tracking Timer Card */}
        <div className="bg-[#0e0c0a] p-4 rounded-xl border border-white/5 mb-6 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            ESTIMATED DELIVERY TIMER
          </span>
          <div className="font-bebas text-4xl text-amber-400 font-bold tracking-wider">
            {formatCountdown(countdown)} MINS
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
            <Bike className="w-4 h-4 text-amber-500" />
            <span>Rider Assigned: Ravi Kumar (Express Fleet)</span>
          </div>
        </div>

        {/* Tracker Steps */}
        <div className="space-y-3 mb-6 bg-[#191513] p-4 rounded-xl border border-white/5 text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-bold text-white">Order Received &amp; Verified (Paid ₹{totalAmount})</span>
          </div>
          <div className="flex items-center gap-3">
            <Flame className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
            <span className="font-bold text-amber-400">In the Fryer (Crisping at 180°C)</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-500">
            <span className="w-4 h-4 rounded-full border border-neutral-700 flex items-center justify-center text-[10px]">3</span>
            <span>Vented Thermal Seal &amp; Fresh Sauce Pack</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-500">
            <span className="w-4 h-4 rounded-full border border-neutral-700 flex items-center justify-center text-[10px]">4</span>
            <span>20-Min Doorstep Drop</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              alert('Tracking link sent to your registered phone number via WhatsApp / SMS.');
            }}
            className="cursor-pointer w-full bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-lg font-bebas text-lg uppercase tracking-wider font-bold shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
          >
            TRACK LIVE ON WHATSAPP / SMS
          </button>
          
          <button
            onClick={onClose}
            className="cursor-pointer w-full bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white py-2.5 text-xs uppercase tracking-wider font-bold transition-colors"
          >
            BACK TO HOMEPAGE
          </button>
        </div>

      </div>
    </div>
  );
};
