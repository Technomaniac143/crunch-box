import { Link } from "@tanstack/react-router";
import { site } from "@/data/site";
import { categories } from "@/data/menu";
import { navLinks } from "./Header";
import { Logo } from "./Logo";
import { ShieldCheck, ExternalLink, ChefHat } from "lucide-react";

export function Footer() {
  const { phone, email, address } = site.contact;

  return (
    <footer className="mt-16 bg-brand pb-24 text-brand-foreground lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-brand-foreground/75">
            Bold flavours, crispy perfection, and unforgettable crunch — delivered fresh every night.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-brand-foreground/80">
            <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
            <span>FSSAI Reg. No: <strong>{site.fssai.registrationNumber}</strong></span>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-accent font-display text-base">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-accent transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-accent font-display text-base">Menu Categories</h3>
          <ul className="space-y-2 text-sm">
            {categories
              .filter((c) => c.id !== "all")
              .map((c) => (
                <li key={c.id}>
                  <Link to="/menu" search={{ cat: c.id }} className="hover:text-accent transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div className="space-y-2 text-sm">
          <h3 className="mb-3 text-accent font-display text-base">Kitchen &amp; Contact</h3>
          <p className="font-semibold text-accent/90">Open {site.hoursLong}</p>
          {phone && (
            <p>
              <a href={`tel:${phone}`} className="hover:text-accent font-medium">
                {site.contact.phoneDisplay || phone}
              </a>
            </p>
          )}
          {email && (
            <p>
              <a href={`mailto:${email}`} className="hover:text-accent">
                {email}
              </a>
            </p>
          )}
          {address && (
            <div className="space-y-1 text-xs text-brand-foreground/75 leading-relaxed">
              <p className="font-medium text-brand-foreground/90">{address}</p>
              <p className="text-[11px] text-accent/80 font-medium">
                Landmarks: Outside Wingz Badminton Academy · Adj. Pooja Supermarket · Opp. Gem Groove
              </p>
            </div>
          )}
          {site.social.length > 0 && (
            <div className="flex gap-3 pt-2">
              {site.social.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent text-xs underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
          <div className="pt-2">
            <Link
              to="/kitchen"
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25 active:scale-95 transition-all shadow-sm"
            >
              <ChefHat className="h-3.5 w-3.5" />
              <span>Staff Kitchen Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-brand-foreground/70">
          <p>© {new Date().getFullYear()} Crunch Box (FSSAI Reg. {site.fssai.registrationNumber}). All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-accent">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-accent">
              Terms &amp; Conditions
            </Link>
            <Link
              to="/kitchen"
              className="hover:text-accent flex items-center gap-1 font-semibold text-accent active:scale-95 transition-all"
            >
              <ChefHat className="h-3.5 w-3.5" />
              Kitchen KDS ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
