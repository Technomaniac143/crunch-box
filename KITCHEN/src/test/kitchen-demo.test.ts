import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockOrderService } from "@/kitchen/services/mock/mockOrderService";

describe("kitchen demo controls", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("clears every sample order and stops incoming demo orders", async () => {
    const service = createMockOrderService();
    const events = vi.fn();
    const off = service.subscribe(events);
    await service.setDemoEnabled(false);
    await vi.advanceTimersByTimeAsync(150000);
    const active = service.listActiveOrders();
    const history = service.listOrderHistory({});
    await vi.advanceTimersByTimeAsync(300);
    expect(await active).toEqual([]);
    expect(await history).toEqual([]);
    expect(events.mock.calls.map(([e]) => e.type)).toEqual(["orders_reset"]);
    expect(service.demoEnabled).toBe(false);
    off();
  });

  it("starts demo again with sample orders and simulated arrivals", async () => {
    const service = createMockOrderService();
    await service.setDemoEnabled(false);
    const events = vi.fn();
    const off = service.subscribe(events);
    await service.setDemoEnabled(true);
    const history = service.listOrderHistory({});
    await vi.advanceTimersByTimeAsync(300);
    expect((await history).length).toBe(15);
    await vi.advanceTimersByTimeAsync(75000);
    expect(events.mock.calls.filter(([e]) => e.type === "order_created")).toHaveLength(1);
    off();
  });

  it("keeps demo cleared after a fresh service is created", async () => {
    await createMockOrderService().setDemoEnabled(false);
    const fresh = createMockOrderService();
    fresh.initializeDemoMode();
    const history = fresh.listOrderHistory({});
    await vi.advanceTimersByTimeAsync(300);
    expect(await history).toEqual([]);
    expect(fresh.demoEnabled).toBe(false);
  });

  it("preserves settings while clearing demo orders", async () => {
    const service = createMockOrderService();
    const update = service.updateSettings({
      acceptingOrders: false,
      openingTime: "19:00",
      soundEnabled: false,
    });
    await vi.advanceTimersByTimeAsync(300);
    const before = await update;
    await service.setDemoEnabled(false);
    const settings = service.getSettings();
    await vi.advanceTimersByTimeAsync(150);
    expect(await settings).toEqual(before);
  });
});
