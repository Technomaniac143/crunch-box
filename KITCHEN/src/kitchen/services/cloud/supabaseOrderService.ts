import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { KitchenOrderService } from "../KitchenOrderService";

type DbOrderRow = Database["public"]["Tables"]["orders"]["Row"];
type DbOrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type DbOrderStatusEventRow = Database["public"]["Tables"]["order_status_events"]["Row"];
type DbKitchenSettingsUpdate = Database["public"]["Tables"]["kitchen_business_settings"]["Update"];
import type {
  ConnectionState,
  KitchenSettings,
  Order,
  OrderEvent,
  OrderHistoryQuery,
  OrderItem,
  OrderStatus,
  PaymentStatus,
} from "../../domain/types";
import {
  ACTIVE_STATUSES,
  canTransition,
  kolkataDateKey,
  DELIVERY_FEE,
  validateDeliveryFee,
} from "../../domain/rules";
import {
  saveSharedSettingsServerFn,
  getSharedSettings,
  getSharedOrders,
  updateSharedOrderStatus,
} from "./settingsServerFn";

const DEFAULT_SETTINGS: KitchenSettings = {
  acceptingOrders: true,
  openingTime: "18:00",
  closingTime: "03:00",
  deliveryFee: DELIVERY_FEE,
  soundEnabled: true,
  timezone: "Asia/Kolkata",
};

export function createProductionOrderService(): KitchenOrderService {
  const listeners = new Set<(e: OrderEvent) => void>();
  const connListeners = new Set<(s: ConnectionState) => void>();
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

  function emit(e: OrderEvent) {
    listeners.forEach((cb) => cb(e));
  }

  function emitConn(s: ConnectionState) {
    connListeners.forEach((cb) => cb(s));
  }

  // Map Supabase database row to Domain Order
  function mapDbOrder(
    row: DbOrderRow,
    items: DbOrderItemRow[] = [],
    history: DbOrderStatusEventRow[] = [],
  ): Order {
    const domainItems: OrderItem[] = items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      variantId: i.variant_id || undefined,
      variantName: i.variant_name || undefined,
      quantity: i.quantity,
      unitPrice: (i.unit_price_paise || 0) / 100,
    }));

    const domainHistory = history.map((h) => ({
      status: h.status as OrderStatus,
      at: h.created_at,
    }));

    return {
      id: row.id,
      orderNumber: row.order_number,
      createdAt: row.created_at,
      status: row.status as OrderStatus,
      paymentStatus: row.payment_status as PaymentStatus,
      paymentReference: row.payment_reference || row.razorpay_payment_id || undefined,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      deliveryAddress: row.delivery_address,
      landmark: row.landmark || undefined,
      specialInstructions: row.special_instructions || undefined,
      items: domainItems,
      subtotal: (row.subtotal_paise || 0) / 100,
      deliveryFee: (row.delivery_fee_paise || 0) / 100 || DELIVERY_FEE,
      total: (row.total_paise || 0) / 100,
      refundAmount: row.refund_amount_paise ? row.refund_amount_paise / 100 : undefined,
      history: domainHistory.length
        ? domainHistory
        : [{ status: row.status as OrderStatus, at: row.created_at }],
    };
  }

  function mapSharedOrder(o: any): Order {
    return {
      id: o.id,
      orderNumber: o.order_number || o.orderNumber,
      createdAt: o.created_at || o.createdAt,
      status: o.status as OrderStatus,
      paymentStatus: (o.payment_status || o.paymentStatus || "unpaid") as PaymentStatus,
      paymentReference: o.razorpay_payment_id || o.razorpayPaymentId || undefined,
      customerName: o.customer_name || o.customerName,
      customerPhone: o.customer_phone || o.customerPhone,
      deliveryAddress: o.delivery_address || o.deliveryAddress,
      landmark: o.landmark || undefined,
      specialInstructions: o.special_instructions || o.specialInstructions || undefined,
      items: (o.items || []).map((i: any, idx: number) => ({
        id: i.id || `item-${idx}`,
        productId: i.product_id || i.productId,
        productName: i.product_name || i.productName,
        variantName: i.variant_name || i.variantName || undefined,
        quantity: i.quantity,
        unitPrice:
          (i.unit_price_paise || i.unitPricePaise || 0) / 100 || (i.unitPrice || 0),
      })),
      subtotal: (o.subtotal_paise || o.subtotalPaise || 0) / 100 || (o.subtotal || 0),
      deliveryFee:
        (o.delivery_fee_paise || o.deliveryFeePaise || 0) / 100 ||
        (o.deliveryFee || DELIVERY_FEE),
      total: (o.total_paise || o.totalPaise || 0) / 100 || (o.total || 0),
      history:
        o.history && o.history.length > 0
          ? o.history.map((h: any) => ({
              status: h.status as OrderStatus,
              at: h.at,
            }))
          : [
              {
                status: (o.status || "new") as OrderStatus,
                at: o.created_at || o.createdAt || new Date().toISOString(),
              },
            ],
    };
  }

  return {
    get isMock() {
      return false;
    },
    get demoEnabled() {
      return false;
    },
    initializeDemoMode() {
      // Mock/demo features removed — always live Supabase environment
    },
    async setDemoEnabled() {
      // Mock/demo features removed — always live Supabase environment
    },
    async listActiveOrders(): Promise<Order[]> {
      const orderMap = new Map<string, Order>();

      // 1. Fetch from shared persistent storage
      try {
        const shared = await getSharedOrders();
        if (shared && Array.isArray(shared) && shared.length > 0) {
          for (const raw of shared) {
            const mapped = mapSharedOrder(raw);
            if (mapped.status !== "pending_payment") {
              orderMap.set(mapped.id, mapped);
            }
          }
        }
      } catch (e) {
        console.warn("Could not read shared orders:", e);
      }

      // 2. Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*), order_status_events(*)")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          for (const row of data) {
            const mapped = mapDbOrder(row, row.order_items || [], row.order_status_events || []);
            if (mapped.status !== "pending_payment") {
              orderMap.set(mapped.id, mapped);
            }
          }
        }
      } catch (err) {
        console.warn("Could not query Supabase orders:", err);
      }

      return Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },
    async getOrder(id: string): Promise<Order | null> {
      // 1. Try Supabase safely without throwing 22P02 on order_number
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let query = supabase.from("orders").select("*, order_items(*), order_status_events(*)");
        if (isUuid) {
          query = query.eq("id", id);
        } else {
          query = query.eq("order_number", id);
        }
        const { data, error } = await query.maybeSingle();

        if (!error && data) {
          return mapDbOrder(data, data.order_items || [], data.order_status_events || []);
        }
      } catch (err) {
        console.warn("Supabase getOrder query failed:", err);
      }

      // 2. Try shared orders
      try {
        const shared = await getSharedOrders();
        const o = shared?.find(
          (item: any) =>
            item.id === id || item.order_number === id || item.orderNumber === id,
        );
        if (o) return mapSharedOrder(o);
      } catch {
        // Ignore
      }

      return null;
    },
    async updateOrderStatus(id: string, to: OrderStatus): Promise<Order> {
      // Find existing order
      const existing = await this.getOrder(id);
      if (!existing) throw new Error("Order not found");
      if (!canTransition(existing.status, to)) {
        throw new Error(`Cannot move order from ${existing.status} to ${to}`);
      }

      const isRefundState = to === "rejected" || to === "cancelled";
      const updateData: Database["public"]["Tables"]["orders"]["Update"] = {
        status: to,
        updated_at: new Date().toISOString(),
      };

      if (isRefundState && existing.paymentStatus === "paid") {
        updateData.payment_status = "refund_pending";
        updateData.refund_amount_paise = Math.round(existing.total * 100);
      }

      const targetId = existing.id;

      // 1. Update in Supabase
      try {
        const { data, error } = await supabase
          .from("orders")
          .update(updateData)
          .eq("id", targetId)
          .select("*, order_items(*), order_status_events(*)")
          .single();

        if (!error && data) {
          await supabase.from("order_status_events").insert({
            order_id: targetId,
            status: to,
          });

          // Sync shared file
          try {
            await updateSharedOrderStatus({ orderId: targetId, status: to });
          } catch {}

          const updated = mapDbOrder(data, data.order_items || [], [
            ...(data.order_status_events || []),
            {
              id: crypto.randomUUID?.() || `evt-${Date.now()}`,
              order_id: id,
              status: to,
              created_at: new Date().toISOString(),
              note: null,
            },
          ]);

          emit({ type: "order_updated", order: updated });
          return updated;
        }
      } catch (err) {
        console.warn("Direct Supabase update failed, attempting fallback:", err);
      }

      // 2. Fallback update via shared storage
      try {
        const res = await updateSharedOrderStatus({ orderId: id, status: to });
        if (res.ok && res.order) {
          const updated = mapSharedOrder(res.order);
          emit({ type: "order_updated", order: updated });
          return updated;
        }
      } catch (e) {
        console.warn("Shared order update failed:", e);
      }

      const updatedLocally: Order = {
        ...existing,
        status: to,
        history: [...existing.history, { status: to, at: new Date().toISOString() }],
      };
      emit({ type: "order_updated", order: updatedLocally });
      return updatedLocally;
    },
    async listOrderHistory(q: OrderHistoryQuery): Promise<Order[]> {
      const orderMap = new Map<string, Order>();

      // 1. Query Supabase
      try {
        let query = supabase
          .from("orders")
          .select("*, order_items(*), order_status_events(*)")
          .order("created_at", { ascending: false });

        if (q.search && q.search.trim()) {
          const s = q.search.trim();
          query = query.or(`order_number.ilike.%${s}%,customer_phone.ilike.%${s}%,customer_name.ilike.%${s}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          for (const row of data) {
            const mapped = mapDbOrder(row, row.order_items || [], row.order_status_events || []);
            orderMap.set(mapped.id, mapped);
          }
        }
      } catch (err) {
        console.warn("Supabase listOrderHistory query failed:", err);
      }

      // 2. Query shared storage
      try {
        const shared = await getSharedOrders();
        if (shared && Array.isArray(shared) && shared.length > 0) {
          for (const raw of shared) {
            const mapped = mapSharedOrder(raw);
            if (!orderMap.has(mapped.id)) {
              orderMap.set(mapped.id, mapped);
            }
          }
        }
      } catch (e) {
        console.warn("Shared storage read error in listOrderHistory:", e);
      }

      let list = Array.from(orderMap.values()).filter((o) => o.status !== "pending_payment");

      if (q.search && q.search.trim()) {
        const s = q.search.trim().toLowerCase();
        list = list.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(s) ||
            o.customerPhone.toLowerCase().includes(s) ||
            o.customerName.toLowerCase().includes(s),
        );
      }

      if (q.date && q.date.trim()) {
        const d = q.date.trim();
        list = list.filter((o) => {
          if (kolkataDateKey(o.createdAt) === d) return true;
          if (o.history && o.history.some((h) => h.at && kolkataDateKey(h.at) === d)) return true;
          return false;
        });
      }

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    },
    async getSettings(): Promise<KitchenSettings> {
      // 1. Supabase kitchen_business_settings
      try {
        const { data } = await supabase
          .from("kitchen_business_settings")
          .select("*")
          .eq("id", true)
          .maybeSingle();

        if (data) {
          return {
            acceptingOrders: data.accepting_orders,
            openingTime: data.opening_time || DEFAULT_SETTINGS.openingTime,
            closingTime: data.closing_time || DEFAULT_SETTINGS.closingTime,
            deliveryFee: data.delivery_fee || DEFAULT_SETTINGS.deliveryFee,
            soundEnabled: data.sound_enabled ?? DEFAULT_SETTINGS.soundEnabled,
            timezone: "Asia/Kolkata",
          };
        }
      } catch (err) {
        console.warn("Could not fetch settings from Supabase:", err);
      }

      // 2. Shared settings file
      try {
        const shared = await getSharedSettings();
        if (shared) {
          return {
            ...DEFAULT_SETTINGS,
            ...shared,
          };
        }
      } catch {}

      // 3. LocalStorage
      if (typeof window !== "undefined") {
        try {
          const saved = window.localStorage.getItem("crunch-box:kitchen-settings");
          if (saved) {
            return {
              ...DEFAULT_SETTINGS,
              ...JSON.parse(saved),
            };
          }
        } catch {}
      }

      return DEFAULT_SETTINGS;
    },
    async updateSettings(patch: Partial<KitchenSettings>): Promise<KitchenSettings> {
      if (patch.deliveryFee !== undefined) {
        validateDeliveryFee(patch.deliveryFee);
      }

      // 1. Persist to localStorage
      if (typeof window !== "undefined") {
        try {
          const existing = window.localStorage.getItem("crunch-box:kitchen-settings");
          const merged = { ...(existing ? JSON.parse(existing) : {}), ...patch };
          window.localStorage.setItem("crunch-box:kitchen-settings", JSON.stringify(merged));
        } catch {}
      }

      // 2. Sync to shared settings file
      try {
        await saveSharedSettingsServerFn({ data: patch });
      } catch (err) {
        console.warn("Could not sync shared settings via server fn:", err);
      }

      // 3. Persist to Supabase kitchen_business_settings
      try {
        const updateRow: DbKitchenSettingsUpdate = {
          updated_at: new Date().toISOString(),
        };
        if (patch.acceptingOrders !== undefined)
          updateRow["accepting_orders"] = patch.acceptingOrders;
        if (patch.openingTime !== undefined) updateRow["opening_time"] = patch.openingTime;
        if (patch.closingTime !== undefined) updateRow["closing_time"] = patch.closingTime;
        if (patch.deliveryFee !== undefined) {
          updateRow["delivery_fee"] = patch.deliveryFee;
          updateRow["delivery_fee_paise"] = Math.round(patch.deliveryFee * 100);
        }
        if (patch.soundEnabled !== undefined) updateRow["sound_enabled"] = patch.soundEnabled;

        await supabase
          .from("kitchen_business_settings")
          .upsert({ id: true, ...updateRow });
      } catch (err) {
        console.warn("Could not persist settings to Supabase:", err);
      }

      return this.getSettings();
    },
    subscribe(cb: (e: OrderEvent) => void): () => void {
      listeners.add(cb);

      // Setup Realtime Postgres Changes
      if (!realtimeChannel && typeof window !== "undefined") {
        realtimeChannel = supabase
          .channel("kitchen-orders-realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders" },
            async (payload) => {
              const orderId = (payload.new as any)?.["id"] || (payload.old as any)?.["id"];
              if (!orderId) return;

              if (payload.eventType === "INSERT") {
                const fresh = await this.getOrder(orderId);
                if (fresh && fresh.status !== "pending_payment") {
                  emit({ type: "order_created", order: fresh });
                }
              } else if (payload.eventType === "UPDATE") {
                const fresh = await this.getOrder(orderId);
                if (fresh && fresh.status !== "pending_payment") {
                  emit({ type: "order_updated", order: fresh });
                }
              }
            },
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") emitConn("connected");
            else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") emitConn("reconnecting");
            else if (status === "CLOSED") emitConn("offline");
          });
      }

      return () => {
        listeners.delete(cb);
        if (listeners.size === 0 && realtimeChannel) {
          void supabase.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }
      };
    },
    onConnectionChange(cb: (s: ConnectionState) => void): () => void {
      connListeners.add(cb);

      const handleOnline = () => {
        emitConn("reconnecting");
        setTimeout(() => emitConn("connected"), 1200);
      };
      const handleOffline = () => emitConn("offline");

      if (typeof window !== "undefined") {
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
      }

      return () => {
        connListeners.delete(cb);
        if (typeof window !== "undefined") {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
        }
      };
    },
  };
}
