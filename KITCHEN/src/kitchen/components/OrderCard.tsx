import { Link } from "@tanstack/react-router";
import { MapPin, Phone, MessageSquareText, BellRing, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "../domain/types";
import { TRANSITIONS, formatINR, formatTime, minutesAgo } from "../domain/rules";
import { useKitchen } from "../KitchenProvider";
import { ActionButton, PaymentBadge, StatusBadge } from "./ui";
import { SpotlightCard, ShinyText } from "@/components/reactbits";

export function OrderCard({ order }: { order: Order }) {
  const { unread, pending, updateStatus, acknowledge } = useKitchen();
  const isUnread = unread.has(order.id);
  const busy = pending.has(order.id);
  const actions = TRANSITIONS[order.status];
  const primary = actions.find((a) => a.tone === "primary");
  const showDelivery = order.status === "ready_for_pickup" || order.status === "picked_up";

  return (
    <SpotlightCard
      role="article"
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300",
        isUnread ? "border-gold ring-2 ring-gold/40" : "border-border",
      )}
      spotlightColor={isUnread ? "rgba(255, 185, 40, 0.22)" : "rgba(74, 32, 19, 0.08)"}
      borderColor={isUnread ? "rgba(255, 185, 40, 0.45)" : "rgba(74, 32, 19, 0.15)"}
    >
      {isUnread && (
        <button
          onClick={() => acknowledge(order.id)}
          className="flex w-full items-center justify-between bg-gold px-4 py-2 text-xs font-bold text-gold-foreground transition-all hover:brightness-105 active:scale-[0.99]"
        >
          <span className="flex items-center gap-2">
            <BellRing className="h-4 w-4 animate-bounce" />{" "}
            <ShinyText text="NEW ORDER" shimmerColor="rgba(255, 255, 255, 0.9)" />
          </span>
          <span className="underline underline-offset-2">Acknowledge</span>
        </button>
      )}
      <Link to="/kitchen/orders/$id" params={{ id: order.id }} className="block p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-xl font-bold text-brand">#{order.orderNumber}</div>
            <div className="text-xs text-muted-foreground">
              {formatTime(order.createdAt)} · {minutesAgo(order.createdAt)} min ago
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="mt-3 text-sm">
          <div className="font-semibold">{order.customerName}</div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" /> {order.customerPhone}
          </div>
          <div className="mt-1 flex gap-1 text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0">
              {order.deliveryAddress}
              {order.landmark && (
                <>
                  {" "}
                  · <em>{order.landmark}</em>
                </>
              )}
            </span>
          </div>
        </div>

        <ul className="mt-3 space-y-1 rounded-xl bg-muted p-3 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-2">
              <span className="min-w-0">
                <b className="text-primary">{i.quantity}×</b> {i.productName}
                {i.variantName && <span className="text-muted-foreground"> · {i.variantName}</span>}
              </span>
              <span className="shrink-0 tabular-nums">{formatINR(i.quantity * i.unitPrice)}</span>
            </li>
          ))}
        </ul>

        {order.specialInstructions && (
          <div className="mt-2 flex gap-2 rounded-xl border border-gold/60 bg-accent p-2.5 text-sm font-medium text-brand">
            <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0" /> {order.specialInstructions}
          </div>
        )}

        <dl className="mt-3 space-y-0.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Items</dt>
            <dd className="tabular-nums">{formatINR(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Delivery</dt>
            <dd className="tabular-nums">{formatINR(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatINR(order.total)}</dd>
          </div>
        </dl>
      </Link>

      {(primary || showDelivery) && (
        <div className="flex gap-2 border-t border-border p-3">
          {showDelivery && (
            <a
              href={`tel:${order.customerPhone}`}
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-border px-4 text-brand"
              aria-label="Call customer"
            >
              <Phone className="h-5 w-5" />
            </a>
          )}
          {primary && (
            <ActionButton
              block
              busy={busy}
              className={cn(
                primary.to === "delivered" &&
                  "bg-status-ready text-white hover:bg-status-ready/90 font-bold shadow-sm",
              )}
              onClick={() => updateStatus(order.id, primary.to)}
            >
              {busy ? (
                "Updating…"
              ) : (
                <span className="inline-flex items-center justify-center gap-1.5">
                  {primary.to === "delivered" && <Bike className="h-4 w-4" />}
                  {primary.label}
                </span>
              )}
            </ActionButton>
          )}
        </div>
      )}
    </SpotlightCard>
  );
}
