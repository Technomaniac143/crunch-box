import fries from "@/assets/images/fries.jpg";
import loaded from "@/assets/images/loaded.jpg";
import popcorn from "@/assets/images/popcorn.jpg";
import strips from "@/assets/images/strips.jpg";
import lollipop from "@/assets/images/lollipop.jpg";
import lays from "@/assets/images/lays.jpg";
import ricebowl from "@/assets/images/ricebowl.jpg";
import chickenbox from "@/assets/images/chickenbox.jpg";
import cola from "@/assets/images/cola.jpg";

export type CategoryId = "fries" | "loaded" | "chicken" | "rice" | "combos" | "drinks";

export const categories: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "All Menu" },
  { id: "fries", label: "French Fries" },
  { id: "loaded", label: "Loaded Fries" },
  { id: "chicken", label: "Chicken" },
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

const layers = [
  v("Single Layer Medium", 129),
  v("Single Layer Large", 189),
  v("Double Layer Medium", 199),
  v("Double Layer Large", 249),
];

export const products: Product[] = [
  {
    id: "french-fries",
    name: "French Fries",
    category: "fries",
    popular: true,
    image: fries,
    description: "Crispy golden fries, perfectly seasoned.",
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
    name: "Loaded Fries",
    category: "loaded",
    image: loaded,
    description: "Fries piled high with cheese and sauces.",
    variants: layers,
  },
  {
    id: "chicken-loaded-fries",
    name: "Chicken Loaded Fries",
    category: "loaded",
    popular: true,
    image: loaded,
    description: "Fries topped with juicy chicken & sauces.",
    variants: layers,
  },
  {
    id: "beef-loaded-fries",
    name: "Beef Loaded Fries",
    category: "loaded",
    image: loaded,
    description: "Loaded fries topped with savoury beef.",
    variants: [v("Single Layer Medium", 159), v("Single Layer Large", 199)],
  },
  {
    id: "popcorn-chicken",
    name: "Popcorn Chicken",
    category: "chicken",
    popular: true,
    image: popcorn,
    description: "Bite-sized crunchy chicken pops.",
    variants: [v("Small", 59), v("Regular", 99), v("Medium", 149), v("Large", 199)],
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
    name: "Lollipop",
    category: "chicken",
    image: lollipop,
    description: "Juicy fried chicken lollipops.",
    variants: [v("3 Pieces", 149), v("5 Pieces", 229)],
  },
  {
    id: "chicken-strips",
    name: "Chicken Strips",
    category: "chicken",
    popular: true,
    image: strips,
    description: "Peri peri crusted tender strips.",
    variants: [v("5 Pieces", 139), v("8 Pieces", 199), v("13 Pieces", 299)],
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
    id: "rice-chicken-medium",
    name: "Rice Bowl Chicken",
    category: "rice",
    popular: true,
    image: ricebowl,
    description: "Fluffy rice with crispy chicken.",
    variants: [v("Medium", 149), v("Large", 249)],
  },
  {
    id: "rice-leg",
    name: "Leg Piece Rice Bowl",
    category: "rice",
    image: ricebowl,
    description: "Rice bowl with a fried leg piece.",
    variants: [v("Regular", 159)],
  },
  {
    id: "rice-leg-popcorn",
    name: "Leg + Popcorn Chicken Rice Bowl",
    category: "rice",
    image: ricebowl,
    description: "Leg piece and popcorn chicken on rice.",
    variants: [v("Regular", 269)],
  },
  {
    id: "rice-medium-pepsi",
    name: "Rice Bowl Chicken Medium + Pepsi",
    category: "rice",
    image: ricebowl,
    description: "Medium chicken rice bowl with Pepsi.",
    variants: [v("Regular", 169)],
  },
  {
    id: "rice-medium-fries-pepsi",
    name: "Rice Bowl Chicken Medium + Regular Fries + Pepsi",
    category: "rice",
    image: ricebowl,
    description: "The full rice bowl meal.",
    variants: [v("Regular", 229)],
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
  {
    id: "combo-1",
    name: "Combo 1",
    category: "combos",
    image: strips,
    description: "Strips, fries & Pepsi.",
    includes: ["French Fries (Small)", "Peri Peri Chicken Strips (Medium)", "Pepsi"],
    variants: [v("Combo", 259)],
  },
  {
    id: "combo-2",
    name: "Combo 2",
    category: "combos",
    image: strips,
    description: "Bigger strips, bigger fries.",
    includes: ["French Fries (Medium)", "Peri Peri Chicken Strips (Large)", "Pepsi"],
    variants: [v("Combo", 389)],
  },
  {
    id: "combo-3",
    name: "Combo 3",
    category: "combos",
    image: loaded,
    description: "Loaded fries meets strips.",
    includes: ["Single Layer Chicken Loaded Fries (Small)", "Peri Peri Strips (Small)", "Pepsi"],
    variants: [v("Combo", 249)],
  },
  {
    id: "pepsi",
    name: "Pepsi",
    category: "drinks",
    image: cola,
    description: "Ice-cold cola. Ask in store for sizes.",
    variants: [v("Small", null), v("Regular", null)],
  },
];

export const specialCombos = ["combo-1", "combo-2", "combo-3"];
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
