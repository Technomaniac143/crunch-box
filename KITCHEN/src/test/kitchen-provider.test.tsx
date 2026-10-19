import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { KitchenProvider, useKitchen as publicHook } from "@/kitchen/KitchenProvider";
import { useKitchen } from "@/kitchen/kitchen-context";

vi.mock("@/kitchen/services", () => ({
  orderService: {
    isMock: true,
    demoEnabled: false,
    initializeDemoMode: vi.fn(),
    listActiveOrders: async () => [],
    getSettings: async () => ({ acceptingOrders: true, soundEnabled: false }),
    subscribe: () => () => {},
    onConnectionChange: () => () => {},
  },
}));

afterEach(cleanup);

describe("kitchen context boundary", () => {
  it("shares one context between the provider and both consumer imports", async () => {
    function Consumer() {
      const current = useKitchen();
      const legacy = publicHook();
      expect(current).toBe(legacy);
      return <p>{current.loading ? "Waiting" : `Orders: ${current.orders.length}`}</p>;
    }
    render(
      <KitchenProvider>
        <Consumer />
      </KitchenProvider>,
    );
    expect(await screen.findByText("Orders: 0")).toBeTruthy();
    expect(publicHook).toBe(useKitchen);
  });
});
