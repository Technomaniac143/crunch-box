import { Beef, CupSoda, Drumstick, LayoutGrid, Package, Soup, Sandwich } from "lucide-react";
import { categories } from "@/data/menu";

const icons = {
  all: LayoutGrid,
  fries: Sandwich,
  loaded: Beef,
  chicken: Drumstick,
  rice: Soup,
  combos: Package,
  drinks: CupSoda,
} as const;

export function CategoryNavigation({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="no-scrollbar mobile-scroll-snap -mx-4 flex gap-2.5 overflow-x-auto px-4 py-1.5 scroll-smooth touch-manipulation select-none"
      role="tablist"
      aria-label="Categories"
    >
      {categories.map((c) => {
        const Icon = icons[c.id];
        const on = active === c.id;
        return (
          <button
            key={c.id}
            role="tab"
            aria-selected={on}
            onClick={(e) => {
              onChange(c.id);
              (e.currentTarget as HTMLElement).scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              });
            }}
            className="flex shrink-0 items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-150 active:scale-92 touch-manipulation hover:border-primary aria-selected:border-primary aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:shadow-md"
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={on ? 2.2 : 1.75} />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
