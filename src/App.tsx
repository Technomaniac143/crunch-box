import React, { useState } from 'react';
import { ViewTab, CartItem, MenuItem, PaymentMethodType } from './types';
import { COMBO_OFFERS, INITIAL_CART_ITEMS } from './data';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TrustBadges } from './components/TrustBadges';
import { ComboSection } from './components/ComboSection';
import { AboutSection } from './components/AboutSection';
import { PromotionalBanner } from './components/PromotionalBanner';
import { MenuSection } from './components/MenuSection';
import { CheckoutView } from './components/CheckoutView';
import { RazorpayModal } from './components/RazorpayModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { StickyCartBar } from './components/StickyCartBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { Check, Phone, MapPin, Clock, Flame, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modals
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('upi');

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (item: MenuItem, size?: string) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((c) => c.item.id === item.id && c.selectedSize === size);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [...prev, { item, quantity: 1, selectedSize: size }];
      }
    });
    showToast(`Added ${item.name} to your Crunch Crate!`);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCartItems((prev) => {
      const copy = [...prev];
      const newQty = copy[index].quantity + delta;
      if (newQty <= 0) {
        copy.splice(index, 1);
      } else {
        copy[index].quantity = newQty;
      }
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    showToast('Item removed from crate.');
  };

  const handleAddUpsell = (upsell: { id: string; name: string; price: number }) => {
    const dummyItem: MenuItem = {
      id: upsell.id,
      name: upsell.name,
      category: 'dips',
      description: 'Add-on extra crunch to order.',
      price: upsell.price,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt2T-BqnNZB-x1I0vpadg9CW38545tXqKMR2vttmPnKh-nLU1_m7lfYV0gnwyLgWgkcP_hyufUJNHOifA6uOTngJKadZ_Ck1qRQWJAJvIU2JNhOfbr9zFDQ3QpMswArRY4rs4xi4Xd9ySTIGOZyJy-ixJtgQfL3sagTd4uMJjCO5XiQbMDuAPMw8p4sqAZ70D2pjj1ATAhz9dMS7VTQYuGy_WNL4ZQF91Z-Z595-jSD2XHyMTM7JusbA',
      isVeg: true,
      rating: 5.0
    };
    handleAddToCart(dummyItem);
  };

  const handleOpenPayment = (method: PaymentMethodType) => {
    setSelectedPaymentMethod(method);
    if (method === 'cash') {
      // Cash on delivery directly places order
      setIsOrderSuccessOpen(true);
    } else {
      setIsRazorpayOpen(true);
    }
  };

  const handlePaymentSuccess = () => {
    setIsRazorpayOpen(false);
    setIsOrderSuccessOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0807] text-[#e5e5e5] flex flex-col selection:bg-amber-500 selection:text-black">
      
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
      />

      {/* Floating Interactive Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-[#1f1a16] border border-amber-500/50 text-white px-4 py-3 rounded-xl shadow-2xl shadow-amber-500/20 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <HeroSection
              onOrderClick={() => {
                setActiveTab('combos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onMenuClick={() => {
                setActiveTab('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <TrustBadges />
            <ComboSection
              combos={COMBO_OFFERS}
              onAddToCart={(item) => handleAddToCart(item)}
              onViewAllClick={() => {
                setActiveTab('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <AboutSection
              onLearnMoreClick={() => {
                setActiveTab('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <PromotionalBanner
              onOrderClick={() => {
                setActiveTab('checkout');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}

        {activeTab === 'menu' && (
          <MenuSection
            onAddToCart={handleAddToCart}
            onCheckoutClick={() => setActiveTab('checkout')}
          />
        )}

        {activeTab === 'combos' && (
          <div className="pt-4">
            <ComboSection
              combos={COMBO_OFFERS}
              onAddToCart={(item) => handleAddToCart(item)}
              onViewAllClick={() => setActiveTab('menu')}
            />
            <PromotionalBanner
              onOrderClick={() => {
                setActiveTab('checkout');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="py-8 sm:py-12">
            <AboutSection onLearnMoreClick={() => setActiveTab('menu')} />
            
            {/* Extended Brand Story & Standards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#14110f] p-6 rounded-xl border border-white/10 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h3 className="font-bebas text-xl text-white uppercase">The 3-Stage Double Crunch</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    We source high-starch Russet potatoes cut to 9mm thickness, blanched at 70°C, snap-chilled, and flash-fried at 180°C right when your order hits our ticket machine.
                  </p>
                </div>

                <div className="bg-[#14110f] p-6 rounded-xl border border-white/10 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bebas text-xl text-white uppercase">Vented Heat Seal Technology</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Soggy fries are the enemy of midnight joy. Our patented micro-perforated boxes allow trapped steam to escape while retaining 95% of cooking heat for 25+ minutes.
                  </p>
                </div>

                <div className="bg-[#14110f] p-6 rounded-xl border border-white/10 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bebas text-xl text-white uppercase">3 AM Nocturnal Operations</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    When the rest of the city powers down, our fryers are glowing hot. Fast dispatch dedicated riders ensure your order drops at your door in under 20 minutes flat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto bg-[#14110f] rounded-2xl p-8 sm:p-12 border border-white/10 shadow-2xl space-y-8">
              <div className="text-center space-y-2">
                <div className="badge-stamp px-4 py-1 text-black font-bebas text-xl inline-block uppercase">
                  NIGHTTIME DISPATCH HUB
                </div>
                <h1 className="font-bebas text-4xl sm:text-6xl text-white uppercase tracking-wide">
                  CONTACT CRUNCH BOX
                </h1>
                <p className="text-neutral-400 text-sm">
                  Got a late night question or catering request? We're active until 3:00 AM daily.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#191513] p-5 rounded-xl border border-white/5 space-y-2">
                  <Phone className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-neutral-400 uppercase block">Direct Phone</span>
                  <a href="tel:+919345122062" className="text-white font-bold text-lg hover:text-amber-400 transition-colors">
                    +91 93451 22062
                  </a>
                  <p className="text-[11px] text-neutral-500">Live order support &amp; inquiries</p>
                </div>

                <div className="bg-[#191513] p-5 rounded-xl border border-white/5 space-y-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-neutral-400 uppercase block">Midnight Shift</span>
                  <span className="text-white font-bold text-lg block">6:00 PM – 3:00 AM</span>
                  <p className="text-[11px] text-neutral-500">Operational Monday through Sunday</p>
                </div>

                <div className="bg-[#191513] p-5 rounded-xl border border-white/5 space-y-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-neutral-400 uppercase block">Kitchen Address</span>
                  <span className="text-white font-semibold text-sm block">
                    Crunch Box Express Hub #04, Neon Boulevard, Sector 9
                  </span>
                  <p className="text-[11px] text-neutral-500">Pickup window available</p>
                </div>

                <div className="bg-[#191513] p-5 rounded-xl border border-white/5 space-y-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-neutral-400 uppercase block">Delivery Aggregators</span>
                  <span className="text-white font-semibold text-sm block">
                    Swiggy: <strong className="text-amber-400">CrunchBox</strong>
                  </span>
                  <span className="text-white font-semibold text-sm block">
                    Zomato: <strong className="text-amber-400">Crunch Box Express</strong>
                  </span>
                </div>
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-8 py-3.5 rounded-lg uppercase tracking-wider text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                >
                  START MIDNIGHT ORDER NOW
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checkout' && (
          <CheckoutView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onAddUpsell={handleAddUpsell}
            onBackToMenu={() => setActiveTab('menu')}
            onOpenPaymentModal={handleOpenPayment}
          />
        )}
      </main>

      {/* Sticky Cart Bar (Shown on browsing pages when cart has items) */}
      {activeTab !== 'checkout' && cartItems.length > 0 && (
        <StickyCartBar
          totalItems={cartCount}
          subtotal={cartSubtotal}
          onViewCrate={() => {
            setActiveTab('checkout');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Mobile Bottom Navigation (Responsive mobile viewport) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
      />

      {/* Global Footer */}
      <Footer onNavClick={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Razorpay Gateway Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={Math.max(0, Math.round(cartSubtotal + cartSubtotal * 0.05 + 20 - (cartSubtotal > 150 ? 50 : 0)))}
        onPaymentSuccess={handlePaymentSuccess}
        defaultMethod={selectedPaymentMethod}
      />

      {/* Order Success & Fryer Tracking Modal */}
      <OrderSuccessModal
        isOpen={isOrderSuccessOpen}
        onClose={() => {
          setIsOrderSuccessOpen(false);
          setActiveTab('home');
        }}
        orderItems={cartItems}
        totalAmount={Math.max(0, Math.round(cartSubtotal + cartSubtotal * 0.05 + 20 - (cartSubtotal > 150 ? 50 : 0)))}
      />

    </div>
  );
}

export default App;
