import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { orderService } from "@/kitchen/services";
import type { Order } from "@/kitchen/domain/types";
import { formatINR, formatTime, kolkataDateKey } from "@/kitchen/domain/rules";
import { PaymentBadge, StatusBadge } from "@/kitchen/components/ui";
import { useKitchen } from "@/kitchen/KitchenProvider";

export const Route = createFileRoute("/kitchen/history")({
  head: () => ({
    meta: [
      { title: "History · Crunch Box Kitchen" },
      { name: "description", content: "Search past Crunch Box orders and daily summaries." },
      { property: "og:title", content: "History · Crunch Box Kitchen" },
      { property: "og:description", content: "Search past Crunch Box orders and daily summaries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { demoEnabled } = useKitchen();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(kolkataDateKey(new Date()));
  const [rows, setRows] = useState<Order[] | null>(null);

  useEffect(() => {
    setRows(null);
    const t = setTimeout(
      () => orderService.listOrderHistory({ search, date: date || undefined }).then(setRows),
      250,
    );
    return () => clearTimeout(t);
  }, [search, date, demoEnabled]);

  const list = rows ?? [];
  const delivered = list.filter((o) => o.status === "delivered");
  const orderValue = delivered.reduce((s, o) => s + o.total, 0);
  const refunds = list.reduce((s, o) => s + (o.refundAmount ?? 0), 0);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-brand">
        <span className="brush-label">Order history</span>
      </h1>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <label className="relative">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order number or phone"
            className="min-h-12 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-base outline-none focus:border-primary"
          />
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-12 flex-1 rounded-xl border border-border bg-card px-3 text-base"
          />
          <button
            onClick={() => setDate("")}
            className="min-h-12 rounded-xl border border-border bg-card px-3 text-sm font-semibold"
          >
            All dates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Orders" value={String(list.length)} />
        <Stat label="Delivered value" value={formatINR(orderValue)} />
        <Stat label="Refunds" value={formatINR(refunds)} />
      </div>
      <p className="text-xs text-muted-foreground">
        Delivered value is the total customers paid for delivered orders, not profit.
      </p>

      {rows === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No orders match.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {list.map((o) => (
            <li key={o.id}>
              <Link
                to="/kitchen/orders/$id"
                params={{ id: o.id }}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-4 hover:bg-muted"
              >
                <div className="min-w-0">
                  <div className="font-display font-bold text-brand">#{o.orderNumber}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {kolkataDateKey(o.createdAt)} · {formatTime(o.createdAt)} · {o.customerPhone}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <StatusBadge status={o.status} />
                    <PaymentBadge status={o.paymentStatus} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold tabular-nums">{formatINR(o.total)}</div>
                  {o.refundAmount != null && (
                    <div className="text-xs text-primary">Refund {formatINR(o.refundAmount)}</div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
      <div className="font-display truncate text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
    </div>
  );
}
