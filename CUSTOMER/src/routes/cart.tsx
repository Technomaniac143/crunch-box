import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { inr } from "@/data/menu";
import { site } from "@/data/site";
import { useCart } from "@/lib/cart";
import { PageHeading } from "@/components/Sections";
import { useBusinessStatus } from "@/lib/business-context";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Crunch Box" },
      { name: "description", content: "Review your Crunch Box order." },
      { property: "og:title", content: "Your Cart — Crunch Box" },
      { property: "og:description", content: "Review your Crunch Box order." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQty, remove, clear } = useCart();
  const { deliveryFee, isOpen, acceptingOrders, reason, hours } = useBusinessStatus();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted)
    return <div className="mx-auto max-w-4xl px-4 py-10 text-muted-foreground">Loading cart…</div>;

  if (!items.length)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-accent" strokeWidth={1.25} />
        <h1 className="mt-4 text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Those fries won't order themselves.</p>
        <Link
          to="/menu"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-display uppercase text-primary-foreground"
        >
          Browse Menu
        </Link>
      </div>
    );

  const total = subtotal + deliveryFee;
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <div>
        <PageHeading title="Your Cart" />
        <ul className="space-y-3">
          {items.map((i) => (
            <li
              key={i.key}
              className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card p-3 shadow-card"
            >
              <img
                src={i.image}
                alt=""
                loading="lazy"
                decoding="async"
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{i.name}</p>
                <p className="text-xs text-muted-foreground">
                  {i.variant} · {inr(i.price)}
                </p>
                <div className="mt-2 flex w-fit items-center gap-1 rounded-full border">
                  <button
                    aria-label={`Decrease ${i.name}`}
                    onClick={() => setQty(i.key, i.qty - 1)}
                    className="p-1.5"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                  <button
                    aria-label={`Increase ${i.name}`}
                    onClick={() => setQty(i.key, i.qty + 1)}
                    className="p-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-display text-lg text-primary">{inr(i.price * i.qty)}</span>
                <button
                  aria-label={`Remove ${i.name}`}
                  onClick={() => remove(i.key)}
                  className="p-1 text-muted-foreground hover:text-primary"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={() => {
            if (confirm("Clear all items from your cart?")) clear();
          }}
          className="mt-4 text-sm font-semibold text-muted-foreground underline hover:text-primary"
        >
          Clear cart
        </button>
      </div>
      <aside className="h-fit rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-24">
        <h2 className="text-xl">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{inr(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{deliveryFee ? inr(deliveryFee) : "Free"}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd className="text-primary">{inr(total)}</dd>
          </div>
        </dl>
        {(!acceptingOrders || !isOpen) && (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs font-medium text-primary">
            {reason || `Kitchen is currently closed. Operating hours: ${hours}`}
          </div>
        )}
        <Link
          to="/checkout"
          className="mt-5 block rounded-lg bg-primary py-3 text-center font-display uppercase text-primary-foreground hover:brightness-110"
        >
          Checkout
        </Link>
        <Link to="/menu" className="mt-2 block py-2 text-center text-sm font-semibold text-primary">
          Add more items
        </Link>
      </aside>
    </div>
  );
}
