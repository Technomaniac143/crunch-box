import { createFileRoute } from "@tanstack/react-router";
import { useKitchen } from "@/kitchen/KitchenProvider";
import { OrderQueue } from "@/kitchen/components/OrderQueue";

export const Route = createFileRoute("/kitchen/orders/")({
  head: () => ({
    meta: [
      { title: "Orders · Crunch Box Kitchen" },
      { name: "description", content: "All of today's Crunch Box orders by status." },
      { property: "og:title", content: "Orders · Crunch Box Kitchen" },
      { property: "og:description", content: "All of today's Crunch Box orders by status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { orders, loading } = useKitchen();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-brand">
        <span className="brush-label">All orders today</span>
      </h1>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      ) : (
        <OrderQueue orders={orders} includeIssues />
      )}
    </div>
  );
}
