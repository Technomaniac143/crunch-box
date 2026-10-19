import { describe, expect, it } from "vitest";
import {
  canTransition,
  orderTotal,
  DELIVERY_FEE,
  validateDeliveryFee,
} from "@/kitchen/domain/rules";

describe("kitchen rules", () => {
  it("defaults to ₹50 but supports an owner-selected fee", () => {
    expect(DELIVERY_FEE).toBe(50);
    expect(orderTotal(199)).toBe(249);
    expect(orderTotal(199, 75)).toBe(274);
  });
  it("accepts free delivery and rejects invalid fee amounts", () => {
    expect(() => validateDeliveryFee(0)).not.toThrow();
    expect(() => validateDeliveryFee(75.5)).not.toThrow();
    for (const fee of [-1, NaN, Infinity, 1.001]) expect(() => validateDeliveryFee(fee)).toThrow();
  });
  it("follows new → ready_for_pickup (auto prepared) → delivered", () => {
    expect(canTransition("new", "ready_for_pickup")).toBe(true);
    expect(canTransition("ready_for_pickup", "delivered")).toBe(true);
    expect(canTransition("picked_up", "delivered")).toBe(true);
  });
  it("blocks skipping steps or moving finished orders", () => {
    expect(canTransition("new", "delivered")).toBe(false);
    expect(canTransition("delivered", "new")).toBe(false);
  });
});
