import { createFileRoute } from "@tanstack/react-router";
import { getProduct, savingsBoxes, specialCombos } from "@/data/menu";
import { ComboCard } from "@/components/ComboCard";
import { PageHeading, PromoBanner } from "@/components/Sections";

export const Route = createFileRoute("/combos")({
  head: () => ({
    meta: [
      { title: "Combo Offers — Crunch Box" },
      {
        name: "description",
        content: "Crunch Box special combos from ₹249 and savings boxes for the whole gang.",
      },
      { property: "og:title", content: "Combo Offers — Crunch Box" },
      { property: "og:description", content: "Special combos and savings boxes at Crunch Box." },
    ],
  }),
  component: CombosPage,
});

function CombosPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      <PageHeading title="Combo Offers" sub="More crunch, less spend." />
      <section>
        <h2 className="mb-4">
          <span className="brush-red text-2xl">Special Combos</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {specialCombos.map((id) => (
            <ComboCard key={id} product={getProduct(id)!} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4">
          <span className="brush text-2xl">Savings Boxes</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {savingsBoxes.map((id) => (
            <ComboCard key={id} product={getProduct(id)!} />
          ))}
        </div>
      </section>
      <PromoBanner />
    </div>
  );
}
