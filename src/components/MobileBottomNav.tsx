import React from 'react';
import { ViewTab } from '../types';
import { Home, UtensilsCrossed, Flame, ShoppingBag, PhoneCall } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  cartCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
}) => {
  const tabs: { label: string; tab: ViewTab; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Home', tab: 'home', icon: Home },
    { label: 'Menu', tab: 'menu', icon: UtensilsCrossed },
    { label: 'Combos', tab: 'combos', icon: Flame },
    { label: 'Crate', tab: 'checkout', icon: ShoppingBag },
    { label: 'Contact', tab: 'contact', icon: PhoneCall },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0a09]/95 backdrop-blur-md border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => {
              setActiveTab(item.tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`cursor-pointer flex flex-col items-center justify-center w-14 py-1 relative transition-colors ${
              isActive ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              {item.tab === 'checkout' && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 uppercase tracking-wider font-semibold">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
