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
      aria-label="Bottom"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-safe lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-foreground/70 data-[status=active]:text-primary"
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {to === "/cart" && <CartBadge />}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
