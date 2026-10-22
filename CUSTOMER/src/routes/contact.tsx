import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone, ShieldCheck, Navigation, MessageCircle } from "lucide-react";
import { PageHeading } from "@/components/Sections";
import { site } from "@/data/site";
import { SpotlightCard } from "@/components/reactbits";
import { useBusinessStatus } from "@/lib/business-context";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Location — Crunch Box" },
      {
        name: "description",
        content:
          "Visit Crunch Box outside Wingz Badminton Academy, Padur (OMR) or call Amalan at +91 63697 15501.",
      },
      { property: "og:title", content: "Contact Us & Location — Crunch Box" },
      {
        property: "og:description",
        content: "Locate Crunch Box in Padur, OMR or reach out directly to Amalan.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const c = site.contact;
  const { hours, hoursLong } = useBusinessStatus();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <PageHeading
        title="Contact & Location"
        sub="Hungry with a question or picking up your order? Here is where to find us in Padur."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Person & Call Card */}
        <SpotlightCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-muted-foreground">Direct Line & WhatsApp</span>
              <h2 className="text-xl font-bold text-foreground">{c.contactPerson}</h2>
            </div>
          </div>

          <div className="rounded-xl bg-muted/60 p-4 space-y-2">
            <div className="text-2xl font-mono font-bold text-primary">
              {c.phone}
            </div>
            <p className="text-xs text-muted-foreground">
              Call or message for order status, quick pickup coordination, or catering inquiries.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={`tel:${c.phone}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>
            <a
              href={`https://wa.me/916369715501?text=Hi%20Amalan,%20I%20have%20an%20order%20query%20for%20Crunch%20Box`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500/20"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Amalan
            </a>
          </div>
        </SpotlightCard>

        {/* Operating Hours & Email Card */}
        <SpotlightCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-muted-foreground">Kitchen Timing</span>
              <h2 className="text-xl font-bold text-foreground">{hours}</h2>
            </div>
          </div>

          <div className="rounded-xl bg-muted/60 p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">{hoursLong}</p>
            <p className="text-xs text-muted-foreground">
              Hot fries and crispy sides served fresh during kitchen operating hours.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <span>Support: </span>
            <a href={`mailto:${c.email}`} className="text-primary hover:underline font-medium">
              {c.email}
            </a>
          </div>
        </SpotlightCard>
      </div>

      {/* Prominent Physical Location & Landmark Guide */}
      <SpotlightCard className="p-6 space-y-4 border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-muted-foreground">Exact Physical Location</span>
              <h2 className="text-xl font-bold text-foreground">Crunch Box Kitchen</h2>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500">
            Padur, OMR
          </span>
        </div>

        <div className="rounded-xl bg-muted/60 p-4 space-y-3">
          <p className="text-base font-semibold text-foreground leading-snug">
            {c.address}
          </p>

          <div className="border-t border-border pt-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Navigation Landmarks:</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-card p-2.5 border text-xs">
                <span className="block font-bold text-foreground">🏸 Outside</span>
                <span className="text-muted-foreground">Wingz Badminton Academy</span>
              </div>
              <div className="rounded-lg bg-card p-2.5 border text-xs">
                <span className="block font-bold text-foreground">🛒 Adjacent to</span>
                <span className="text-muted-foreground">Pooja Supermarket, Padur</span>
              </div>
              <div className="rounded-lg bg-card p-2.5 border text-xs">
                <span className="block font-bold text-foreground">🏢 Opposite to</span>
                <span className="text-muted-foreground">Gem Groove Apartments</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Navigation className="h-4 w-4 text-primary shrink-0" />
            Rajiv Gandhi Salai (OMR IT Expressway), Padur, Chennai - 603103
          </span>
          <a
            href="https://maps.google.com/?q=Wingz+Badminton+Academy+Padur+Chennai"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold"
          >
            Open in Google Maps →
          </a>
        </div>
      </SpotlightCard>

      {/* FSSAI Badge */}
      <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-card p-5 shadow-xs">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-foreground uppercase tracking-wider">
            Food Safety and Standards Authority of India (FSSAI)
          </div>
          <div className="font-display text-base font-bold text-primary">
            Registration No: {site.fssai.registrationNumber}
          </div>
          <div className="text-muted-foreground">
            Registered Food Vending Establishment · Valid thru {site.fssai.validUpto} · Govt. of Tamil Nadu
          </div>
          <div className="text-[11px] text-muted-foreground">
            Registered Premise: {site.fssai.registeredAddress}
          </div>
        </div>
      </div>
    </div>
  );
}
