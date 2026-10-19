import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { categories, minPrice, products } from "@/data/menu";
import { ProductCard } from "@/components/ProductCard";
import { CategoryNavigation } from "@/components/CategoryNavigation";
import { PageHeading } from "@/components/Sections";
import { SplitText, AnimatedContent } from "@/components/reactbits";

type MenuSearch = {
  q?: string | undefined;
  cat?: string | undefined;
  sort?: "asc" | "desc" | undefined;
};

export const Route = createFileRoute("/menu")({
  validateSearch: (s: Record<string, unknown>): MenuSearch => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    cat: typeof s["cat"] === "string" && s["cat"] ? s["cat"] : undefined,
    sort: s["sort"] === "asc" || s["sort"] === "desc" ? s["sort"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Menu — Crunch Box" },
      {
        name: "description",
        content:
          "Full Crunch Box menu: fries, loaded fries, chicken, rice bowls, combos and drinks with prices.",
      },
      { property: "og:title", content: "Menu — Crunch Box" },
      { property: "og:description", content: "Every Crunch Box item and price in one place." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { q = "", cat = "all", sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/menu" });
  const set = (patch: Partial<MenuSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const term = q.toLowerCase();
  let list = products.filter((p) => {
    const catLabel = categories.find((c) => c.id === p.category)?.label ?? "";
    const matchQ = !term || `${p.name} ${catLabel} ${p.description}`.toLowerCase().includes(term);
    return matchQ && (cat === "all" || p.category === cat);
  });
  if (sort)
    list = [...list].sort(
      (a, b) => ((minPrice(a) ?? 1e9) - (minPrice(b) ?? 1e9)) * (sort === "asc" ? 1 : -1),
    );

  const groups = categories
    .filter((c) => c.id !== "all")
    .map((c) => ({ ...c, items: list.filter((p) => p.category === c.id) }))
    .filter((g) => g.items.length);
  const filtered = !!(q || cat !== "all" || sort);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeading title="Our Menu" sub="Pick your crunch. Choose a size, add to cart, done." />
      <div className="sticky top-[65px] z-30 -mx-4 space-y-3 bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => set({ q: e.target.value || undefined })}
              aria-label="Search menu"
              placeholder="Search fries, chicken, combos..."
              className="h-11 w-full rounded-xl border bg-card pl-9 pr-4 outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sort ?? ""}
              onChange={(e) => set({ sort: (e.target.value || undefined) as MenuSearch["sort"] })}
              aria-label="Sort by price"
              className="h-11 rounded-xl border bg-card px-3 text-sm"
            >
              <option value="">Sort: Default</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
            {filtered && (
              <button
                onClick={() => navigate({ search: {}, replace: true })}
                className="flex h-11 items-center gap-1 rounded-xl border px-3 text-sm font-semibold hover:border-primary"
              >
                <X className="h-4 w-4" /> Clear
              </button>
            )}
          </div>
        </div>
        <CategoryNavigation
          active={cat}
          onChange={(id) => set({ cat: id === "all" ? undefined : id })}
        />
      </div>

      {groups.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl uppercase">No matches</p>
          <p className="mt-2 text-muted-foreground">Nothing found for “{q}”. Try another search.</p>
          <button
            onClick={() => navigate({ search: {}, replace: true })}
            className="mt-5 rounded-lg bg-primary px-5 py-2.5 font-display uppercase text-primary-foreground"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-12">
          {groups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`h-${g.id}`}>
              <h2 id={`h-${g.id}`} className="mb-4">
                <span className="brush text-2xl">
                  <SplitText text={g.label} delay={30} />
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {g.items.map((p, idx) => (
                  <AnimatedContent key={p.id} delay={Math.min(idx * 40, 240)}>
                    <ProductCard product={p} />
                  </AnimatedContent>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
