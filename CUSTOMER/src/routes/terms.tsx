import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/Sections";
import { site } from "@/data/site";
import { ShieldCheck, FileText, Clock, MapPin } from "lucide-react";
import { useBusinessStatus } from "@/lib/business-context";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Crunch Box" },
      {
        name: "description",
        content:
          "Official Terms and Conditions for Crunch Box food ordering and delivery services.",
      },
      { property: "og:title", content: "Terms & Conditions — Crunch Box" },
      { property: "og:description", content: "Crunch Box terms and conditions." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { hoursLong, deliveryFee } = useBusinessStatus();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <PageHeading
        title="Terms & Conditions"
        sub="Please review the terms governing orders, deliveries, and services provided by Crunch Box."
      />

      {/* FSSAI Registration Badge */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-primary/20 bg-card p-5 shadow-sm">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div className="space-y-0.5">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            FSSAI Registered Food Business Operator
          </div>
          <div className="font-display text-lg font-bold text-foreground">
            FSSAI Reg. No. {site.fssai.registrationNumber}
          </div>
          <div className="text-xs text-muted-foreground">
            Issued by Government of Tamil Nadu (Food Safety Wing) under Food Safety &amp; Standards
            Act, 2006
          </div>
        </div>
      </div>

      <div className="space-y-6 text-foreground/90 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">1. Business Entity &amp; Scope</h2>
          <p>
            These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern the use of the website and online food ordering
            services operated by <strong>{site.fssai.fboName}</strong> (&ldquo;Crunch Box&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;),
            a registered Food Vending Establishment under the Food Safety and Standards Authority of India (FSSAI).
          </p>
          <div className="mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
            <span>
              <strong>Registered Premises:</strong> {site.contact.address}
            </span>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">2. Operating Hours &amp; Service Availability</h2>
          <p>
            Crunch Box specializes in late-night food delivery operating during:
          </p>
          <div className="flex items-center gap-2 font-semibold text-foreground py-1">
            <Clock className="h-4 w-4 text-primary" /> {hoursLong} (Indian Standard Time)
          </div>
          <p className="text-muted-foreground text-xs">
            Orders can only be placed when our kitchen is active and accepting orders. We reserve the right to temporarily pause orders during severe weather, peak kitchen demand, or technical maintenance.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">3. Menu, Pricing &amp; Taxes</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>All menu prices are displayed in Indian Rupees (INR ₹) and include applicable GST/taxes unless explicitly noted otherwise.</li>
            <li>A fixed delivery fee of ₹{deliveryFee} is applied to all online delivery orders to cover logistics and packing.</li>
            <li>Items are subject to availability. If a specific ingredient or variant is unavailable after order placement, our kitchen will notify you immediately.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">4. Payment Processing</h2>
          <p>
            Online payments are securely processed through our authorized payment gateway partner, <strong>Razorpay</strong>, supporting:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Unified Payments Interface (UPI via Google Pay, PhonePe, Paytm, BHIM)</li>
            <li>Debit and Credit Cards (Visa, Mastercard, RuPay)</li>
            <li>Net Banking across major Indian scheduled banks</li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            Crunch Box does not store your card details, CVV, or banking PINs. All payment transactions comply with RBI mandates and PCI-DSS standards.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">5. Order Confirmation &amp; Live Tracking</h2>
          <p>
            Once payment is authorized, your order status updates to <strong>Prepaid &amp; Confirmed</strong>. Customers receive an order reference number (e.g. <code>CB-XXXX</code>) and access to our real-time status tracker monitoring preparation, dispatch, and delivery.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">6. Cancellations &amp; Refund Policy</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Kitchen Rejection / Inability to Serve:</strong> If the kitchen is unable to fulfill an order due to stock out or delivery constraints, a 100% full refund is automatically initiated immediately.</li>
            <li><strong>Customer Cancellations:</strong> Because food preparation begins immediately upon order receipt to fulfill our {site.deliveryPromise} promise, cancellations cannot be made once food preparation has started.</li>
            <li><strong>Refund Timeline:</strong> Approved refunds are credited back to the original source payment method within 5 to 7 business days per banking and Razorpay settlement protocols.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">7. Food Safety &amp; Quality Commitment</h2>
          <p>
            We adhere strictly to the hygiene, storage, and handling standards mandated by the Food Safety and Standards Authority of India (FSSAI). All food is prepared fresh in sanitized premises and packed in food-grade tamper-evident packaging.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-2 rounded-2xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-xl font-bold text-brand">8. Grievance &amp; Customer Support</h2>
          <p>
            For order inquiries, delivery coordination, or feedback, please reach out to our team:
          </p>
          <div className="mt-2 space-y-1 rounded-xl bg-subtle p-3 text-xs">
            <div><strong>FBO Name:</strong> {site.fssai.fboName}</div>
            <div><strong>FSSAI Registration No.:</strong> {site.fssai.registrationNumber}</div>
            <div><strong>Contact Person:</strong> {site.contact.contactPerson}</div>
            <div><strong>Phone / WhatsApp:</strong> <a href={`tel:${site.contact.phone}`} className="text-primary underline">{site.contact.phoneDisplay}</a></div>
            <div><strong>Email:</strong> <a href={`mailto:${site.contact.email}`} className="text-primary underline">{site.contact.email}</a></div>
            <div><strong>Operational Location:</strong> {site.contact.address}</div>
            <div><strong>Landmarks:</strong> Outside Wingz Badminton Academy · Adjacent to Pooja Supermarket · Opp. Gem Groove</div>
            <div><strong>Registered Premise:</strong> {site.fssai.registeredAddress}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
