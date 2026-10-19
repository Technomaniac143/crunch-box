import { createFileRoute } from "@tanstack/react-router";
import { ChefHat, ExternalLink, Clock, ShieldCheck, Flame } from "lucide-react";
import { PageHeading } from "@/components/Sections";
import { site } from "@/data/site";

export const Route = createFileRoute("/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen Staff Portal — Crunch Box" },
      { name: "description", content: "Crunch Box Kitchen Display System (KDS) & Order Dispatch Portal." },
    ],
  }),
  component: KitchenPortalRoute,
});

function KitchenPortalRoute() {
  const localKitchenUrl = "http://localhost:8081/kitchen";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeading
        title="Kitchen Staff Portal"
        sub="Live Kitchen Display System (KDS), Order Dispatch & Management"
      />

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Main KDS Card */}
        <div className="rounded-3xl border-2 border-primary/30 bg-card p-6 shadow-card hover:border-primary transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ChefHat className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide">
            Live KDS Board
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Real-time visual order queue with audio chimes, preparation timers, status advancement, and live Supabase Realtime synchronization.
          </p>
          <a
            href={localKitchenUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-display text-sm uppercase tracking-wider text-primary-foreground shadow-md transition hover:brightness-110 active:scale-95"
          >
            <span>Launch Kitchen KDS (Port 8081)</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Operating Rules & Settings Card */}
        <div className="rounded-3xl border bg-card p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide">
              Store Schedule & Dispatch
            </h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">Standard Hours:</span>
                <span className="font-semibold text-primary">{site.hoursLong}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">Kitchen Location:</span>
                <span className="font-semibold text-right text-xs">Outside Wingz Academy, Padur</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">Primary Contact:</span>
                <span className="font-semibold">Amalan (+91 63697 15501)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Staff authentication & role validation enforced on the KDS portal.</span>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border bg-muted/30 p-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Flame className="h-4 w-4 text-primary" />
          <span>Quick Staff Navigation</span>
        </div>
        <p className="mt-1">
          When running locally or on the kitchen tablet, the dispatch terminal runs dedicated on port <strong>8081</strong>. For production deployment, ensure the kitchen application is linked to the active Supabase project.
        </p>
      </div>
    </div>
  );
}
