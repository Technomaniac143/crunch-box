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
    const list = await orderService.listActiveOrders();
    setOrders(list);
    // Outstanding new orders always surface on open, regardless of missed alerts.
    setUnread((u) => new Set([...u, ...list.filter((o) => o.status === "new").map((o) => o.id)]));
    setLoading(false);
  }, []);

  useEffect(() => {
    orderService.initializeDemoMode();
    setDemoState(orderService.demoEnabled);
    refresh();
    orderService.getSettings().then((s) => {
      setSettings(s);
      soundRef.current = s.soundEnabled;
    });
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
      if (s === "connected") refresh();
    });
    return () => {
      off();
      offConn();
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
      try {
        const o = await orderService.updateOrderStatus(id, to);
        setOrders((prev) => prev.map((x) => (x.id === id ? o : x)));
        acknowledge(id);
      } catch (err) {
        toast.error((err as Error).message);
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
    const s = await orderService.updateSettings(patch);
    setSettings(s);
    soundRef.current = s.soundEnabled;
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
