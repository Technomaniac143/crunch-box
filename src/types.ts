export interface MenuItem {
  id: string;
  name: string;
  category: 'loaded' | 'fries' | 'combos' | 'dips';
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  isVeg: boolean;
  rating: number;
  reviewCount?: number;
  spiceLevel?: 'None' | 'Mild' | 'Hot Peri' | 'Ghost Fire';
  badge?: string;
  inclusions?: string[];
  sizeOptions?: { label: string; price: number }[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedSize?: string;
  customizations?: string[];
}

export type ViewTab = 'home' | 'menu' | 'combos' | 'about' | 'contact' | 'checkout';

export type FulfillmentType = 'delivery' | 'pickup';

export type PaymentMethodType = 'upi' | 'cards' | 'netbanking' | 'wallets' | 'paylater' | 'cash';
