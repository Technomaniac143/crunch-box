import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { findVariant, inr, minPrice, type Product } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";

function Pills({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  if (options.length < 2) return null;
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className="rounded-full border px-2.5 py-1 text-xs font-medium transition aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary-foreground hover:border-primary"
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { add } = useCart();
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const seasonings = [
    ...new Set(product.variants.map((v) => v.seasoning).filter(Boolean)),
  ] as string[];
  const [size, setSize] = useState<string>(sizes[0] ?? "");
  const [seasoning, setSeasoning] = useState<string | undefined>(seasonings[0]);
  const [qty, setQty] = useState(1);
  const variant = findVariant(product, size, seasoning);
  const price = variant?.price ?? null;

  const handleAdd = () => {
    if (!variant || price == null) return;
    const label = [variant.size, variant.seasoning].filter(Boolean).join(" · ");
    add(
      {
        key: `${product.id}:${variant.id}`,
        productId: product.id,
        name: product.name,
        variant: label,
        price,
        image: product.image,
      },
      qty,
    );
    toast.success(`${qty} × ${product.name} added`, { description: label });
    setQty(1);
  };

  return (
    <SpotlightCard
      role="article"
      className="card-lift flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card"
      spotlightColor="rgba(255, 185, 40, 0.16)"
      borderColor="rgba(255, 185, 40, 0.35)"
    >
      <div className="aspect-[4/3] overflow-hidden bg-subtle">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={816}
          height={816}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg leading-tight">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
          {product.includes && (
            <ul className="mt-2 list-inside list-disc text-sm text-foreground/80">
              {product.includes.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
        </div>
        {!compact && (
          <div className="space-y-2">
            <Pills label="Size" options={sizes} value={size} onChange={setSize} />
            <Pills
              label="Seasoning"
              options={seasonings}
              value={seasoning ?? ""}
              onChange={setSeasoning}
            />
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="font-display text-2xl text-primary">
            {compact && sizes.length > 1 && price != null && (
              <span className="mr-1 text-xs text-muted-foreground">from</span>
            )}
            {compact
              ? minPrice(product) != null
                ? inr(minPrice(product)!)
                : "Ask in store"
              : price != null
                ? inr(price)
                : "Ask in store"}
          </p>
          {price != null && !compact && (
            <div className="flex items-center gap-1 rounded-full border">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-1.5 transition-transform active:scale-90"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center text-sm font-semibold" aria-live="polite">
                {qty}
              </span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="p-1.5 transition-transform active:scale-90"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={price == null}
          className="flex items-center justify-center gap-1 rounded-lg bg-primary py-2.5 font-display uppercase tracking-wide text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {price == null ? (
            "Price coming soon"
          ) : (
            <>
              Add <Plus className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </SpotlightCard>
  );
}
