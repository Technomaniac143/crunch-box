import { Plus } from "lucide-react";
import { toast } from "sonner";
import { inr, type Product } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";

export function ComboCard({ product }: { product: Product }) {
  const { add } = useCart();
  const variant = product.variants[0]!;
  const price = variant.price!;

  return (
    <SpotlightCard
      role="article"
      className="card-lift relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-card"
      spotlightColor="rgba(217, 40, 28, 0.14)"
      borderColor="rgba(217, 40, 28, 0.3)"
    >
      <span className="brush self-start text-lg">{product.name}</span>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
        <ul className="space-y-1 text-sm">
          {product.includes?.map((i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {i}
            </li>
          ))}
        </ul>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={816}
          height={816}
          className="h-28 w-28 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="brush-red text-3xl">{inr(price)}</span>
        <button
          onClick={() => {
            add({
              key: `${product.id}:${variant.id}`,
              productId: product.id,
              name: product.name,
              variant: "Combo",
              price,
              image: product.image,
            });
            toast.success(`${product.name} added`);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 font-display text-sm uppercase tracking-wide text-primary-foreground shadow-sm transition-all duration-150 hover:brightness-110 active:scale-95 touch-manipulation font-semibold"
        >
          Add Combo <Plus className="h-4 w-4" />
        </button>
      </div>
    </SpotlightCard>
  );
}
