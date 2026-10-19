// MOCK ADAPTER — in-memory only. Nothing here is persisted to a restaurant database.
import type { KitchenOrderService } from "../KitchenOrderService";
import type {
  ConnectionState,
  KitchenSettings,
  Order,
  OrderEvent,
  OrderStatus,
} from "../../domain/types";
import {
  ACTIVE_STATUSES,
  canTransition,
  kolkataDateKey,
  DELIVERY_FEE,
  validateDeliveryFee,
} from "../../domain/rules";
import { makeOrder, seedOrders } from "./mockData";

const LATENCY = 450;
const wait = (ms = LATENCY) => new Promise((r) => setTimeout(r, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export function createMockOrderService(options?: {
  simulateIncoming?: boolean;
}): KitchenOrderService {
  let orders: Order[] = seedOrders();
  let demoEnabled = true;
  const modeKey = "crunch-box:kitchen-demo-enabled";
  let settings: KitchenSettings = {
    acceptingOrders: true,
    openingTime: "18:00",
    closingTime: "03:00",
    deliveryFee: DELIVERY_FEE,
    soundEnabled: true,
    timezone: "Asia/Kolkata",
  };
  const listeners = new Set<(e: OrderEvent) => void>();
  const connListeners = new Set<(s: ConnectionState) => void>();
  let timer: ReturnType<typeof setInterval> | null = null;

  const emit = (e: OrderEvent) => listeners.forEach((l) => l(clone(e)));

  function startSimulation() {
    if (
      !demoEnabled ||
      listeners.size === 0 ||
      timer ||
      options?.simulateIncoming === false ||
      typeof window === "undefined"
    )
      return;
    // Simulates a payment-confirmed order arriving roughly every 75 seconds.
    timer = setInterval(() => {
      if (!demoEnabled || !settings.acceptingOrders) return;
      const o = makeOrder({ minutesAgo: 0, status: "new" });
      o.deliveryFee = settings.deliveryFee;
      o.total = o.subtotal + o.deliveryFee;
      orders = [o, ...orders];
      emit({ type: "order_created", order: o });
    }, 75000);
  }

  return {
    isMock: true,
    get demoEnabled() {
      return demoEnabled;
    },
    initializeDemoMode() {
      if (typeof window === "undefined") return;
      try {
        if (window.localStorage.getItem(modeKey) === "false") {
          demoEnabled = false;
          orders = [];
        }
      } catch {
        /* Storage may be unavailable; controls still work for this session. */
      }
      if (typeof window !== "undefined") {
        try {
          const savedSettings = window.localStorage.getItem("crunch-box:mock-settings");
          if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
          }
        } catch {}
      }
    },
    async setDemoEnabled(enabled) {
      // Save the choice before changing state; never claim it will survive a refresh if saving failed.
      if (typeof window !== "undefined") window.localStorage.setItem(modeKey, String(enabled));
      demoEnabled = enabled;
      if (timer) clearInterval(timer);
      timer = null;
      orders = enabled ? seedOrders() : [];
      orders.forEach((order) => {
        order.deliveryFee = settings.deliveryFee;
        order.total = order.subtotal + order.deliveryFee;
        if (order.refundAmount !== undefined) order.refundAmount = order.total;
      });
      emit({ type: "orders_reset" });
      if (enabled) startSimulation();
    },
    async listActiveOrders() {
      await wait(250);
      return clone(orders.filter((o) => ACTIVE_STATUSES.includes(o.status) || isToday(o)));
    },
    async getOrder(id) {
      await wait(150);
      return clone(orders.find((o) => o.id === id) ?? null);
    },
    async updateOrderStatus(id, to: OrderStatus) {
      await wait();
      const o = orders.find((x) => x.id === id);
      if (!o) throw new Error("Order not found");
      if (!canTransition(o.status, to)) {
        throw new Error(`Cannot move order from ${o.status} to ${to}`);
      }
      o.status = to;
      o.history.push({ status: to, at: new Date().toISOString() });
      if (to === "rejected" || to === "cancelled") {
        o.paymentStatus = "refund_pending";
        o.refundAmount = o.total;
      }
      emit({ type: "order_updated", order: o });
      return clone(o);
    },
    async listOrderHistory(q) {
      await wait(250);
      const s = q.search?.trim().toLowerCase();
      return clone(
        orders
          .filter((o) => !q.date || kolkataDateKey(o.createdAt) === q.date)
          .filter(
            (o) =>
              !s ||
              o.orderNumber.toLowerCase().includes(s) ||
              o.customerPhone.includes(s.replace(/\D/g, "") || "\u0000"),
          )
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    },
    async getSettings() {
      await wait(150);
      return clone(settings);
    },
    async updateSettings(patch) {
      await wait(300);
      if (patch.deliveryFee !== undefined) validateDeliveryFee(patch.deliveryFee);
      settings = { ...settings, ...patch, timezone: "Asia/Kolkata" };
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("crunch-box:mock-settings", JSON.stringify(settings));
        } catch {}
      }
      return clone(settings);
    },
    subscribe(cb) {
      listeners.add(cb);
      startSimulation();
      return () => {
        listeners.delete(cb);
        if (listeners.size === 0 && timer) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
    onConnectionChange(cb) {
      connListeners.add(cb);
      const fire = () => cb(navigator.onLine ? "connected" : "offline");
      const goOnline = () => {
        cb("reconnecting");
        setTimeout(fire, 1200);
      };
      fire();
      window.addEventListener("online", goOnline);
      window.addEventListener("offline", fire);
      return () => {
        connListeners.delete(cb);
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", fire);
      };
    },
  };
}

function isToday(o: Order) {
  return kolkataDateKey(o.createdAt) === kolkataDateKey(new Date());
}
