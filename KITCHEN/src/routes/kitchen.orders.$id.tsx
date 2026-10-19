import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Phone, Copy, MapPin, MessageSquareText, Check, Bike } from "lucide-react";
import { toast } from "sonner";
import { useKitchen } from "@/kitchen/KitchenProvider";
import { orderService } from "@/kitchen/services";
import type { Order } from "@/kitchen/domain/types";
import { STATUS_LABEL, TRANSITIONS, formatINR, formatTime } from "@/kitchen/domain/rules";
import { ActionButton, PaymentBadge, StatusBadge } from "@/kitchen/components/ui";

export const Route = createFileRoute("/kitchen/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order details · Crunch Box Kitchen" },
      { name: "description", content: "Order contents, delivery details and next actions." },
      { property: "og:title", content: "Order details · Crunch Box Kitchen" },
      { property: "og:description", content: "Order contents, delivery details and next actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { orders, pending, updateStatus, acknowledge } = useKitchen();
  const live = orders.find((o) => o.id === id);
  const [fetched, setFetched] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (!live) orderService.getOrder(id).then(setFetched);
    else acknowledge(id);
  }, [id, live, acknowledge]);

  const order = live ?? fetched;
  if (order === undefined) return <p className="text-sm text-muted-foreground">Loading order…</p>;
  if (order === null)
    return (
      <div className="py-12 text-center">
        <p className="font-semibold">Order not found.</p>
        <Link to="/kitchen" className="mt-4 inline-block font-bold text-primary">
          Back to queue
        </Link>
      </div>
    );

  const busy = pending.has(order.id);
  const actions = TRANSITIONS[order.status];

  async function copyAddress() {
    if (!order) return;
    const text = `${order.deliveryAddress}${order.landmark ? ` (${order.landmark})` : ""}`;
    await navigator.clipboard?.writeText(text);
    toast.success("Address copied");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-28">
      <Link
        to="/kitchen"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold text-brand">#{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Received {formatTime(order.createdAt)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
      </div>

      <Section title="Items">
        <ul className="divide-y divide-border">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="font-semibold">
                  <span className="text-primary">{i.quantity}×</span> {i.productName}
                </div>
                {i.variantName && (
                  <div className="text-sm text-muted-foreground">
                    {i.variantName} · {formatINR(i.unitPrice)} each
                  </div>
                )}
              </div>
              <div className="shrink-0 font-semibold tabular-nums">
                {formatINR(i.quantity * i.unitPrice)}
              </div>
            </li>
          ))}
        </ul>
        {order.specialInstructions && (
          <div className="mt-3 flex gap-2 rounded-xl border border-gold/60 bg-accent p-3 text-sm font-semibold text-brand">
            <MessageSquareText className="h-4 w-4 shrink-0" /> {order.specialInstructions}
          </div>
        )}
      </Section>

      <Section title="Delivery">
        <div className="font-semibold">{order.customerName}</div>
        <div className="mt-1 flex gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            {order.deliveryAddress}
            {order.landmark && <div className="italic">Landmark: {order.landmark}</div>}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={`tel:${order.customerPhone}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-3 text-sm font-bold text-brand-foreground"
          >
            <Phone className="h-4 w-4" /> {order.customerPhone}
          </a>
          <ActionButton tone="ghost" onClick={copyAddress}>
            <Copy className="h-4 w-4" /> Copy address
          </ActionButton>
        </div>
      </Section>

      <Section title="Payment">
        <dl className="space-y-1 text-sm">
          <Row label="Items subtotal" value={formatINR(order.subtotal)} />
          <Row label="Delivery fee" value={formatINR(order.deliveryFee)} />
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <dt>Order total</dt>
            <dd className="tabular-nums">{formatINR(order.total)}</dd>
          </div>
          {order.refundAmount != null && (
            <Row label="Refund amount" value={formatINR(order.refundAmount)} />
          )}
          {order.paymentReference && <Row label="Payment ref" value={order.paymentReference} />}
        </dl>
      </Section>

      <Section title="Timeline">
        <ol className="space-y-2 text-sm">
          {order.history.map((h, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-status-ready" />
              <span className="font-semibold">{STATUS_LABEL[h.status]}</span>
              <span className="text-muted-foreground">{formatTime(h.at)}</span>
            </li>
          ))}
        </ol>
      </Section>

      {actions.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-card/95 p-3 backdrop-blur md:bottom-0">
          <div className="mx-auto flex max-w-2xl gap-2">
            {actions.map((a) => (
              <ActionButton
                key={a.to}
                tone={a.tone === "danger" ? "danger" : "primary"}
                busy={busy}
                className={cn(
                  a.tone === "primary" ? "flex-1" : "",
                  a.to === "delivered" &&
                    "bg-status-ready text-white hover:bg-status-ready/90 font-bold shadow-sm",
                )}
                onClick={() => {
                  if (
                    a.tone === "danger" &&
                    !confirm(
                      `${a.label} order ${order.orderNumber}? The customer will need a refund.`,
                    )
                  )
                    return;
                  updateStatus(order.id, a.to);
                }}
              >
                {a.to === "delivered" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Bike className="h-4 w-4" /> {a.label}
                  </span>
                ) : (
                  a.label
                )}
              </ActionButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h2 className="font-display mb-2 text-sm font-semibold text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
