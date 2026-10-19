import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/Sections";
import { site } from "@/data/site";
import { ShieldCheck, Lock, Eye, Server, PhoneCall } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Crunch Box" },
      {
        name: "description",
        content: "Crunch Box privacy policy and customer data protection standards.",
      },
      { property: "og:title", content: "Privacy Policy — Crunch Box" },
      { property: "og:description", content: "Crunch Box privacy policy." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <PageHeading
        title="Privacy Policy"
        sub="Your privacy and personal data protection are fundamental to our food delivery service."
      />

      {/* Trust & Security Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-xs">
          <Lock className="h-6 w-6 text-primary shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-foreground">Encrypted Data</div>
            <div className="text-muted-foreground">HTTPS &amp; Secure Cloud</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-xs">
          <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-foreground">PCI-DSS Compliant</div>
            <div className="text-muted-foreground">Via Razorpay Gateway</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-xs">
          <Eye className="h-6 w-6 text-primary shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-foreground">No Third-Party Ads</div>
            <div className="text-muted-foreground">We never sell your data</div>
          </div>
        </div>
      </div>

      <div className="space-y-6 text-foreground/90 text-sm leading-relaxed">
        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">1. Scope &amp; Data Controller</h2>
          <p>
            This Privacy Policy describes how <strong>{site.fssai.fboName}</strong> (FSSAI Reg. No. {site.fssai.registrationNumber}, situated at {site.contact.address}) collects, utilizes, and safeguards your information when you access our online food ordering platform.
          </p>
        </section>

        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">2. Information We Collect</h2>
          <p>To fulfill your food delivery promptly and accurately, we collect:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Customer Name:</strong> To address your order and verify handover.</li>
            <li><strong>Contact Phone Number:</strong> For delivery rider coordination and order status updates.</li>
            <li><strong>Delivery Address &amp; Landmarks:</strong> To navigate to your door within our {site.deliveryPromise} window.</li>
            <li><strong>Special Instructions:</strong> Any dietary or delivery notes you provide.</li>
          </ul>
        </section>

        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">3. Payment Information Security</h2>
          <p>
            When completing your payment online, transactions are processed directly by our PCI-DSS certified payment processor, <strong>Razorpay Software Private Limited</strong>.
          </p>
          <p className="text-muted-foreground text-xs">
            Crunch Box does NOT store credit/debit card numbers, CVVs, expiry dates, or net banking passwords on its servers. We only receive verification tokens confirming transaction status.
          </p>
        </section>

        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">4. Real-time Order Communication</h2>
          <p>
            Our application utilizes secure real-time WebSocket connections (powered by Supabase) to relay kitchen progress (Accepted &rarr; Preparing &rarr; Ready for Pickup &rarr; Picked Up &rarr; Delivered) directly to your browser without polling or data interception.
          </p>
        </section>

        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">5. Local Storage &amp; Session Cookies</h2>
          <p>
            We use browser Local Storage exclusively for operational convenience:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Persisting your selected items in your shopping cart across page navigation.</li>
            <li>Retaining your active order token so you can revisit your live order tracker.</li>
          </ul>
        </section>

        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">6. Contact Data Privacy Officer</h2>
          <p>
            If you have questions regarding your data or wish to request data deletion, contact us:
          </p>
          <div className="mt-2 space-y-1 rounded-xl bg-subtle p-3 text-xs">
            <div><strong>Entity:</strong> {site.fssai.fboName}</div>
            <div><strong>FSSAI Registration No.:</strong> {site.fssai.registrationNumber}</div>
            <div><strong>Contact:</strong> {site.contact.phoneDisplay}</div>
            <div><strong>Email:</strong> <a href={`mailto:${site.contact.email}`} className="text-primary underline">{site.contact.email}</a></div>
            <div><strong>Address:</strong> {site.contact.address}</div>
            <div><strong>Landmarks:</strong> Outside Wingz Badminton Academy · Adj. Pooja Supermarket · Opp. Gem Groove</div>
          </div>
        </section>
      </div>
    </div>
  );
}
