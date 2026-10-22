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
    expect(getProduct("combo-1")!.variants[0]?.price).toBe(229);
    expect(getProduct("combo-2")!.variants[0]?.price).toBe(329);
    expect(getProduct("combo-3")!.variants[0]?.price).toBe(239);
    expect(getProduct("combo-4")!.variants[0]?.price).toBe(189);
    expect(getProduct("ultimate-savings-box")!.variants[0]?.price).toBe(829);
    expect(getProduct("saving-combo")!.variants[0]?.price).toBe(499);
  });
  it("prices pepsi drinks properly", () => {
    const p = getProduct("pepsi")!;
    expect(findVariant(p, "Regular")?.price).toBe(20);
    expect(findVariant(p, "Medium")?.price).toBe(30);
    expect(findVariant(p, "Large")?.price).toBe(40);
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
