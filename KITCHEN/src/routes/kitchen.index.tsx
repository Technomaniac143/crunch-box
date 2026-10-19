import { createFileRoute } from "@tanstack/react-router";
import { useKitchen } from "@/kitchen/KitchenProvider";
import { OrderQueue } from "@/kitchen/components/OrderQueue";
import { kolkataDateKey } from "@/kitchen/domain/rules";
import { cn } from "@/lib/utils";
import { SpotlightCard, CountUp, SplitText } from "@/components/reactbits";

export const Route = createFileRoute("/kitchen/")({
  head: () => ({
    meta: [
      { title: "Today · Crunch Box Kitchen" },
      { name: "description", content: "Live order queue for the Crunch Box kitchen." },
      { property: "og:title", content: "Today · Crunch Box Kitchen" },
      { property: "og:description", content: "Live order queue for the Crunch Box kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { orders, loading } = useKitchen();
  const today = kolkataDateKey(new Date());
  const isOrderToday = (o: (typeof orders)[number]) => {
    try {
      if (kolkataDateKey(o.createdAt) === today) return true;
      if (o.history && o.history.some((h) => h.at && kolkataDateKey(h.at) === today)) return true;
      const ageMs = Date.now() - new Date(o.createdAt).getTime();
      if (ageMs >= 0 && ageMs < 24 * 60 * 60 * 1000) return true;
    } catch {}
    return false;
  };
  const count = (s: string[]) => orders.filter((o) => s.includes(o.status)).length;
  const stats = [
    {
      label: "New",
      value: count(["new"]),
      cls: "text-primary",
      spotlight: "rgba(217, 40, 28, 0.16)",
      border: "rgba(217, 40, 28, 0.35)",
    },
    {
      label: "Ready / Picked Up",
      value: count(["ready_for_pickup", "picked_up", "accepted", "preparing"]),
      cls: "text-brand",
      spotlight: "rgba(255, 185, 40, 0.16)",
      border: "rgba(255, 185, 40, 0.35)",
    },
    {
      label: "Done today",
      value: orders.filter((o) => o.status === "delivered" && isOrderToday(o)).length,
      cls: "text-status-ready",
      spotlight: "rgba(74, 180, 100, 0.16)",
      border: "rgba(74, 180, 100, 0.35)",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <SpotlightCard
            key={s.label}
            spotlightColor={s.spotlight}
            borderColor={s.border}
            className="rounded-2xl border border-border p-3.5 shadow-card transition-all duration-300"
          >
            <div className={cn("font-display text-3xl font-bold leading-none", s.cls)}>
              {loading ? (
                "–"
              ) : (
                <CountUp to={s.value} duration={1.2} />
              )}
            </div>
            <div className="mt-1.5 text-[11px] font-semibold leading-tight text-foreground/80">
              {s.label}
            </div>
          </SpotlightCard>
        ))}
      </div>
      <h1 className="font-display text-2xl font-bold text-brand">
        <span className="brush-label">
          <SplitText text="Order queue" delay={35} />
        </span>
      </h1>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      ) : (
        <OrderQueue orders={orders} />
      )}
    </div>
  );
}
