import React, { useState } from 'react';
import { CartItem, FulfillmentType, PaymentMethodType, MenuItem } from '../types';
import { UPSELL_ITEMS } from '../data';
import {
  ArrowLeft,
  Truck,
  Store,
  Home,
  Briefcase,
  Plus,
  Minus,
  Trash2,
  Sliders,
  ShieldCheck,
  Zap,
  Info,
  Tag,
  Flame,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface CheckoutViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onAddUpsell: (upsell: { id: string; name: string; price: number }) => void;
  onBackToMenu: () => void;
  onOpenPaymentModal: (paymentMethod: PaymentMethodType) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onAddUpsell,
  onBackToMenu,
  onOpenPaymentModal
}) => {
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('delivery');
  const [selectedAddress, setSelectedAddress] = useState<'home' | 'studio'>('home');
  const [paymentMode, setPaymentMode] = useState<PaymentMethodType>('upi');
  const [orderNotes, setOrderNotes] = useState('');
  const [couponApplied, setCouponApplied] = useState(true);

  // Bill Calculations
  const itemsSubtotal = cartItems.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  const taxes = Math.round(itemsSubtotal * 0.05 * 100) / 100;
  const packagingFee = itemsSubtotal > 0 ? 20 : 0;
  const deliveryFee = 0; // Free promo
  const couponDiscount = couponApplied && itemsSubtotal > 150 ? 50 : 0;
  const totalPayable = Math.max(0, Math.round(itemsSubtotal + taxes + packagingFee - couponDiscount));

  const addNoteTag = (tagText: string) => {
    setOrderNotes(prev => prev ? `${prev} ${tagText}` : tagText);
  };

  return (
    <div className="w-full bg-[#0a0807] min-h-screen pb-24 pt-6">
      
      {/* Top Notification Bar */}
      <div className="w-full bg-[#120f0d] py-2.5 px-4 sm:px-6 lg:px-8 border-b border-white/5 mb-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              KITCHEN SIZZLING ACTIVE
            </span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Average Fry-to-Door Time: <strong className="text-amber-400">18 mins</strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-[11px] tracking-wide bg-neutral-800 px-2.5 py-1 rounded text-amber-400">
              CODE: CRUNCH50 APPLIED
            </span>
            <span className="text-neutral-400 hidden md:inline">
              Night Hotline: <strong className="text-white">+91 93451 22062</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wider mb-2 font-semibold">
              <button
                onClick={onBackToMenu}
                className="cursor-pointer hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Midnight Menu</span>
              </button>
              <span>/</span>
              <span className="text-amber-400 font-bold">Fast-Lane Checkout</span>
            </div>

            <h1 className="font-bebas text-4xl sm:text-5xl text-white uppercase tracking-wide flex items-center gap-3">
              <span>YOUR CRUNCH CRATE</span>
              <span className="bg-amber-500 text-black text-sm px-3 py-1 rounded font-bold align-middle">
                {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} ITEMS
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3 text-neutral-300 text-xs bg-[#14110f] px-4 py-2.5 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Hot Crisp Promise</span>
            </div>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-400">Late Night Express Hub #04</span>
          </div>
        </div>

        {/* 12-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Fulfillment, Crate Items, Upsell, Notes (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. Fulfillment Mode Toggle & Location */}
            <div className="bg-[#14110f] rounded-xl p-5 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bebas text-2xl text-white uppercase tracking-wide flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-500" />
                  <span>1. Fulfillment Mode</span>
                </h2>
                <span className="text-xs text-amber-400 font-semibold">20-Min Flash Radius</span>
              </div>

              {/* Segmented Button Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-[#0e0c0a] p-1.5 rounded-lg mb-5 border border-white/5">
                <button
                  type="button"
                  onClick={() => setFulfillment('delivery')}
                  className={`cursor-pointer flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs uppercase font-bold transition-all ${
                    fulfillment === 'delivery'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Delivery (20-Min Drop)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillment('pickup')}
                  className={`cursor-pointer flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs uppercase font-bold transition-all ${
                    fulfillment === 'pickup'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Express Counter Pickup</span>
                </button>
              </div>

              {/* Delivery Address Radio Picker */}
              {fulfillment === 'delivery' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300 font-bold uppercase tracking-wider">
                      Delivery Address:
                    </span>
                    <button
                      type="button"
                      onClick={() => alert('New address addition drawer opened! You can select Midnight Hub locations.')}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`cursor-pointer flex items-start gap-3 p-3.5 rounded-lg border transition-all ${
                        selectedAddress === 'home'
                          ? 'bg-[#1f1a16] border-amber-500 shadow-md shadow-amber-500/10'
                          : 'bg-[#191513] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_address"
                        checked={selectedAddress === 'home'}
                        onChange={() => setSelectedAddress('home')}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-sm text-white flex items-center gap-1.5">
                          <Home className="w-4 h-4 text-amber-400" />
                          <span>Midnight Pad (Apt 4B)</span>
                        </span>
                        <span className="text-xs text-neutral-400 mt-0.5">
                          808 Neon Boulevard, Sector 9
                        </span>
                        <span className="text-[11px] text-amber-400/80 mt-1 font-semibold">
                          Gate passcode: #9940
                        </span>
                      </div>
                    </label>

                    <label
                      className={`cursor-pointer flex items-start gap-3 p-3.5 rounded-lg border transition-all ${
                        selectedAddress === 'studio'
                          ? 'bg-[#1f1a16] border-amber-500 shadow-md shadow-amber-500/10'
                          : 'bg-[#191513] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_address"
                        checked={selectedAddress === 'studio'}
                        onChange={() => setSelectedAddress('studio')}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-sm text-white flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-neutral-400" />
                          <span>Creative Loft / Studio</span>
                        </span>
                        <span className="text-xs text-neutral-400 mt-0.5">
                          14 Industrial Lane, Dock 2
                        </span>
                        <span className="text-[11px] text-neutral-500 mt-1 font-semibold">
                          Call on arrival
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#1a1614] rounded-lg border border-white/10 text-xs text-neutral-300">
                  <p className="font-bold text-white text-sm">Pickup Station: Crunch Box Midnight Counter</p>
                  <p className="text-neutral-400 mt-1">808 Neon Boulevard, Express Window 2. Ready in 10-12 minutes.</p>
                </div>
              )}
            </div>

            {/* 2. Ordered Items List */}
            <div className="bg-[#14110f] rounded-xl p-5 border border-white/10 shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bebas text-2xl text-white uppercase tracking-wide flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>2. Sizzling Crate Items</span>
                </h2>
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="text-amber-400 text-xs uppercase font-bold hover:underline cursor-pointer"
                >
                  + Add More Items
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-10 bg-[#0e0c0a] rounded-lg border border-dashed border-neutral-800 p-6">
                  <p className="text-neutral-400 text-sm">Your Crunch Crate is currently empty.</p>
                  <button
                    type="button"
                    onClick={onBackToMenu}
                    className="cursor-pointer mt-4 px-6 py-2.5 bg-amber-500 text-black font-bold uppercase rounded-lg text-xs tracking-wider"
                  >
                    EXPLORE MENU
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {cartItems.map((cartItem, idx) => (
                    <div
                      key={`${cartItem.item.id}-${idx}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-lg bg-[#181412] border border-white/5"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="w-18 h-18 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden relative shadow bg-black/40 border border-white/5">
                          <img
                            alt={cartItem.item.name}
                            className="w-full h-full object-cover"
                            src={cartItem.item.image}
                          />
                          {cartItem.item.badge && (
                            <span className="absolute top-0.5 left-0.5 bg-black/90 text-amber-400 text-[9px] font-bebas px-1 rounded uppercase">
                              {cartItem.item.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-white truncate">
                              {cartItem.item.name}
                            </h3>
                            {cartItem.selectedSize && (
                              <span className="text-[10px] bg-neutral-800 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                {cartItem.selectedSize}
                              </span>
                            )}
                          </div>

                          {/* Customizations tags */}
                          {cartItem.customizations && cartItem.customizations.length > 0 && (
                            <div className="text-[11px] text-neutral-400 mt-1 space-y-0.5">
                              {cartItem.customizations.map((c, cIdx) => (
                                <span key={cIdx} className="flex items-center gap-1 text-neutral-400">
                                  <CheckCircle2 className="w-3 h-3 text-amber-500" />
                                  <span>{c}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-bebas text-xl text-amber-400">
                              ₹{cartItem.item.price * cartItem.quantity}
                            </span>
                            {cartItem.item.originalPrice && (
                              <span className="line-through text-neutral-500 text-xs">
                                ₹{cartItem.item.originalPrice * cartItem.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper & Actions */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="flex items-center bg-black/60 rounded-md p-1 border border-white/10">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(idx, -1)}
                            className="cursor-pointer w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold text-sm transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-white">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(idx, 1)}
                            className="cursor-pointer w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold text-sm transition-colors"
                            aria-label="Increase"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          className="cursor-pointer p-2 text-neutral-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Quick Add Upsell Carousel */}
            <div className="bg-[#14110f] rounded-xl p-5 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h2 className="font-bebas text-xl text-white uppercase tracking-wide">
                    Add Extra Crunch to Your Box
                  </h2>
                </div>
                <span className="text-xs text-neutral-400">Frequently Paired</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {UPSELL_ITEMS.map((upsell) => (
                  <div
                    key={upsell.id}
                    className="bg-[#1a1614] p-3 rounded-lg border border-white/5 flex flex-col justify-between hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-white uppercase truncate">
                        {upsell.name}
                      </span>
                      <span className="font-bebas text-base text-amber-400 shrink-0">
                        +₹{upsell.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mb-3 leading-snug">{upsell.desc}</p>
                    <button
                      type="button"
                      onClick={() => onAddUpsell(upsell)}
                      className="cursor-pointer w-full bg-[#241f1b] hover:bg-amber-500 hover:text-black text-amber-400 font-bold uppercase text-[11px] py-1.5 rounded transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Crate</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Midnight Delivery & Cooking Notes */}
            <div className="bg-[#14110f] rounded-xl p-5 border border-white/10 shadow-lg">
              <label htmlFor="order-notes" className="block font-bebas text-xl text-white uppercase tracking-wide mb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Midnight Delivery &amp; Cooking Notes</span>
              </label>
              <textarea
                id="order-notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Leave at apartment door, do not ring bell (night shift sleep), extra crispy fries please..."
                rows={2}
                className="w-full bg-[#0e0c0a] text-white text-xs p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-neutral-600 border border-white/5 resize-none"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => addNoteTag('Leave order at apartment door.')}
                  className="cursor-pointer text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded transition-colors"
                >
                  + Leave at door
                </button>
                <button
                  type="button"
                  onClick={() => addNoteTag('Do not ring bell.')}
                  className="cursor-pointer text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded transition-colors"
                >
                  + Don't ring bell
                </button>
                <button
                  type="button"
                  onClick={() => addNoteTag('Extra tissues and fork please.')}
                  className="cursor-pointer text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded transition-colors"
                >
                  + Extra cutlery
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Bill Breakdown & Payment Gateway (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-6">
            
            {/* Bill Breakdown Card */}
            <div className="bg-[#14110f] rounded-xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                    ORDER DETAILS
                  </span>
                  <span className="font-bebas text-2xl text-white uppercase">
                    BILL BREAKDOWN
                  </span>
                </div>
                <span className="bg-amber-500/10 text-amber-400 font-bebas text-sm px-2.5 py-1 rounded border border-amber-500/30">
                  FAST PAY
                </span>
              </div>

              {/* Price Lines */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Items Subtotal ({cartItems.reduce((acc, c) => acc + c.quantity, 0)} items)</span>
                  <span className="font-bold text-white">₹{itemsSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-neutral-400">
                  <div className="flex items-center gap-1">
                    <span>Restaurant GST &amp; Taxes (5%)</span>
                    <Info className="w-3.5 h-3.5 text-neutral-500" />
                  </div>
                  <span className="font-medium text-neutral-300">₹{taxes.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-neutral-400">
                  <span>Insulated Crunch Packaging</span>
                  <span className="font-medium text-neutral-300">₹{packagingFee.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-neutral-300">
                  <div className="flex items-center gap-1.5">
                    <span>20-Min Express Delivery Fee</span>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      FREE PROMO
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>

                {couponApplied && couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      <span className="font-bold text-xs uppercase">Coupon (CRUNCH50)</span>
                    </div>
                    <span className="font-bold">-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/10 my-4"></div>

              {/* Total Payable Row */}
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <span className="font-bebas text-xl text-white uppercase leading-none block">
                    TOTAL PAYABLE
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Includes all nocturnal surcharges &amp; GST
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bebas text-4xl sm:text-5xl text-amber-400 leading-none">
                    ₹{totalPayable}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="mb-5">
                <span className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-2 font-bold">
                  SELECT PAYMENT MODE
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                      paymentMode === 'upi'
                        ? 'bg-[#1f1a16] border-amber-500 text-amber-400'
                        : 'bg-[#181412] border-white/5 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="upi"
                      checked={paymentMode === 'upi'}
                      onChange={() => setPaymentMode('upi')}
                      className="sr-only"
                    />
                    <Zap className="w-5 h-5 mb-1" />
                    <span className="font-bold text-xs text-white">Instant UPI</span>
                    <span className="text-[9px] text-neutral-400">GPay/PhonePe</span>
                  </label>

                  <label
                    className={`cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                      paymentMode === 'cards'
                        ? 'bg-[#1f1a16] border-amber-500 text-amber-400'
                        : 'bg-[#181412] border-white/5 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cards"
                      checked={paymentMode === 'cards'}
                      onChange={() => setPaymentMode('cards')}
                      className="sr-only"
                    />
                    <Lock className="w-5 h-5 mb-1" />
                    <span className="font-bold text-xs text-white">Cards</span>
                    <span className="text-[9px] text-neutral-400">Debit / Credit</span>
                  </label>

                  <label
                    className={`cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                      paymentMode === 'cash'
                        ? 'bg-[#1f1a16] border-amber-500 text-amber-400'
                        : 'bg-[#181412] border-white/5 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash"
                      checked={paymentMode === 'cash'}
                      onChange={() => setPaymentMode('cash')}
                      className="sr-only"
                    />
                    <Store className="w-5 h-5 mb-1" />
                    <span className="font-bold text-xs text-white">Cash</span>
                    <span className="text-[9px] text-neutral-400">Pay at door</span>
                  </label>
                </div>
              </div>

              {/* Main Submit Button */}
              <button
                type="button"
                onClick={() => onOpenPaymentModal(paymentMode)}
                disabled={cartItems.length === 0}
                className="cursor-pointer w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black py-4 px-6 rounded-lg font-bebas text-xl tracking-wider uppercase font-bold shadow-xl shadow-amber-500/25 active:scale-98 transition-all flex flex-col items-center justify-center"
              >
                <span>CONFIRM &amp; PLACE ORDER (₹{totalPayable})</span>
                <span className="text-[10px] font-normal normal-case opacity-90">
                  Estimated Drop: 18–22 mins to your doorstep
                </span>
              </button>

              {/* Hot & Fresh Guarantee Notice */}
              <div className="mt-4 bg-[#181412] p-3 rounded-lg border border-white/5 flex items-start gap-2.5 text-xs text-neutral-400">
                <Flame className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Sizzling Heat Lamp Insulated</span>
                  <p className="text-[11px] leading-tight text-neutral-400 mt-0.5">
                    Your fries are sealed right out of the fryer in thermal-vented boxes. Crispiness guaranteed or replaced immediately.
                  </p>
                </div>
              </div>

            </div>

            {/* Trust Badges Bar */}
            <div className="bg-[#14110f] rounded-xl p-3 border border-white/10 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-[#1a1614] rounded-lg">
                <ShieldCheck className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="font-bold text-white text-[11px] uppercase block">100% Contactless</span>
                <span className="text-[10px] text-neutral-500">Zero human touch seal</span>
              </div>
              <div className="p-2.5 bg-[#1a1614] rounded-lg">
                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="font-bold text-white text-[11px] uppercase block">Midnight Help Desk</span>
                <span className="text-[10px] text-neutral-500">+91 93451 22062</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
