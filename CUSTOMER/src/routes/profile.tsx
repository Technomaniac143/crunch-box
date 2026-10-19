import { createFileRoute, Link } from "@tanstack/react-router";
import { User } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Crunch Box" },
      { name: "description", content: "Your Crunch Box profile." },
      { property: "og:title", content: "Profile — Crunch Box" },
      { property: "og:description", content: "Your Crunch Box profile." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary">
        <User className="h-10 w-10 text-brand" />
      </span>
      <h1 className="mt-4 text-3xl">Guest</h1>
      <p className="mt-2 text-muted-foreground">
        Accounts are coming soon. You can order as a guest anytime.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/cart"
          className="rounded-lg border-2 border-brand px-5 py-2.5 font-display uppercase text-brand"
        >
          View Cart
        </Link>
        <Link
          to="/menu"
          className="rounded-lg bg-primary px-5 py-3 font-display uppercase text-primary-foreground"
        >
          Order Now
        </Link>
      </div>
    </div>
  ),
});
