import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Award, MapPin, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { AboutBlock, Benefits } from "@/components/Sections";
import { site } from "@/data/site";
import { SpotlightCard, ShinyText } from "@/components/reactbits";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us & FSSAI Standards — Crunch Box" },
      {
        name: "description",
        content:
          "Crispy perfection, late-night cravings, and government-certified food hygiene. Learn about Crunch Box and our FSSAI-registered cloud kitchen.",
      },
      { property: "og:title", content: "About Us — Crunch Box" },
      { property: "og:description", content: "The Crunch Box story and food safety commitment." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-10">
      <AboutBlock showCta={false} />

      {/* Official FSSAI Registration & Food Safety Standards */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="brush text-sm">Food Safety & Standards</span>
          <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Certified Kitchen & Hygiene Standards
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Crunch Box operates out of a dedicated, hygiene-first cloud kitchen licensed under the Food Safety and Standards Act, 2006.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <SpotlightCard className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold">FSSAI Certified</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Official registration under Food Safety and Standards Authority of India (FSS Act, 2006).
            </p>
            <div className="mt-4 rounded-lg bg-muted/60 p-3">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">Reg No.</span>
              <p className="font-mono text-sm font-bold text-foreground">{site.fssai.regNumber}</p>
              <p className="mt-1 text-xs text-muted-foreground">{site.fssai.authority}</p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Kitchen Location</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {site.contact.address}
            </p>
            <div className="mt-4 rounded-lg bg-muted/60 p-3 space-y-1">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">Key Landmarks</span>
              <p className="text-xs font-semibold text-foreground">
                Outside Wingz Badminton Academy · Adj. Pooja Supermarket · Opp. Gem Groove
              </p>
              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
                Registered Premise: {site.fssai.registeredAddress}
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Quality & Freshness</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Every order is fried hot to order with dedicated fryer cycles and pure, quality cooking oils.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Zero reused or stale oil
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Sealed food-grade heat retention boxes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Daily kitchen sanitation & temperature audits
              </li>
            </ul>
          </SpotlightCard>
        </div>
      </section>

      <Benefits />

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <p className="font-script text-3xl text-primary sm:text-4xl">
          {site.tagline}
        </p>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Late Night Operations · Open Daily {site.hours} · OMR, Chennai
        </p>
      </div>
    </div>
  ),
});
