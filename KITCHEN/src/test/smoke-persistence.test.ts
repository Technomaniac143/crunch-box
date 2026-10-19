import { describe, expect, it } from "vitest";
import { createProductionOrderService } from "@/kitchen/services/cloud/supabaseOrderService";
import { kolkataDateKey } from "@/kitchen/domain/rules";

describe("Smoke Test: Order Persistence & Refresh Behavior", () => {
  const service = createProductionOrderService();

  it("loads persistent orders from shared-orders.json without disappearing", async () => {
    const active = await service.listActiveOrders();
    expect(Array.isArray(active)).toBe(true);
    expect(active.length).toBeGreaterThan(0);

    // Verify order fields are populated correctly
    const first = active[0]!;
    expect(first.id).toBeDefined();
    expect(first.orderNumber).toMatch(/^CB-\d+$/);
    expect(first.status).toBeDefined();
    expect(first.items.length).toBeGreaterThan(0);
    expect(first.total).toBeGreaterThan(0);
    expect(first.history.length).toBeGreaterThan(0);
  });

  it("retains completed and delivered orders in active queue so tabs don't lose history on refresh", async () => {
    const orders = await service.listActiveOrders();
    const delivered = orders.filter((o) => o.status === "delivered");
    expect(delivered.length).toBeGreaterThan(0);

    // Simulate page refresh: calling listActiveOrders again
    const refreshed = await service.listActiveOrders();
    const refreshedDelivered = refreshed.filter((o) => o.status === "delivered");
    expect(refreshedDelivered.length).toBe(delivered.length);
  });

  it("returns full history via listOrderHistory with flexible date and search filtering", async () => {
    const allHistory = await service.listOrderHistory({});
    expect(allHistory.length).toBeGreaterThan(0);

    // Search by specific order number
    const target = allHistory[0]!;
    const searchedByNum = await service.listOrderHistory({ search: target.orderNumber });
    expect(searchedByNum.some((o) => o.id === target.id)).toBe(true);

    // Search by customer phone
    const searchedByPhone = await service.listOrderHistory({ search: target.customerPhone });
    expect(searchedByPhone.some((o) => o.id === target.id)).toBe(true);

    // Query for target order's date
    const targetDate = kolkataDateKey(target.createdAt);
    const dateHistory = await service.listOrderHistory({ date: targetDate });
    expect(dateHistory.length).toBeGreaterThan(0);
  });

  it("getOrder returns the exact order matching by ID or orderNumber", async () => {
    const list = await service.listActiveOrders();
    const sample = list[0]!;

    const byId = await service.getOrder(sample.id);
    expect(byId).not.toBeNull();
    expect(byId?.orderNumber).toBe(sample.orderNumber);

    const byNumber = await service.getOrder(sample.orderNumber);
    expect(byNumber).not.toBeNull();
    expect(byNumber?.id).toBe(sample.id);
  });
});
