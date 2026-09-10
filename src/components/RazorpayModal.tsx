import React, { useState, useEffect } from 'react';
import { PaymentMethodType } from '../types';
import {
  X,
  Shield,
  QrCode,
  CreditCard,
  Building2,
  Wallet,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: () => void;
  defaultMethod?: PaymentMethodType;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPaymentSuccess,
  defaultMethod = 'upi'
}) => {
  const [selectedTab, setSelectedTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'paylater'>('upi');
  const [upiId, setUpiId] = useState('');
  const [timeLeft, setTimeLeft] = useState(885); // 14 mins 45 secs
  const [isProcessing, setIsProcessing] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8920');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('•••');

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141210] rounded-2xl border border-white/10 shadow-2xl overflow-hidden text-neutral-200 flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          aria-label="Close payment modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Merchant & Order Summary */}
        <div className="w-full md:w-5/12 bg-[#0e0c0a] p-6 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between">
          <div>
            {/* Razorpay Brand Strip */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm tracking-tighter">
                R
              </div>
              <div>
                <span className="font-bold text-sm text-white block leading-tight">Razorpay</span>
                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> 256-bit SSL Secure
                </span>
              </div>
            </div>

            {/* Merchant Details */}
            <div className="space-y-1 mb-6">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                PAYING TO
              </span>
              <h3 className="font-bebas text-2xl text-white tracking-wider">
                CRUNCH BOX INDIA
              </h3>
              <p className="text-xs text-neutral-400">Order Ref #CB-9942 • Midnight Delivery</p>
            </div>

            {/* Total Amount Box */}
            <div className="bg-[#181412] p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                PAYABLE AMOUNT
              </span>
              <div className="font-bebas text-3xl sm:text-4xl text-amber-400 leading-none">
                ₹{amount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Session Timer */}
          <div className="pt-6 flex items-center gap-2 text-xs text-neutral-400 border-t border-white/5 mt-6">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Session expires in <strong className="text-white font-mono">{formatTime(timeLeft)}</strong></span>
          </div>
        </div>

        {/* Right Side: Payment Methods & Gateway Inputs */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between">
          
          {/* Method Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-white/10 no-scrollbar mb-5">
            <button
              onClick={() => setSelectedTab('upi')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                selectedTab === 'upi'
                  ? 'bg-amber-500 text-black shadow'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>UPI / QR</span>
            </button>

            <button
              onClick={() => setSelectedTab('card')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                selectedTab === 'card'
                  ? 'bg-amber-500 text-black shadow'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setSelectedTab('netbanking')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                selectedTab === 'netbanking'
                  ? 'bg-amber-500 text-black shadow'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Netbanking</span>
            </button>

            <button
              onClick={() => setSelectedTab('paylater')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                selectedTab === 'paylater'
                  ? 'bg-amber-500 text-black shadow'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>PayLater</span>
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-1 min-h-[260px]">
            
            {/* 1. UPI TAB */}
            {selectedTab === 'upi' && (
              <div className="space-y-4">
                {/* QR Code and Quick Apps */}
                <div className="flex items-center gap-4 bg-[#0e0c0a] p-3.5 rounded-xl border border-white/5">
                  <div className="w-24 h-24 bg-white p-1.5 rounded-lg flex items-center justify-center shrink-0 shadow">
                    {/* Simulated Clean QR Code */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect width="100" height="100" fill="white" />
                      <path d="M10 10h30v30h-30zM60 10h30v30h-30zM10 60h30v30h-30z" fill="black" />
                      <path d="M15 15h20v20h-20zM65 15h20v20h-20zM15 65h20v20h-20z" fill="white" />
                      <path d="M20 20h10v10h-10zM70 20h10v10h-10zM20 70h10v10h-10z" fill="black" />
                      <rect x="45" y="10" width="10" height="35" fill="black" />
                      <rect x="10" y="45" width="35" height="10" fill="black" />
                      <rect x="55" y="55" width="15" height="15" fill="black" />
                      <rect x="75" y="55" width="15" height="35" fill="black" />
                      <rect x="45" y="75" width="25" height="15" fill="black" />
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">
                      Scan with any UPI App
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      GPay, PhonePe, Paytm, CRED, BHIM &amp; Banking apps.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded font-bold">GPay</span>
                      <span className="text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded font-bold">PhonePe</span>
                      <span className="text-[10px] bg-cyan-900/60 text-cyan-300 px-1.5 py-0.5 rounded font-bold">Paytm</span>
                    </div>
                  </div>
                </div>

                {/* VPA Input */}
                <div className="space-y-2">
                  <label htmlFor="upi-vpa-input" className="block text-xs font-bold text-neutral-300 uppercase">
                    OR ENTER UPI ID (VPA)
                  </label>
                  <div className="relative">
                    <input
                      id="upi-vpa-input"
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="mobile-number@okhdfcbank"
                      className="w-full bg-[#0e0c0a] text-white text-xs p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setUpiId('customer@okaxis')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-amber-400 hover:underline uppercase font-bold cursor-pointer"
                    >
                      Autofill
                    </button>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['@okhdfcbank', '@ybl', '@paytm', '@okaxis'].map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => setUpiId((prev) => `${prev.split('@')[0] || 'customer'}${handle}`)}
                        className="cursor-pointer text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded"
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. CARD TAB */}
            {selectedTab === 'card' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="card-number-input" className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Card Number
                  </label>
                  <input
                    id="card-number-input"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#0e0c0a] text-white text-xs p-2.5 rounded-lg border border-white/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="card-expiry-input" className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      id="card-expiry-input"
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-[#0e0c0a] text-white text-xs p-2.5 rounded-lg border border-white/10"
                    />
                  </div>
                  <div>
                    <label htmlFor="card-cvv-input" className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      CVV / CVC
                    </label>
                    <input
                      id="card-cvv-input"
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                      className="w-full bg-[#0e0c0a] text-white text-xs p-2.5 rounded-lg border border-white/10"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 flex items-center gap-1 pt-1">
                  <Lock className="w-3 h-3 text-neutral-400" /> Tokenized and saved as per RBI guidelines.
                </p>
              </div>
            )}

            {/* 3. NETBANKING TAB */}
            {selectedTab === 'netbanking' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-300 uppercase block">Popular Banks</span>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => handleSimulatePayment()}
                      className="cursor-pointer p-2.5 bg-[#0e0c0a] hover:bg-neutral-800 text-left rounded-lg text-xs text-white border border-white/5 flex items-center justify-between"
                    >
                      <span>{bank}</span>
                      <ArrowRight className="w-3 h-3 text-neutral-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PAYLATER TAB */}
            {selectedTab === 'paylater' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#0e0c0a] rounded-lg border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white block">Simpl 1-Click PayLater</span>
                    <span className="text-[11px] text-neutral-400">Pay next month with 0% interest</span>
                  </div>
                  <span className="text-emerald-400 text-xs font-bold">APPROVED</span>
                </div>
                <div className="p-3 bg-[#0e0c0a] rounded-lg border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white block">LazyPay by PayU</span>
                    <span className="text-[11px] text-neutral-400">Credit line available</span>
                  </div>
                  <span className="text-emerald-400 text-xs font-bold">AVAILABLE</span>
                </div>
              </div>
            )}

          </div>

          {/* Action Button */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="cursor-pointer w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-black py-3 rounded-lg font-bebas text-xl uppercase tracking-wider font-bold shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>COMMUNICATING WITH BANK...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>PAY SECURELY ₹{amount.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
