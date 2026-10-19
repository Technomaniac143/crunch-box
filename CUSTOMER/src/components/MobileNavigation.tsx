import { Link } from "@tanstack/react-router";
import { Home, Package, ShoppingCart, User, UtensilsCrossed } from "lucide-react";
import { CartBadge } from "./Header";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/combos", label: "Combos", icon: Package },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function MobileNavigation() {
  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.35rem,env(safe-area-inset-bottom,0.35rem))] lg:hidden touch-manipulation select-none"
    >
      <ul className="grid grid-cols-5 items-center">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex justify-center">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex flex-col items-center justify-center gap-1 py-2 px-3 text-[11px] font-semibold text-foreground/60 transition-all duration-150 active:scale-85 data-[status=active]:text-primary"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`relative grid h-8 w-8 place-items-center rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary scale-110 shadow-sm"
                        : "group-hover:text-foreground text-foreground/70"
                    }`}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-200" strokeWidth={isActive ? 2.2 : 1.8} />
                    {to === "/cart" && <CartBadge />}
                  </span>
                  <span className={`tracking-tight ${isActive ? "font-bold text-primary" : ""}`}>
                    {label}
                  </span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
