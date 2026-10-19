import { describe, expect, it } from "vitest";
import { findVariant, getProduct } from "@/data/menu";
import { addToItems, cartSubtotal } from "@/lib/cart";

describe("menu pricing", () => {
  it("prices fries by size and seasoning", () => {
    const f = getProduct("french-fries")!;
    expect(findVariant(f, "Regular", "Normal")?.price).toBe(59);
    expect(findVariant(f, "Regular", "Peri Peri")?.price).toBe(69);
    expect(findVariant(f, "Large", "Peri Peri")?.price).toBe(129);
  });
  it("keeps combo and savings box prices", () => {
    expect(getProduct("combo-1")!.variants[0]?.price).toBe(259);
    expect(getProduct("combo-2")!.variants[0]?.price).toBe(389);
    expect(getProduct("combo-3")!.variants[0]?.price).toBe(249);
    expect(getProduct("ultimate-savings-box")!.variants[0]?.price).toBe(829);
    expect(getProduct("saving-combo")!.variants[0]?.price).toBe(499);
  });
  it("does not invent drink prices", () => {
    expect(getProduct("pepsi")!.variants.every((v) => v.price === null)).toBe(true);
  });
  it("merges same items and totals the cart", () => {
    const base = { key: "a", productId: "x", name: "X", variant: "M", price: 89, image: "" };
    let items = addToItems([], base, 2);
    items = addToItems(items, base, 1);
    items = addToItems(items, { ...base, key: "b", price: 129 }, 1);
    expect(items).toHaveLength(2);
    expect(cartSubtotal(items)).toBe(89 * 3 + 129);
  });
});
