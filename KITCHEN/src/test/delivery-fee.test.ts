import { afterEach, expect, it, vi } from "vitest";
import { createMockOrderService } from "@/kitchen/services/mock/mockOrderService";

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

it("applies the owner's saved fee to new demo orders without changing previous orders", async () => {
  vi.useFakeTimers();
  const service = createMockOrderService();
  const previousPromise = service.listOrderHistory({});
  await vi.advanceTimersByTimeAsync(250);
  const previous = await previousPromise;
  const update = service.updateSettings({ deliveryFee: 75 });
  await vi.advanceTimersByTimeAsync(300);
  expect((await update).deliveryFee).toBe(75);
  const created: number[] = [];
  const off = service.subscribe((e) => {
    if (e.type === "order_created") {
      created.push(e.order.deliveryFee);
      expect(e.order.total).toBe(e.order.subtotal + 75);
    }
  });
  await vi.advanceTimersByTimeAsync(75000);
  expect(created).toEqual([75]);
  const afterPromise = service.listOrderHistory({});
  await vi.advanceTimersByTimeAsync(250);
  const after = await afterPromise;
  expect(after.find((order) => order.id === previous[0]?.id)?.total).toBe(previous[0]?.total);
  off();
});
