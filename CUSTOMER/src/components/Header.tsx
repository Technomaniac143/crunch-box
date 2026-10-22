import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, X, Sparkles, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { Magnet } from "./reactbits/Magnet";
import { useBusinessStatus } from "@/lib/business-context";

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
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { isOpen, acceptingOrders, hours, reason } = useBusinessStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/menu", search: { q: q.trim() || undefined } });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
      {(!acceptingOrders || !isOpen) && (
        <div className="bg-primary px-4 py-1.5 text-center text-xs font-semibold text-primary-foreground flex items-center justify-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          <span>{reason || `Kitchen is closed · Operating hours: ${hours}`}</span>
        </div>
      )}
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2 lg:flex lg:justify-between">
        <button
          className="p-2.5 rounded-xl text-foreground hover:bg-muted active:scale-90 transition-transform lg:hidden touch-manipulation"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
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
        <div className="flex items-center gap-3 sm:gap-4">
          <form onSubmit={submit} className="relative hidden xl:block" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for your favorites..."
              aria-label="Search menu"
              className="h-10 w-60 rounded-full border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary transition-all"
            />
          </form>
          <Link to="/cart" aria-label="Cart" className="relative p-2 rounded-xl hover:bg-muted active:scale-90 transition-transform">
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

      {/* Solid, Isolated Fullscreen Mobile Menu Drawer */}
      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Dark blurred backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-fade transition-opacity"
              onClick={() => setOpen(false)}
            />

            {/* Solid Drawer Content with Opaque Background */}
            <div
              className="fixed inset-y-0 left-0 flex w-[85vw] max-w-xs flex-col bg-[#FFFCF7] text-[#24130D] shadow-2xl animate-drawer-left border-r border-[#EADAC8] z-10 overflow-y-auto"
              style={{ backgroundColor: "#FFFCF7", color: "#24130D" }}
            >
              <div className="flex items-center justify-between border-b border-[#EADAC8]/70 p-5 bg-[#FAF5EE]">
                <Logo size="sm" />
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#EADAC8] text-[#24130D] shadow-sm active:scale-90 transition-all touch-manipulation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-5">
                <form
                  onSubmit={(e) => {
                    submit(e);
                    setOpen(false);
                  }}
                  role="search"
                  className="relative"
                >
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#716963]" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search menu..."
                    aria-label="Search menu"
                    className="h-11 w-full rounded-xl border border-[#EADAC8] bg-white pl-10 pr-4 text-sm text-[#24130D] placeholder-[#716963] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </form>

                <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
                  {navLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: l.to === "/" }}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-lg uppercase tracking-wide text-[#24130D] hover:bg-white active:scale-[0.98] active:bg-[#F3E8DB] transition-all data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:shadow-sm"
                    >
                      <span>{l.label}</span>
                      <span className="text-xs opacity-40">→</span>
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto pt-4 border-t border-[#EADAC8]/70">
                  <Link
                    to="/menu"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-center font-display text-sm uppercase tracking-wider text-primary-foreground shadow-md hover:brightness-110 active:scale-[0.98] transition-all font-semibold"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Order Now</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
