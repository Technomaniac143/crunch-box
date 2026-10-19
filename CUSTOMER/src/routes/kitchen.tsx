import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ChefHat,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Flame,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/kitchen")({
  head: () => ({
    meta: [
      { title: "Live Kitchen KDS & Staff Portal — Crunch Box" },
      {
        name: "description",
        content: "Crunch Box Kitchen Display System (KDS), Live Order Dispatch & Preparation Dashboard.",
      },
    ],
  }),
  component: KitchenPortalRoute,
});

interface OrderItemRow {
  id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price_paise: number;
}

interface OrderRow {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  landmark: string | null;
  special_instructions: string | null;
  total_paise: number;
  order_items?: OrderItemRow[];
}

function playKitchenChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Pleasant double chime (F5 -> A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(698.46, now); // F5
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.28, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);
  } catch {
    // Audio context may be restricted before user gesture
  }
}

function KitchenPortalRoute() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Sign-in form state
  const [email, setEmail] = useState("Kameshwaranbtc2022@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // KDS Orders state
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "NEW" | "PREPARING" | "READY" | "DELIVERED">("ALL");
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  // Ref to track audio state
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  // 1. Check existing session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser({ id: data.session.user.id, email: data.session.user.email });
      }
      setAuthChecking(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch Orders
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(60);

      if (!error && data) {
        setOrders(data as OrderRow[]);
      }
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // 3. Realtime Subscription
  useEffect(() => {
    if (!user) return;
    fetchOrders();

    const channel = supabase
      .channel("kitchen-kds-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            if (soundRef.current) playKitchenChime();
          }
          fetchOrders();
        },
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchOrders]);

  // Handle staff login
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }
    setAuthBusy(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setAuthError(error.message || "Invalid email or password.");
      } else if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        if (soundEnabled) playKitchenChime();
      }
    } catch {
      setAuthError("Failed to connect to authentication service.");
    } finally {
      setAuthBusy(false);
    }
  };

  // Handle staff logout
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Status transition handler
  const updateStatus = async (orderId: string, nextStatus: string) => {
    setActionBusyId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus as "new" | "preparing" | "ready_for_pickup" | "picked_up" | "delivered" | "cancelled" })
        .eq("id", orderId);

      if (!error) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
        );
        if (soundEnabled) playKitchenChime();
      }
    } finally {
      setActionBusyId(null);
    }
  };

  if (authChecking) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Connecting to Kitchen Terminal…</p>
        </div>
      </div>
    );
  }

  // --- 1. SIGN IN SCREEN (When not authenticated) ---
  if (!user) {
    return (
      <div className="min-h-screen bg-background py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-md">
          {/* Brand Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-7 shadow-xl">
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <ChefHat className="h-3.5 w-3.5" />
                <span>KDS Terminal</span>
              </span>
            </div>

            <div className="mt-6">
              <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
                Kitchen Staff <span className="text-primary">Sign In</span>
              </h1>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Enter your authorized credentials to launch the live dispatch and preparation screen.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              {authError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Staff Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Kameshwaranbtc2022@gmail.com"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-12 w-full rounded-xl border border-border bg-background pl-4 pr-11 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 touch-manipulation"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authBusy}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-display text-sm uppercase tracking-wider text-primary-foreground shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 touch-manipulation"
              >
                {authBusy ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Sign In to Kitchen</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-border/60 pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Staff &amp; Manager access only · Public sign-up is disabled
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. LIVE KDS TERMINAL (When authenticated) ---
  const activeOrdersCount = orders.filter(
    (o) => !["delivered", "cancelled", "rejected"].includes(o.status.toLowerCase()),
  ).length;

  const newOrdersCount = orders.filter((o) =>
    ["new", "pending_payment"].includes(o.status.toLowerCase()),
  ).length;

  const preparingCount = orders.filter((o) =>
    ["preparing", "accepted"].includes(o.status.toLowerCase()),
  ).length;

  const readyCount = orders.filter((o) =>
    ["ready", "ready_for_pickup", "picked_up"].includes(o.status.toLowerCase()),
  ).length;

  const deliveredCount = orders.filter((o) =>
    ["delivered"].includes(o.status.toLowerCase()),
  ).length;

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const s = o.status.toLowerCase();
    if (activeTab === "NEW") return ["new", "pending_payment"].includes(s);
    if (activeTab === "PREPARING") return ["preparing", "accepted"].includes(s);
    if (activeTab === "READY") return ["ready", "ready_for_pickup", "picked_up"].includes(s);
    if (activeTab === "DELIVERED") return ["delivered"].includes(s);
    return true; // ALL
  });

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Top Mobile/Desktop KDS Sticky Bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground font-display text-lg font-bold shadow-sm">
              <ChefHat className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base font-bold tracking-tight text-foreground uppercase sm:text-lg">
                  Kitchen Display System
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    realtimeConnected
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-amber-500/15 text-amber-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      realtimeConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span>{realtimeConnected ? "Live" : "Connecting"}</span>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                {user.email || "Staff Terminal"} · Padur Outlet
              </p>
            </div>
          </div>

          {/* Quick Actions (Audio, Refresh, Logout) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled((s) => !s);
                if (!soundEnabled) playKitchenChime();
              }}
              title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
              className={`grid h-10 w-10 place-items-center rounded-xl border transition-all active:scale-90 touch-manipulation ${
                soundEnabled
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              onClick={fetchOrders}
              disabled={loadingOrders}
              title="Refresh order queue"
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground hover:bg-muted active:scale-90 transition-all touch-manipulation disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loadingOrders ? "animate-spin text-primary" : ""}`} />
            </button>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="grid h-10 w-10 place-items-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-90 transition-all touch-manipulation"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6">
        {/* Metric Badges (Mobile Touch Snap Carousel) */}
        <div className="no-scrollbar mobile-scroll-snap -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2">
          <div className="flex min-w-[130px] flex-1 flex-col rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Orders
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-primary">
              {activeOrdersCount}
            </span>
          </div>

          <div className="flex min-w-[120px] flex-1 flex-col rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              Incoming
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-amber-600">
              {newOrdersCount}
            </span>
          </div>

          <div className="flex min-w-[120px] flex-1 flex-col rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
              Cooking
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-blue-600">
              {preparingCount}
            </span>
          </div>

          <div className="flex min-w-[120px] flex-1 flex-col rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Ready
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-emerald-600">
              {readyCount}
            </span>
          </div>

          <div className="flex min-w-[120px] flex-1 flex-col rounded-2xl border border-border bg-card p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Delivered
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-foreground/80">
              {deliveredCount}
            </span>
          </div>
        </div>

        {/* Filter Tabs with touch-friendly pills */}
        <div className="mt-4 flex items-center justify-between gap-2 border-b border-border/80 pb-3">
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 py-1">
            {(
              [
                { id: "ALL", label: `All (${orders.length})` },
                { id: "NEW", label: `New (${newOrdersCount})` },
                { id: "PREPARING", label: `Cooking (${preparingCount})` },
                { id: "READY", label: `Ready (${readyCount})` },
                { id: "DELIVERED", label: `History (${deliveredCount})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 touch-manipulation shrink-0 ${
                  activeTab === t.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Orders List */}
        <div className="mt-5 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-3 font-display text-lg font-bold uppercase text-foreground">
                No orders in this view
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                New incoming orders will appear here automatically with live sound alerts.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => {
                const isBusy = actionBusyId === order.id;
                const status = order.status.toLowerCase();
                const totalInr = (order.total_paise / 100).toFixed(0);

                // Format timestamp
                const createdDate = new Date(order.created_at);
                const timeString = isNaN(createdDate.getTime())
                  ? ""
                  : createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                return (
                  <div
                    key={order.id}
                    className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:shadow-md"
                  >
                    <div>
                      {/* Order Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-xl font-bold tracking-tight text-primary">
                              #{order.order_number}
                            </span>
                            <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                              {timeString}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-foreground">
                            {order.customer_name}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {status === "new" || status === "pending_payment" ? (
                            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold uppercase text-amber-700">
                              Incoming
                            </span>
                          ) : status === "preparing" || status === "accepted" ? (
                            <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-bold uppercase text-blue-700">
                              Cooking
                            </span>
                          ) : status === "ready" || status === "ready_for_pickup" ? (
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold uppercase text-emerald-700">
                              Ready
                            </span>
                          ) : status === "picked_up" ? (
                            <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-[11px] font-bold uppercase text-purple-700">
                              Out
                            </span>
                          ) : (
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold uppercase text-muted-foreground">
                              {status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Customer Contact & Delivery Details */}
                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            {order.customer_phone}
                          </span>
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary active:scale-95 touch-manipulation transition-all"
                          >
                            <span>Call</span>
                          </a>
                        </div>

                        <div className="flex items-start gap-1.5 pt-1 text-[11px] leading-relaxed">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                          <span>
                            {order.delivery_address}
                            {order.landmark && (
                              <span className="text-foreground/80 font-medium">
                                {" "}
                                (Landmark: {order.landmark})
                              </span>
                            )}
                          </span>
                        </div>

                        {order.special_instructions && (
                          <div className="mt-2 rounded-xl bg-amber-500/10 p-2.5 text-[11px] font-medium text-amber-900 border border-amber-500/20">
                            <strong>Note:</strong> {order.special_instructions}
                          </div>
                        )}
                      </div>

                      {/* Ordered Items List */}
                      <div className="mt-4 rounded-2xl bg-muted/40 p-3 space-y-2 text-xs">
                        <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground block">
                          Items Ordered
                        </span>
                        {order.order_items && order.order_items.length > 0 ? (
                          order.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-foreground"
                            >
                              <div className="flex items-center gap-2">
                                <span className="grid h-5 w-5 place-items-center rounded bg-primary/15 text-[11px] font-bold text-primary">
                                  {item.quantity}×
                                </span>
                                <span className="font-medium">
                                  {item.product_name}
                                  {item.variant_name && (
                                    <span className="text-muted-foreground text-[11px]">
                                      {" "}
                                      ({item.variant_name})
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="font-semibold text-muted-foreground">
                                ₹{((item.unit_price_paise * item.quantity) / 100).toFixed(0)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-muted-foreground italic">
                            Order details confirmed
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer: Bill & Quick Action Buttons */}
                    <div className="mt-5 border-t border-border/60 pt-3.5">
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="text-muted-foreground">Total Paid:</span>
                        <span className="font-display text-lg font-bold text-foreground">
                          ₹{totalInr}
                        </span>
                      </div>

                      {/* Dynamic Advance Buttons */}
                      <div className="space-y-2">
                        {status === "new" || status === "pending_payment" ? (
                          <button
                            onClick={() => updateStatus(order.id, "preparing")}
                            disabled={isBusy}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 font-display text-xs uppercase tracking-wider text-white shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 touch-manipulation font-semibold"
                          >
                            {isBusy ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Flame className="h-4 w-4" />
                                <span>Accept &amp; Start Cooking</span>
                              </>
                            )}
                          </button>
                        ) : status === "preparing" || status === "accepted" ? (
                          <button
                            onClick={() => updateStatus(order.id, "ready_for_pickup")}
                            disabled={isBusy}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-display text-xs uppercase tracking-wider text-white shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 touch-manipulation font-semibold"
                          >
                            {isBusy ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Mark Order Ready</span>
                              </>
                            )}
                          </button>
                        ) : status === "ready" || status === "ready_for_pickup" ? (
                          <button
                            onClick={() => updateStatus(order.id, "picked_up")}
                            disabled={isBusy}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-display text-xs uppercase tracking-wider text-white shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 touch-manipulation font-semibold"
                          >
                            {isBusy ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                <span>Dispatch for Delivery</span>
                              </>
                            )}
                          </button>
                        ) : status === "picked_up" ? (
                          <button
                            onClick={() => updateStatus(order.id, "delivered")}
                            disabled={isBusy}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-display text-xs uppercase tracking-wider text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 touch-manipulation font-semibold"
                          >
                            {isBusy ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Mark as Delivered</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 py-2.5 rounded-xl">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Order Completed &amp; Delivered</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
