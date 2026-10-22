import fries from "@/assets/images/fries.webp";
import loaded from "@/assets/images/loaded.webp";
import popcorn from "@/assets/images/popcorn.webp";
import strips from "@/assets/images/strips.webp";
import lollipop from "@/assets/images/lollipop.webp";
import lays from "@/assets/images/lays.webp";
import ricebowl from "@/assets/images/ricebowl.webp";
import chickenbox from "@/assets/images/chickenbox.webp";
import cola from "@/assets/images/cola.webp";

export type CategoryId = "fries" | "loaded" | "chicken" | "rice" | "combos" | "drinks";

export const categories: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "All Menu" },
  { id: "fries", label: "French Fries" },
  { id: "loaded", label: "Loaded Fries" },
  { id: "chicken", label: "Chicken & Beef" },
  { id: "rice", label: "Rice Bowls" },
  { id: "combos", label: "Combos" },
  { id: "drinks", label: "Drinks" },
];

export type Variant = {
  id: string;
  size: string;
  seasoning?: string | undefined;
  price: number | null;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  image: string;
  variants: Variant[];
  includes?: string[];
  popular?: boolean;
};

const v = (size: string, price: number | null, seasoning?: string): Variant => ({
  id: `${size}${seasoning ? "-" + seasoning : ""}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  size,
  seasoning,
  price,
});

export const products: Product[] = [
  {
    id: "french-fries",
    name: "French Fries",
    category: "fries",
    popular: true,
    image: fries,
    description: "Crispy golden fries, perfectly salted or tossed with peri peri.",
    variants: [
      v("Regular", 59, "Normal"),
      v("Regular", 69, "Peri Peri"),
      v("Medium", 89, "Normal"),
      v("Medium", 99, "Peri Peri"),
      v("Large", 119, "Normal"),
      v("Large", 129, "Peri Peri"),
    ],
  },
  {
    id: "loaded-fries",
    name: "Veg Loaded Fries",
    category: "loaded",
    image: loaded,
    description: "Crispy fries loaded with cheese and savory veg toppings (Single Layer).",
    variants: [v("Regular", 79), v("Medium", 99), v("Large", 149)],
  },
  {
    id: "chicken-loaded-fries",
    name: "Chicken Loaded Fries",
    category: "loaded",
    popular: true,
    image: loaded,
    description: "Fries topped with juicy seasoned chicken and signature sauces.",
    variants: [
      v("Single Layer Regular", 99),
      v("Single Layer Medium", 139),
      v("Single Layer Large", 179),
      v("Double Layer Regular", 139),
      v("Double Layer Medium", 179),
      v("Double Layer Large", 199),
    ],
  },
  {
    id: "beef-loaded-fries",
    name: "Beef Loaded Fries",
    category: "loaded",
    popular: true,
    image: loaded,
    description: "Loaded fries topped with savory spiced beef and melted cheese.",
    variants: [
      v("Single Layer Regular", 109),
      v("Single Layer Medium", 149),
      v("Single Layer Large", 189),
      v("Double Layer Regular", 149),
      v("Double Layer Medium", 189),
      v("Double Layer Large", 209),
    ],
  },
  {
    id: "popcorn-chicken",
    name: "Chicken Popcorn",
    category: "chicken",
    popular: true,
    image: popcorn,
    description: "Bite-sized crunchy chicken bites fried to golden perfection.",
    variants: [v("Regular", 69), v("Medium", 99), v("Large", 149)],
  },
  {
    id: "beef-popcorn",
    name: "Beef Popcorn",
    category: "chicken",
    popular: true,
    image: popcorn,
    description: "Tender, spiced beef popcorn bites coated in a crispy golden batter.",
    variants: [v("Regular", 79), v("Medium", 119), v("Large", 159)],
  },
  {
    id: "lays-chicken",
    name: "Lays Chicken",
    category: "chicken",
    popular: true,
    image: lays,
    description: "Crispy chicken with a chips crunch.",
    variants: [v("Medium", 69), v("Large", 89)],
  },
  {
    id: "lollipop",
    name: "Chicken Lollipop",
    category: "chicken",
    image: lollipop,
    description: "Juicy fried chicken lollipops.",
    variants: [v("3 Pieces", 99), v("5 Pieces", 179)],
  },
  {
    id: "chicken-strips",
    name: "Chicken Strips",
    category: "chicken",
    popular: true,
    image: strips,
    description: "Peri peri crusted tender strips.",
    variants: [v("5 Pieces", 149), v("8 Pieces", 209), v("13 Pieces", 349)],
  },
  {
    id: "rice-chicken",
    name: "Rice Bowl (Chicken)",
    category: "rice",
    popular: true,
    image: ricebowl,
    description: "Fluffy rice paired with juicy crispy chicken.",
    variants: [v("Regular", 79), v("Medium", 99), v("Large", 119)],
  },
  {
    id: "rice-beef",
    name: "Rice Bowl (Beef)",
    category: "rice",
    popular: true,
    image: ricebowl,
    description: "Aromatic spiced rice layered with tender savory beef.",
    variants: [v("Regular", 89), v("Medium", 109), v("Large", 129)],
  },
  {
    id: "pepsi",
    name: "Pepsi",
    category: "drinks",
    image: cola,
    description: "Ice-cold refreshing Pepsi cola.",
    variants: [v("Regular", 20), v("Medium", 30), v("Large", 40)],
  },
  {
    id: "combo-1",
    name: "Combo 1",
    category: "combos",
    image: strips,
    popular: true,
    description: "5pc Strips + Regular French Fries + Pepsi Small",
    includes: ["5pc Chicken Strips", "Regular French Fries", "Pepsi (Small)"],
    variants: [v("Combo", 229)],
  },
  {
    id: "combo-2",
    name: "Combo 2",
    category: "combos",
    image: strips,
    popular: true,
    description: "8pc Strips + French Fries Medium + Medium Pepsi",
    includes: ["8pc Chicken Strips", "Medium French Fries", "Medium Pepsi"],
    variants: [v("Combo", 329)],
  },
  {
    id: "combo-3",
    name: "Combo 3",
    category: "combos",
    image: loaded,
    popular: true,
    description: "Loaded Fries Regular + 3pc Strips + Regular Pepsi",
    includes: ["Loaded Fries Regular", "3pc Chicken Strips", "Regular Pepsi"],
    variants: [v("Combo", 239)],
  },
  {
    id: "combo-4",
    name: "Combo 4",
    category: "combos",
    image: ricebowl,
    popular: true,
    description: "Medium Rice Bowl + Chicken/Beef Popcorn Regular + Regular Pepsi",
    includes: ["Medium Rice Bowl", "Chicken/Beef Popcorn Regular", "Regular Pepsi"],
    variants: [v("Combo", 189)],
  },
  {
    id: "chicken-box",
    name: "7 Piece Chicken Box",
    category: "chicken",
    image: chickenbox,
    description: "Lollipop 1, Strips 2, Wings 2, Leg 1, Chest 1.",
    variants: [v("7 Pieces", 399)],
  },
  {
    id: "ultimate-savings-box",
    name: "Ultimate Savings Box",
    category: "combos",
    image: chickenbox,
    description: "Feast for the whole gang.",
    includes: ["7-piece chicken box × 2", "Medium French fries × 1", "Small Pepsi × 2"],
    variants: [v("Box", 829)],
  },
  {
    id: "saving-combo",
    name: "Saving Combo",
    category: "combos",
    image: chickenbox,
    description: "Chicken box meal for one.",
    includes: ["7-piece chicken box × 1", "Regular French fries × 1", "Pepsi × 1"],
    variants: [v("Combo", 499)],
  },
];

export const specialCombos = ["combo-1", "combo-2", "combo-3", "combo-4"];
export const savingsBoxes = ["ultimate-savings-box", "saving-combo"];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export function minPrice(p: Product): number | null {
  const prices = p.variants.map((x) => x.price).filter((x): x is number => x != null);
  return prices.length ? Math.min(...prices) : null;
}

export function findVariant(p: Product, size: string, seasoning?: string) {
  return p.variants.find(
    (x) => x.size === size && (x.seasoning ?? undefined) === (seasoning ?? undefined),
  );
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
