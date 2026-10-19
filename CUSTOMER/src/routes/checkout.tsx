import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, CreditCard, Banknote, Clock, AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";
import { inr } from "@/data/menu";
import { site } from "@/data/site";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { PageHeading } from "@/components/Sections";
import {
  createOrderServerFn,
  verifyPaymentServerFn,
  getBusinessStatusServerFn,
  DELIVERY_FEE_INR,
  type BusinessStatus,
} from "@/lib/orders-service";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Crunch Box" },
      { name: "description", content: "Complete your online order with secure prepaid checkout." },
      { property: "og:title", content: "Checkout — Crunch Box" },
      { property: "og:description", content: "Crunch Box checkout." },
    ],
  }),
  component: Checkout,
});

type Form = { name: string; phone: string; address: string; landmark: string; notes: string };

export function validateCheckout(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\s|^\+91/g, "")))
    e.phone = "Enter a valid 10-digit mobile number.";
  if (f.address.trim().length < 10) e.address = "Please enter your full delivery address.";
  return e;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [f, setF] = useState<Form>({ name: "", phone: "", address: "", landmark: "", notes: "" });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [payMethod, setPayMethod] = useState<"direct" | "razorpay">("direct");
  const [businessStatus, setBusinessStatus] = useState<BusinessStatus | null>(null);

  useEffect(() => {
    setMounted(true);
    void loadRazorpayScript();
    void getBusinessStatusServerFn()
      .then(setBusinessStatus)
      .catch(() => {
        setBusinessStatus({ isOpen: true, acceptingOrders: true, currentTimeIST: "" });
      });
  }, []);

  const errors = validateCheckout(f);
  const valid = Object.keys(errors).length === 0;
  const deliveryFee = site.deliveryFee || DELIVERY_FEE_INR;
  const total = subtotal + deliveryFee;

  if (!mounted)
    return <div className="mx-auto max-w-4xl px-4 py-10 text-muted-foreground">Loading…</div>;
  if (!items.length)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-3xl font-display uppercase">Nothing to check out</h1>
        <Link
          to="/menu"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-display uppercase text-primary-foreground hover:brightness-110"
        >
          Browse Menu
        </Link>
      </div>
    );

  const isStoreAvailable =
    businessStatus?.isOpen !== false && businessStatus?.acceptingOrders !== false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) {
      toast.error("Please fill in all required delivery details.");
      return;
    }
    if (!isStoreAvailable) {
      toast.error(businessStatus?.reason || "Ordering is currently unavailable.");
      return;
    }

    setBusy(true);

    try {
      // 1. Create order on server with authoritative pricing and business rules
      const orderPayload = {
        customer: f,
        items: items.map((i) => ({
          productId: i.productId,
          variant: i.variant,
          qty: i.qty,
        })),
      };

      const result = await createOrderServerFn({ data: orderPayload });

      // Save token locally for customer order history lookup
      try {
        const historyKey = "cb_recent_orders";
        const existing = JSON.parse(localStorage.getItem(historyKey) || "[]") as Array<{
          id: string;
          token: string;
        }>;
        const updated = [
          { id: result.orderId, token: result.accessToken },
          ...existing.filter((x) => x.id !== result.orderId),
        ].slice(0, 10);
        localStorage.setItem(historyKey, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }

      // 2. Direct Placement (Cash / UPI on Delivery) - Immediate confirmed placement
      if (payMethod === "direct") {
        toast.info("Sending order directly to kitchen...");
        await verifyPaymentServerFn({
          data: {
            orderId: result.orderId,
            accessToken: result.accessToken,
            razorpayPaymentId: `direct_${Date.now()}`,
            razorpayOrderId: result.razorpayOrderId,
          },
        });
        clear();
        toast.success("Order confirmed! Transmitted to kitchen.");
        navigate({
          to: "/order-success",
          search: { order_id: result.orderId, token: result.accessToken },
        });
        return;
      }

      // 3. Razorpay Standard Web Checkout Flow
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      if (result.totalPaise < 100) {
        toast.error("Order amount must be at least ₹1.00 (100 paise).");
        setBusy(false);
        return;
      }

      if (result.isLiveGateway && window.Razorpay) {
        const options = {
          key: result.razorpayKeyId,
          amount: result.totalPaise,
          currency: "INR",
          name: "Crunch Box",
          description: `Order ${result.orderNumber}`,
          order_id: result.razorpayOrderId,
          prefill: {
            name: f.name,
            contact: f.phone,
          },
          theme: {
            color: "#E11D48",
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await verifyPaymentServerFn({
                data: {
                  orderId: result.orderId,
                  accessToken: result.accessToken,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                },
              });
              clear();
              toast.success("Payment successful!");
              navigate({
                to: "/order-success",
                search: { order_id: result.orderId, token: result.accessToken },
              });
            } catch (err) {
              setBusy(false);
              toast.error(err instanceof Error ? err.message : "Payment verification failed.");
            }
          },
          modal: {
            ondismiss: () => {
              setBusy(false);
              toast.info("Payment window closed (cancelled by user).");
            },
          },
        };

        const rzp = new window.Razorpay(options);

        // Handle payment failure event (card declined, network drop, etc.)
        rzp.on(
          "payment.failed",
          (response: {
            error?: { description?: string; reason?: string; step?: string; code?: string };
          }) => {
            setBusy(false);
            const errorMsg =
              response?.error?.description ||
              response?.error?.reason ||
              "Payment failed. Please try again or use another payment method.";
            toast.error(errorMsg);
          },
        );

        rzp.open();
      } else {
        // Fallback for development / test mode when live keys are not configured
        toast.info("Processing order (simulated payment)...");
        await verifyPaymentServerFn({
          data: {
            orderId: result.orderId,
            accessToken: result.accessToken,
            razorpayPaymentId: `sim_pay_${Date.now()}`,
            razorpayOrderId: result.razorpayOrderId,
          },
        });
        clear();
        navigate({
          to: "/order-success",
          search: { order_id: result.orderId, token: result.accessToken },
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order.");
      setBusy(false);
    }
  };

  const field =
    "mt-1 w-full rounded-xl border bg-card px-3 py-2.5 outline-none focus:border-primary text-sm";
  const err = (k: keyof Form) =>
    touched && errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;
  const upd = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeading title="Checkout" sub="Fast delivery, fresh crunch." />

      {/* Store Availability Warning Banner */}
      {!isStoreAvailable && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Ordering Currently Unavailable</p>
            <p className="mt-0.5 text-xs opacity-90">
              {businessStatus?.reason || "Crunch Box is currently closed."}
            </p>
          </div>
        </div>
      )}

      {isStoreAvailable && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <span>
            Orders open today until{" "}
            <strong>
              {(() => {
                if (!businessStatus?.closingTime) return "3:00 AM";
                const [h = 0, m = 0] = businessStatus.closingTime.split(":").map(Number);
                const period = (h ?? 0) >= 12 ? "PM" : "AM";
                const h12 = (h ?? 0) % 12 || 12;
                const mStr = (m ?? 0).toString().padStart(2, "0");
                return `${h12}:${mStr} ${period}`;
              })()}{" "}
              IST
            </strong>
            . Standard preparation & delivery time: ~20-30 mins.
          </span>
        </div>
      )}

      <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-card">
          <h2 className="font-display text-xl font-bold">1. Delivery Details</h2>

          <label className="block text-sm font-semibold">
            Full Name <span className="text-destructive">*</span>
            <input
              className={field}
              value={f.name}
              onChange={upd("name")}
              autoComplete="name"
              placeholder="Arjun Mehta"
            />
            {err("name")}
          </label>

          <label className="block text-sm font-semibold">
            10-Digit Mobile Number <span className="text-destructive">*</span>
            <input
              className={field}
              value={f.phone}
              onChange={upd("phone")}
              inputMode="tel"
              autoComplete="tel"
              placeholder="9876543210"
            />
            {err("phone")}
          </label>

          <label className="block text-sm font-semibold">
            Delivery Address <span className="text-destructive">*</span>
            <textarea
              className={field}
              rows={3}
              value={f.address}
              onChange={upd("address")}
              autoComplete="street-address"
              placeholder="Flat / House no, Building name, Street, Area"
            />
            {err("address")}
          </label>

          <label className="block text-sm font-semibold">
            Landmark <span className="font-normal text-muted-foreground">(optional)</span>
            <input
              className={field}
              value={f.landmark}
              onChange={upd("landmark")}
              placeholder="Near Metro Pillar 112"
            />
          </label>

          <label className="block text-sm font-semibold">
            Delivery Instructions{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
            <textarea
              className={field}
              rows={2}
              value={f.notes}
              onChange={upd("notes")}
              placeholder="Ring bell twice, leave at door, etc."
            />
          </label>

          <div className="pt-2 border-t">
            <h2 className="font-display text-xl font-bold">2. Payment Method</h2>
            <div className="mt-3 grid gap-3">
              {/* Option 1: Direct Payment / COD */}
              <label
                onClick={() => setPayMethod("direct")}
                className={cn(
                  "cursor-pointer rounded-2xl border-2 p-4 transition-all flex items-start justify-between gap-3",
                  payMethod === "direct"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 bg-card",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">Pay on Delivery / Direct Confirmation</p>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Active
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Pay via Cash or UPI (GPay/PhonePe) directly to the delivery partner upon arrival.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payMethod"
                  value="direct"
                  checked={payMethod === "direct"}
                  onChange={() => setPayMethod("direct")}
                  className="mt-1 h-4 w-4 accent-primary"
                />
              </label>

              {/* Option 2: Razorpay Gateway */}
              <label
                onClick={() => setPayMethod("razorpay")}
                className={cn(
                  "cursor-pointer rounded-2xl border-2 p-4 transition-all flex items-start justify-between gap-3",
                  payMethod === "razorpay"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 bg-card",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">Online Prepaid via Razorpay</p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Prepaid
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      UPI, NetBanking, Debit/Credit Cards via Razorpay secure gateway.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payMethod"
                  value="razorpay"
                  checked={payMethod === "razorpay"}
                  onChange={() => setPayMethod("razorpay")}
                  className="mt-1 h-4 w-4 accent-primary"
                />
              </label>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t pt-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Real-time live kitchen dispatch enabled with instant order tracking.</span>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="h-fit rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold">Order Summary</h2>
          <ul className="mt-4 space-y-2.5 text-sm divide-y">
            {items.map((i) => (
              <li key={i.key} className="flex justify-between gap-2 pt-2.5 first:pt-0">
                <span className="min-w-0">
                  <span className="font-bold text-primary">{i.qty}×</span> {i.name}
                  <span className="block text-xs text-muted-foreground">({i.variant})</span>
                </span>
                <span className="font-semibold tabular-nums">{inr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items Subtotal</dt>
              <dd className="tabular-nums font-medium">{inr(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery Fee</dt>
              <dd className="tabular-nums font-medium">{inr(deliveryFee)}</dd>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <dt>Total Amount</dt>
              <dd className="text-primary tabular-nums">{inr(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={busy || !isStoreAvailable || (touched && !valid)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display text-base uppercase tracking-wider text-primary-foreground shadow-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              "Securing Order…"
            ) : !isStoreAvailable ? (
              "Ordering Paused"
            ) : payMethod === "direct" ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Confirm Order ({inr(total)})
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Pay {inr(total)} Online
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Orders enter the kitchen queue immediately after payment confirmation.
          </p>
        </aside>
      </form>
    </div>
  );
}
