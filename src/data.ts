import { MenuItem } from './types';

export const COMBO_OFFERS: MenuItem[] = [
  {
    id: 'combo-1',
    name: 'Combo 1: Crunch & Sip',
    category: 'combos',
    description: 'French Fries (Small) + Peri Peri Chicken Strips (Medium 4 pcs) + Chilled Pepsi Cup (330ml)',
    price: 259,
    originalPrice: 290,
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1UGei2QhahV9AK2kVc5kVc2Lw3mlG9Nu_VvCBbJkfVBAo73YLagpUzagNlEciKrWIT1ZBD6IQW01c59Sl1jNHYHTpqWJrE6dnDhYo4qT__VUTHNxl7JaXecI1AziOQ2ufeYIYoqIWkcEWnkAJc68VBbPd4_nIrbKp9GXJfda0uWJXJzQdiS2h0yKJiIbAtmNHaiH-e2ws8Y6pC9AWgxVQ_sT2R7s9MEhEnY3M6ZzjL20dokkro9HbxDX-iQ',
    isVeg: false,
    rating: 4.8,
    badge: 'COMBO 1',
    spiceLevel: 'Mild',
    inclusions: [
      'French Fries (Small, Salted or Peri-Peri)',
      'Peri Peri Chicken Strips (Medium 4 pcs)',
      'Chilled Pepsi Cup (330ml)'
    ]
  },
  {
    id: 'combo-2',
    name: 'Combo 2: Peri-Peri Feast',
    category: 'combos',
    description: 'Double Medium Peri-Peri Fries + Large Peri Peri Chicken Strips (7 pcs) + Chilled Pepsi (500ml) + Garlic Dip',
    price: 389,
    originalPrice: 440,
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1W2_76WruQxgi0kSt8kOqeph_HtW-9xBC5t2WKrAzpjSsYzkx69wZ6HBwSJ8k6KvDqXh_Z7MuVaRPEsG8js1yMxN_KT5DYMYwi9ERW8KMbfw_DTlJvWCSTpNgB5KMKnsRJa0MIuM0_4Yy0WwElKXGj4wLAT650Gh1o_uy3BDLqD9vSiyz_kACNoRnsJCz62sAAcgNCT_G5xbyBi_SPDAPUxYK5Q4kbJyOefQ7Zxrw11sR9i8uTryQDepo3H',
    isVeg: false,
    rating: 5.0,
    badge: 'POPULAR',
    spiceLevel: 'Hot Peri',
    inclusions: [
      'French Fries (Medium)',
      'Peri Peri Chicken Strips (Large 7 pcs)',
      'Chilled Pepsi + Garlic Dip'
    ]
  },
  {
    id: 'combo-3',
    name: 'Combo 3: Signature Loaded Box',
    category: 'combos',
    description: 'Single Layer Cheesy Chicken Loaded Fries + Peri Peri Strips (Small 3 pcs) + Chilled Pepsi (300ml)',
    price: 249,
    originalPrice: 280,
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1XZFt8hc8I07_D9ywOvIzcAEAqkkbxIDxA-hkTeLguHjuGgRN_3zD790fTk2CFwXwMHPNJoMqfU3Ey5MyZEmdwSyVO0ISScGTCKaj4ba2OtedcRLArPQExkEB6cMLMDBDzzGkMZcSnGHmXgrN3TSKTsuZswueHn4A5yeKgmyUP-yvMPQXhY147rFT9w3u9pY9KV85WgWCLbU48dNsemMEjgEvkNiFLQF25mY9Z1pU_XFfPedK2QQsSi3l8',
    isVeg: false,
    rating: 4.9,
    badge: 'COMBO 3',
    spiceLevel: 'Mild',
    inclusions: [
      'Single Layer Loaded Fries (Small)',
      'Peri Peri Strips (Small 3 pcs)',
      'Chilled Pepsi'
    ]
  }
];

export const SIGNATURE_LOADED: MenuItem[] = [
  {
    id: 'loaded-1',
    name: 'Cheese Lava Loaded',
    category: 'loaded',
    description: 'Crispy golden fries drenched in double melted aged cheddar, diced pickled jalapeños & herb dusting.',
    price: 189,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt2T-BqnNZB-x1I0vpadg9CW38545tXqKMR2vttmPnKh-nLU1_m7lfYV0gnwyLgWgkcP_hyufUJNHOifA6uOTngJKadZ_Ck1qRQWJAJvIU2JNhOfbr9zFDQ3QpMswArRY4rs4xi4Xd9ySTIGOZyJy-ixJtgQfL3sagTd4uMJjCO5XiQbMDuAPMw8p4sqAZ70D2pjj1ATAhz9dMS7VTQYuGy_WNL4ZQF91Z-Z595-jSD2XHyMTM7JusbA',
    isVeg: true,
    rating: 4.9,
    spiceLevel: 'Mild',
    badge: 'CRAVING FAVORITE'
  },
  {
    id: 'loaded-2',
    name: 'Fiery Peri Chicken Fries',
    category: 'loaded',
    description: 'Crispy fries topped with shredded peri-peri chicken tenders, ghost-garlic mayo & fresh herbs.',
    price: 229,
    originalPrice: 250,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL64YpFFRSdeAootc2GAIRkL-llqgILZjP2iC6L8ajRQvJsL082OTBgakmAcRXmyWr5dDSne-6TqnbPUypSPwNvLamZFJdXy6KZYCEDq2MrQ5Fc2XkYka-Pkj7qwvuS0PqBxnBfDfKj9_D4WwXjixDbWXzverpBUoKj7BAHo3XeLULBR-_snCDuUarxRoUdtteD_eOvXu9K5F21f5aQd8faqdAeZQjCzIo037kPsAU_tfY_GaDP6UWqw',
    isVeg: false,
    rating: 5.0,
    spiceLevel: 'Hot Peri',
    badge: 'HOTTEST SELLER'
  },
  {
    id: 'loaded-3',
    name: 'Smoky BBQ Bacon Fries',
    category: 'loaded',
    description: 'Crispy fries glazed with midnight bourbon BBQ, loaded smoked bacon crumbles & scallions.',
    price: 249,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDZ81-qWJeYrb-XRHoXPtH6KulFRvL0txEyeqhvKCvYRmXkbqDqvLaEL8NFibZb45Euv40uZc-Nbpogka6LPpYyKKRW58nMryX7W0LCsIMAr4oe4x0yI5jalkxO9fDGO5dLCCLir2O5YLaM6zQbcOTdTDL2i38eRAQa7viT3-ak8da9i2eA6eeLRP1J2VIfJqD8oX-pOiZhUq-SyY3g6JHMm_gapkG9uwREpC4GV8yn0n04kFc9pMw9g',
    isVeg: false,
    rating: 4.8,
    spiceLevel: 'Mild',
    badge: 'SMOKED'
  },
  {
    id: 'loaded-4',
    name: 'Truffle Parm Crunch Box',
    category: 'loaded',
    description: 'Infused white truffle oil, heavy aged Parmesan shavings, cracked roasted black pepper & parsley.',
    price: 219,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAN0NLXUrwkFn7Yu_pitA5yrl-MSmKn7i85KYI5XgmTLth81sGOQ0LC6Z4mFnX4Qcqk2UmNbUG29rktdvia2GAqKLvXDbWLgY90ntSxwWf-dP1TYf6FFcuwNWZpSSbIVXtFO3xrURuKgQOp4LBHdXC1GSoWPYUKCgibv5JyLC70ZBByvIh3-eIb5ktCtaRJAGfCuhxuVBVtBtM2jf51EJxSK4zekNNzDvLn09ep_6rpFpHTfyU4qME1A',
    isVeg: true,
    rating: 4.9,
    spiceLevel: 'None',
    badge: 'GOURMET'
  }
];

export const CLASSIC_FRIES: MenuItem[] = [
  {
    id: 'fries-1',
    name: 'Classic Salted Crisp',
    category: 'fries',
    description: 'Pure sea salt, golden potato cuts fried extra crisp. Simple, addictive, always boiling hot.',
    price: 99,
    originalPrice: 120,
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1XW3CDn2HUPsdo-fNJ9gX73DR32kA3fww9ZpOBcs-wTR4QvhcabU6i1MFToelWrERheEXb6mtAjq77oGqQAd5wDDs7GY62_auqikURekPMn55VvBf1uVHtPuThn1aynpUWx5l-yGx-v5DnrPALQT0mCpTaHF750UoKiWU3alIdN1O9L8TRxU8DFwHKBo4zY6JwrvahRb2KSraslR6fB5DAtlVbau_EL8jALtXQMvM1Ge9itKH64LfqUIJM',
    isVeg: true,
    rating: 4.7,
    sizeOptions: [
      { label: 'Regular', price: 99 },
      { label: 'Large', price: 149 }
    ]
  },
  {
    id: 'fries-2',
    name: 'Spicy Peri-Peri Dusted',
    category: 'fries',
    description: 'Freshly fried fries shaken vigorously in our African bird’s eye chili blend and citrus salt.',
    price: 119,
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1VsuiBe-m8CRKfQPt00vyQTj4Z3O_CnsgTyKMYDmX2td-0KfoMu9BfekANXnCfQnqJl-uGBeez-T7dQargSUBWpoy4SYBhsJ_h_fSE6LDWEah6CrWUCTk-BklaClFhDs_b2OqpxL5CY0ua_N39Z8n9avdcsg8rmHNAYdl0pKwhAT1TGRMEvlkpD9NhLM2R-1dwMvjZhX4rgA6c7N6WJlQ08wCFzjUwGMWixFX-fc1joiT8CDi40JygXhBKv',
    isVeg: true,
    rating: 4.9,
    spiceLevel: 'Hot Peri',
    badge: 'SIGNATURE DUST',
    sizeOptions: [
      { label: 'Regular', price: 119 },
      { label: 'Large', price: 169 }
    ]
  },
  {
    id: 'fries-3',
    name: 'Garlic Herb Crinkle Cuts',
    category: 'fries',
    description: 'Wavy ridge cuts holding onto roasted minced garlic, rosemary dust, and smoked sea salt.',
    price: 129,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt2T-BqnNZB-x1I0vpadg9CW38545tXqKMR2vttmPnKh-nLU1_m7lfYV0gnwyLgWgkcP_hyufUJNHOifA6uOTngJKadZ_Ck1qRQWJAJvIU2JNhOfbr9zFDQ3QpMswArRY4rs4xi4Xd9ySTIGOZyJy-ixJtgQfL3sagTd4uMJjCO5XiQbMDuAPMw8p4sqAZ70D2pjj1ATAhz9dMS7VTQYuGy_WNL4ZQF91Z-Z595-jSD2XHyMTM7JusbA',
    isVeg: true,
    rating: 4.8,
    badge: 'CRINKLE SHAPE',
    sizeOptions: [
      { label: 'Single Size', price: 129 }
    ]
  }
];

export const DIPS_AND_SIPS: MenuItem[] = [
  {
    id: 'dip-1',
    name: 'Zesty Garlic Mayo',
    category: 'dips',
    description: 'Slow-roasted garlic with whipped creamy mayo.',
    price: 30,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqAEkh9rsAKB-lXksVO06Auj3l13dje-xRP041QM6EMGNZa1qW-xBGBm9GTkxyz1mOLIRnSRS1qWiXHCuRwbmpNjdMK2142WApyrlEMl9QfNY30ifFTyO6mf0x9Hz-U7jdBjJRk1H-U-x2y3NESLDv2N9NDPhXNpvjTmiM0X7eH-0hpj6ZiiX5l14r0UdAP0dfrqIoB3xXa0asPV3CzT8cl56EyS7-xEIRNfyVSryAP31bZ6v1n-lkUQ',
    isVeg: true,
    rating: 4.8
  },
  {
    id: 'dip-2',
    name: 'Spicy Melted Cheese',
    category: 'dips',
    description: 'Warm liquid cheddar infused with ghost pepper flakes.',
    price: 35,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt2T-BqnNZB-x1I0vpadg9CW38545tXqKMR2vttmPnKh-nLU1_m7lfYV0gnwyLgWgkcP_hyufUJNHOifA6uOTngJKadZ_Ck1qRQWJAJvIU2JNhOfbr9zFDQ3QpMswArRY4rs4xi4Xd9ySTIGOZyJy-ixJtgQfL3sagTd4uMJjCO5XiQbMDuAPMw8p4sqAZ70D2pjj1ATAhz9dMS7VTQYuGy_WNL4ZQF91Z-Z595-jSD2XHyMTM7JusbA',
    isVeg: true,
    rating: 4.9,
    spiceLevel: 'Hot Peri'
  },
  {
    id: 'sip-1',
    name: 'Chilled Pepsi 500ml',
    category: 'dips',
    description: 'Ice cold pet bottle, refreshingly fizzy.',
    price: 40,
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1UGei2QhahV9AK2kVc5kVc2Lw3mlG9Nu_VvCBbJkfVBAo73YLagpUzagNlEciKrWIT1ZBD6IQW01c59Sl1jNHYHTpqWJrE6dnDhYo4qT__VUTHNxl7JaXecI1AziOQ2ufeYIYoqIWkcEWnkAJc68VBbPd4_nIrbKp9GXJfda0uWJXJzQdiS2h0yKJiIbAtmNHaiH-e2ws8Y6pC9AWgxVQ_sT2R7s9MEhEnY3M6ZzjL20dokkro9HbxDX-iQ',
    isVeg: true,
    rating: 4.9
  },
  {
    id: 'sip-2',
    name: 'Mineral Spring Water',
    category: 'dips',
    description: 'Chilled 500ml purified drinking water.',
    price: 20,
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1XW3CDn2HUPsdo-fNJ9gX73DR32kA3fww9ZpOBcs-wTR4QvhcabU6i1MFToelWrERheEXb6mtAjq77oGqQAd5wDDs7GY62_auqikURekPMn55VvBf1uVHtPuThn1aynpUWx5l-yGx-v5DnrPALQT0mCpTaHF750UoKiWU3alIdN1O9L8TRxU8DFwHKBo4zY6JwrvahRb2KSraslR6fB5DAtlVbau_EL8jALtXQMvM1Ge9itKH64LfqUIJM',
    isVeg: true,
    rating: 4.8
  }
];

export const ALL_MENU_ITEMS = [
  ...SIGNATURE_LOADED,
  ...COMBO_OFFERS,
  ...CLASSIC_FRIES,
  ...DIPS_AND_SIPS
];

export const UPSELL_ITEMS = [
  { id: 'up-1', name: 'Cheddar Bomb', price: 45, desc: 'Double shot warm molten cheese dip.' },
  { id: 'up-2', name: 'Chilled Pepsi', price: 40, desc: 'Ice-cold 400ml can with straw.' },
  { id: 'up-3', name: 'Crispy Rings', price: 89, desc: '6 beer-battered crunchy onion rings.' }
];

export const INITIAL_CART_ITEMS = [
  {
    item: SIGNATURE_LOADED[1], // Fiery Peri Chicken Fries
    quantity: 1,
    selectedSize: 'Large',
    customizations: ['Extra Melted Aged Cheddar (+₹30)', 'Smoked Jalapeño Dip (+₹25)']
  },
  {
    item: COMBO_OFFERS[1], // Combo 2: Peri-Peri Feast
    quantity: 1,
    customizations: ['Double crunch + Lime Fizz']
  },
  {
    item: DIPS_AND_SIPS[0], // Zesty Garlic Mayo
    quantity: 1,
    customizations: ['Freshly whipped 60ml']
  }
];
