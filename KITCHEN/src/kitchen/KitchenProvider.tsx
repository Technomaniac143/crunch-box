import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { orderService } from "./services";
import type { ConnectionState, KitchenSettings, Order, OrderStatus } from "./domain/types";
import { playNewOrderChime } from "./notifications/alerts";

import { KitchenContext } from "./kitchen-context";
export { useKitchen } from "./kitchen-context";

export function KitchenProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<KitchenSettings | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connected");
  const [unread, setUnread] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const soundRef = useRef(true);
  const [demoEnabled, setDemoState] = useState(orderService.demoEnabled);

  const refresh = useCallback(async () => {
    try {
      const list = await orderService.listActiveOrders();
      setOrders(list);
      // Outstanding new orders always surface on open, regardless of missed alerts.
      setUnread((u) => new Set([...u, ...list.filter((o) => o.status === "new").map((o) => o.id)]));
    } catch (e) {
      console.warn("Could not refresh kitchen orders:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    orderService.initializeDemoMode();
    setDemoState(orderService.demoEnabled);
    void refresh();
    void orderService.getSettings().then((s) => {
      setSettings(s);
      soundRef.current = s.soundEnabled;
    });

    // 1. Core order service events
    const off = orderService.subscribe((e) => {
      if (e.type === "orders_reset") {
        setOrders([]);
        setUnread(new Set());
        setPending(new Set());
        setDemoState(orderService.demoEnabled);
        void refresh();
        return;
      }
      setOrders((prev) => {
        const rest = prev.filter((o) => o.id !== e.order.id);
        return [e.order, ...rest];
      });
      if (e.type === "order_created") {
        setUnread((u) => new Set(u).add(e.order.id));
        if (soundRef.current) playNewOrderChime();
        toast(`New order ${e.order.orderNumber}`, { description: e.order.customerName });
      }
    });

    const offConn = orderService.onConnectionChange((s) => {
      setConnection(s);
      if (s === "connected") void refresh();
    });

    // 2. Cross-tab/cross-app instant BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("crunch-box-sync");
        bc.onmessage = (event) => {
          const data = event.data;
          if (!data) return;

          if (data.type === "settings_updated" && data.payload) {
            setSettings((prev) => (prev ? { ...prev, ...data.payload } : data.payload));
            if (data.payload.soundEnabled !== undefined) {
              soundRef.current = data.payload.soundEnabled;
            }
          } else if (data.type === "order_created" && data.payload) {
            const newOrder = data.payload as Order;
            setOrders((prev) => {
              if (prev.some((o) => o.id === newOrder.id)) return prev;
              return [newOrder, ...prev];
            });
            setUnread((u) => new Set(u).add(newOrder.id));
            if (soundRef.current) playNewOrderChime();
            toast(`New order ${newOrder.orderNumber}`, { description: newOrder.customerName });
          } else if (data.type === "order_updated" && data.payload) {
            const { orderId, status } = data.payload;
            setOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
            );
          }
        };
      } catch (err) {
        console.warn("Kitchen BroadcastChannel init skipped:", err);
      }
    }

    // 3. Fast periodic sync (every 3.5s when active) to guarantee freshness without hard refresh
    const pollTimer = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        void refresh();
      }
    }, 3500);

    // 4. Instant recheck on window focus / visibilitychange
    const onVisible = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        void refresh();
        void orderService.getSettings().then((s) => {
          setSettings(s);
          soundRef.current = s.soundEnabled;
        });
      }
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      off();
      offConn();
      if (bc) bc.close();
      clearInterval(pollTimer);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const acknowledge = useCallback((id?: string) => {
    setUnread((u) => {
      if (!id) return new Set();
      const n = new Set(u);
      n.delete(id);
      return n;
    });
  }, []);

  const updateStatus = useCallback(
    async (id: string, to: OrderStatus) => {
      if (pending.has(id)) return;
      setPending((p) => new Set(p).add(id));

      // 1. Optimistic instant UI update (0ms card transition)
      let previousOrders: Order[] = [];
      setOrders((prev) => {
        previousOrders = prev;
        return prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: to,
                history: [...(x.history || []), { status: to, at: new Date().toISOString() }],
              }
            : x,
        );
      });
      acknowledge(id);

      // Broadcast immediately across windows
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("crunch-box-sync");
          bc.postMessage({ type: "order_updated", payload: { orderId: id, status: to } });
          bc.close();
        } catch {}
      }

      try {
        const o = await orderService.updateOrderStatus(id, to);
        setOrders((prev) => prev.map((x) => (x.id === id ? o : x)));
      } catch (err) {
        toast.error((err as Error).message);
        // Rollback on failure
        setOrders(previousOrders);
      } finally {
        setPending((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        });
      }
    },
    [pending, acknowledge],
  );

  const updateSettings = useCallback(async (patch: Partial<KitchenSettings>) => {
    // 1. Optimistic instant UI update (0ms switch toggle / input update)
    setSettings((prev) => (prev ? { ...prev, ...patch } : null));
    if (patch.soundEnabled !== undefined) {
      soundRef.current = patch.soundEnabled;
    }

    // Broadcast immediately across windows
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("crunch-box-sync");
        bc.postMessage({ type: "settings_updated", payload: patch });
        bc.close();
      } catch {}
    }

    try {
      const s = await orderService.updateSettings(patch);
      setSettings(s);
      soundRef.current = s.soundEnabled;
    } catch (err) {
      toast.error((err as Error).message);
      // Rollback on error
      const fresh = await orderService.getSettings();
      setSettings(fresh);
      soundRef.current = fresh.soundEnabled;
    }
  }, []);

  const setDemoEnabled = useCallback(
    async (enabled: boolean) => {
      await orderService.setDemoEnabled(enabled);
      setDemoState(orderService.demoEnabled);
      await refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      orders,
      loading,
      settings,
      connection,
      unread,
      pending,
      acknowledge,
      updateStatus,
      updateSettings,
      refresh,
      isMock: orderService.isMock,
      demoEnabled,
      setDemoEnabled,
    }),
    [
      orders,
      loading,
      settings,
      connection,
      unread,
      pending,
      acknowledge,
      updateStatus,
      updateSettings,
      refresh,
      demoEnabled,
      setDemoEnabled,
    ],
  );
  return <KitchenContext.Provider value={value}>{children}</KitchenContext.Provider>;
}
