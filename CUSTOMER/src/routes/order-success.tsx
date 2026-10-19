import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  Bike,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { inr } from "@/data/menu";
import { supabase } from "@/integrations/supabase/client";
import { getOrderDetailsServerFn } from "@/lib/orders-service";
import { SpotlightCard, ShinyText } from "@/components/reactbits";

interface OrderSearch {
  order_id?: string | undefined;
  token?: string | undefined;
}

export const Route = createFileRoute("/order-success")({
  validateSearch: (s: Record<string, unknown>): OrderSearch => ({
    order_id: typeof s["order_id"] === "string" ? s["order_id"] : undefined,
    token: typeof s["token"] === "string" ? s["token"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Order Confirmed — Crunch Box" },
      { name: "description", content: "Track your Crunch Box order status in real time." },
      { property: "og:title", content: "Order Confirmed — Crunch Box" },
      { property: "og:description", content: "Live order tracking for Crunch Box." },
    ],
  }),
  component: SuccessPage,
});

type OrderStatus =
  | "pending_payment"
  | "new"
  | "accepted"
  | "preparing"
  | "ready_for_pickup"
  | "picked_up"
  | "delivered"
  | "rejected"
  | "cancelled"
  | "refund_pending"
  | "refunded";

interface TrackedOrder {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  landmark?: string | null;
  special_instructions?: string | null;
  subtotal_paise: number;
  delivery_fee_paise: number;
  total_paise: number;
  created_at: string;
  items: Array<{
    product_name: string;
    variant_name?: string | null;
    quantity: number;
    unit_price_paise: number;
  }>;
}

const STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "new", label: "Confirmed", icon: CheckCircle2 },
  { status: "ready_for_pickup", label: "Ready & Dispatched", icon: Bike },
  { status: "delivered", label: "Delivered", icon: Sparkles },
];

function stepIndex(s: OrderStatus): number {
  switch (s) {
    case "new":
      return 0;
    case "accepted":
    case "preparing":
    case "ready_for_pickup":
    case "picked_up":
      return 1;
    case "delivered":
      return 2;
    default:
      return 0;
  }
}

function SuccessPage() {
  const { order_id, token } = Route.useSearch();
  const [order, setOrder] = useState<TrackedOrder | null | undefined>(undefined);
  const [liveStatus, setLiveStatus] = useState<OrderStatus>("new");

  useEffect(() => {
    let activeId = order_id;
    let activeToken = token;

    // Fallback: Check local history if URL params are missing
    if (!activeId || !activeToken) {
      try {
        const stored = JSON.parse(localStorage.getItem("cb_recent_orders") || "[]") as Array<{
          id: string;
          token: string;
        }>;
        if (stored.length > 0) {
          activeId = stored[0]?.id;
          activeToken = stored[0]?.token;
        }
      } catch {
        // Ignore localStorage errors
      }
    }

    if (!activeId || !activeToken) {
      setOrder(null);
      return;
    }

    // Fetch order details via shared store server function, secure RPC, or fallback direct select
    async function fetchOrder() {
      try {
        // 1. Try authoritative server function (reads shared-orders.json + Supabase)
        const serverOrder = await getOrderDetailsServerFn({
          data: { orderId: activeId!, accessToken: activeToken },
        });

        if (serverOrder) {
          const formatted: TrackedOrder = {
            id: serverOrder.id,
            order_number: serverOrder.order_number,
            status: serverOrder.status as OrderStatus,
            payment_status: serverOrder.payment_status,
            customer_name: serverOrder.customer_name,
            customer_phone: serverOrder.customer_phone,
            delivery_address: serverOrder.delivery_address,
            landmark: serverOrder.landmark,
            special_instructions: serverOrder.special_instructions,
            subtotal_paise: serverOrder.subtotal_paise,
            delivery_fee_paise: serverOrder.delivery_fee_paise,
            total_paise: serverOrder.total_paise,
            created_at: serverOrder.created_at,
            items: (serverOrder.items || []).map(
              (i: {
                product_name: string;
                variant_name: string | null;
                quantity: number;
                unit_price_paise: number;
              }) => ({
                product_name: i.product_name,
                variant_name: i.variant_name,
                quantity: i.quantity,
                unit_price_paise: i.unit_price_paise,
              }),
            ),
          };
          setOrder(formatted);
          setLiveStatus(formatted.status);
          return;
        }

        // 2. Direct select / RPC fallback safely
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeId!);
        let query = supabase.from("orders").select("*, order_items(*)");
        if (isUuid) {
          query = query.eq("id", activeId!);
        } else {
          query = query.eq("order_number", activeId!);
        }
        const { data: rawOrder } = await query.maybeSingle();

        if (rawOrder) {
          const formatted: TrackedOrder = {
            id: rawOrder.id,
            order_number: rawOrder.order_number,
            status: rawOrder.status as OrderStatus,
            payment_status: rawOrder.payment_status,
            customer_name: rawOrder.customer_name,
            customer_phone: rawOrder.customer_phone,
            delivery_address: rawOrder.delivery_address,
            landmark: rawOrder.landmark,
            special_instructions: rawOrder.special_instructions,
            subtotal_paise: rawOrder.subtotal_paise,
            delivery_fee_paise: rawOrder.delivery_fee_paise,
            total_paise: rawOrder.total_paise,
            created_at: rawOrder.created_at,
            items: (rawOrder.order_items || []).map(
              (i: {
                product_name: string;
                variant_name: string | null;
                quantity: number;
                unit_price_paise: number;
              }) => ({
                product_name: i.product_name,
                variant_name: i.variant_name,
                quantity: i.quantity,
                unit_price_paise: i.unit_price_paise,
              }),
            ),
          };
          setOrder(formatted);
          setLiveStatus(formatted.status);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error("Error loading order:", err);
        setOrder(null);
      }
    }

    void fetchOrder();

    // Resource optimization: Only poll when document is active/visible
    const interval = setInterval(() => {
      if (!document.hidden) {
        void fetchOrder();
      }
    }, 4000);

    // Subscribe to Realtime status updates if Supabase realtime is available
    const channel = supabase
      .channel(`customer-order-${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${activeId}`,
        },
        (payload) => {
          if (payload.new && "status" in payload.new) {
            const nextStatus = payload.new["status"] as OrderStatus;
            setLiveStatus(nextStatus);
            setOrder((prev) => (prev ? { ...prev, status: nextStatus } : prev));
          }
        },
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [order_id, token]);

  if (order === undefined)
    return (
      <div className="px-4 py-20 text-center text-muted-foreground">Loading order status…</div>
    );
  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-3xl font-display uppercase">No Recent Order Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn’t find an active order session. Please check your order confirmation link.
        </p>
        <Link
          to="/menu"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-display uppercase text-primary-foreground hover:brightness-110"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  const isCancelledOrRejected = ["rejected", "cancelled", "refund_pending", "refunded"].includes(
    liveStatus,
  );
  const isDelivered = liveStatus === "delivered";
  const currentStep = stepIndex(liveStatus);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center animate-rise">
        {isCancelledOrRejected ? (
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-10 w-10" />
          </div>
        ) : isDelivered ? (
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-veg/10 text-veg">
            <Sparkles className="h-10 w-10" />
          </div>
        ) : (
          <CheckCircle2 className="mx-auto h-16 w-16 text-veg" />
        )}

        <span
          className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${
            isCancelledOrRejected
              ? "bg-destructive/10 text-destructive"
              : isDelivered
                ? "bg-veg/10 text-veg"
                : "bg-primary/10 text-primary"
          }`}
        >
          {isCancelledOrRejected
            ? "Order Update"
            : isDelivered
              ? "Delivered & Completed"
              : "Prepaid & Confirmed"}
        </span>

        <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
          {isCancelledOrRejected
            ? `Order #${order.order_number}`
            : isDelivered
              ? `Delivered! Enjoy your crunch!`
              : `Thanks, ${order.customer_name.split(" ")[0]}!`}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order Reference: <strong className="text-foreground">#{order.order_number}</strong> · Paid
          Online
        </p>
      </div>

      {/* Live Status Progression Stepper */}
      <SpotlightCard
        className="mt-8 rounded-2xl border bg-card p-5 shadow-card"
        spotlightColor="rgba(217, 40, 28, 0.12)"
        borderColor="rgba(217, 40, 28, 0.25)"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-display text-lg font-bold">Live Order Status</h2>
          {isDelivered ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-veg">
              <CheckCircle2 className="h-3.5 w-3.5" /> Order Completed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <ShinyText text="Realtime Tracking" speed={2.5} />
            </span>
          )}
        </div>

        {isCancelledOrRejected ? (
          <div className="my-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
            <p className="font-bold text-destructive">
              {liveStatus === "rejected"
                ? "Order could not be accepted by kitchen"
                : liveStatus === "cancelled"
                  ? "Order was cancelled"
                  : "Refund in Process"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              A full refund of {inr(order.total_paise / 100)} has been initiated to your original
              payment method.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
              <RotateCcw className="h-3.5 w-3.5 animate-spin" /> Refund Processing
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isGreen = isPast || (isDelivered && isCurrent);

              return (
                <div key={s.status} className="flex flex-col items-center text-center">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl transition-all ${
                      isGreen
                        ? "bg-veg text-white shadow-md ring-4 ring-veg/20 scale-105"
                        : isCurrent
                          ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20 scale-105"
                          : "bg-muted text-muted-foreground opacity-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold leading-tight ${
                      isGreen
                        ? "text-veg font-bold"
                        : isCurrent
                          ? "text-primary font-bold"
                          : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </SpotlightCard>

      {/* Order Contents & Delivery Card */}
      <div className="mt-6 space-y-5 rounded-2xl border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-bold">Items in this Order</h2>
        <ul className="divide-y text-sm">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3 py-2.5 first:pt-0">
              <div>
                <span className="font-bold text-primary">{i.quantity}×</span> {i.product_name}
                {i.variant_name && (
                  <span className="block text-xs text-muted-foreground">({i.variant_name})</span>
                )}
              </div>
              <span className="font-semibold tabular-nums">
                {inr((i.quantity * i.unit_price_paise) / 100)}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-1.5 border-t pt-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Items Subtotal</span>
            <span className="tabular-nums">{inr(order.subtotal_paise / 100)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            <span className="tabular-nums">{inr(order.delivery_fee_paise / 100)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <span>Total Paid</span>
            <span className="text-primary tabular-nums">{inr(order.total_paise / 100)}</span>
          </div>
        </div>

        <div className="border-t pt-4 text-sm">
          <h3 className="font-display text-base font-bold">Delivery Address</h3>
          <p className="mt-1 font-semibold">
            {order.customer_name} · {order.customer_phone}
          </p>
          <p className="text-muted-foreground">
            {order.delivery_address}
            {order.landmark && `, near ${order.landmark}`}
          </p>
          {order.special_instructions && (
            <p className="mt-1 text-xs text-muted-foreground">Note: {order.special_instructions}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/menu"
          className="flex-1 rounded-xl bg-primary py-3.5 text-center font-display uppercase tracking-wider text-primary-foreground hover:brightness-110"
        >
          Order More Food
        </Link>
        <Link
          to="/"
          className="flex-1 rounded-xl border py-3.5 text-center font-display uppercase tracking-wider hover:bg-muted"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
