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
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1"
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
            onClick={() => onChange(c.id)}
            className="flex shrink-0 items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-semibold shadow-card transition hover:border-primary aria-selected:border-primary aria-selected:bg-primary aria-selected:text-primary-foreground"
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
