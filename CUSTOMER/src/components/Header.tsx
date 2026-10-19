import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { Magnet } from "./reactbits/Magnet";

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/combos", label: "Combos" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function CartBadge() {
  const { count } = useCart();
  return (
    <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground transition-transform duration-200 hover:scale-110 active:scale-90">
      {count}
    </span>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/menu", search: { q: q.trim() || undefined } });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2 lg:flex lg:justify-between">
        <button className="p-2 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex justify-center lg:justify-start">
          <Logo size="sm" />
        </div>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="py-1 text-sm font-semibold text-foreground/80 transition-colors hover:text-primary data-[status=active]:border-b-2 data-[status=active]:border-primary data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <form onSubmit={submit} className="relative hidden xl:block" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for your favorites..."
              aria-label="Search menu"
              className="h-10 w-60 rounded-full border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
            />
          </form>
          <Link to="/cart" aria-label="Cart" className="relative p-1">
            <ShoppingCart className="h-6 w-6" />
            <CartBadge />
          </Link>
          <Magnet padding={20} magnetStrength={0.2} className="hidden lg:inline-block">
            <Link
              to="/menu"
              className="rounded-lg bg-primary px-5 py-2.5 font-display text-sm uppercase tracking-wide text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-95"
            >
              Order Now
            </Link>
          </Magnet>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-background p-6 animate-in slide-in-from-left">
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                submit(e);
                setOpen(false);
              }}
              role="search"
              className="relative"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search menu..."
                aria-label="Search menu"
                className="h-11 w-full rounded-full border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
              />
            </form>
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: l.to === "/" }}
                  className="rounded-lg px-3 py-3 font-display text-lg uppercase data-[status=active]:bg-secondary data-[status=active]:text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link
              to="/menu"
              onClick={() => setOpen(false)}
              className="mt-auto rounded-lg bg-primary py-3 text-center font-display uppercase text-primary-foreground"
            >
              Order Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
