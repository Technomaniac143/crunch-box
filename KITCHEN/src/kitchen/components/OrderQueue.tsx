import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "../domain/types";
import { kolkataDateKey, sortByUrgency } from "../domain/rules";
import { OrderCard } from "./OrderCard";
import { AnimatedContent } from "@/components/reactbits";

export const TABS: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: "new", label: "New", statuses: ["new"] },
  {
    key: "ready",
    label: "Ready / Picked Up",
    statuses: ["ready_for_pickup", "picked_up", "accepted", "preparing"],
  },
  { key: "done", label: "Completed", statuses: ["delivered"] },
  {
    key: "issues",
    label: "Issues",
    statuses: ["rejected", "cancelled", "refund_pending", "refunded"],
  },
];

export function OrderQueue({
  orders,
  includeIssues = false,
}: {
  orders: Order[];
  includeIssues?: boolean;
}) {
  const [tab, setTab] = useState("new");
  const tabs = includeIssues ? TABS : TABS.filter((t) => t.key !== "issues");
  const current = (tabs.find((t) => t.key === tab) ?? tabs[0])!;
  const list = sortByUrgency(orders.filter((o) => current.statuses.includes(o.status)));

  return (
    <section>
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div role="tablist" className="flex w-max gap-2">
          {tabs.map((t) => {
            const n = orders.filter((o) => t.statuses.includes(o.status)).length;
            const active = t.key === current.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                  active
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-card text-foreground",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground",
                    t.key === "new" && n > 0 && !active && "bg-gold text-gold-foreground",
                  )}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
            No {current.label.toLowerCase()} orders right now.
          </p>
        ) : (
          list.map((o, idx) => (
            <AnimatedContent key={o.id} delay={Math.min(idx * 50, 200)}>
              <OrderCard order={o} />
            </AnimatedContent>
          ))
        )}
      </div>
    </section>
  );
}
