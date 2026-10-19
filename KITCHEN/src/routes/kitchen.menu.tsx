import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, X, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { authService, menuService } from "@/kitchen/services";
import type { MenuItem, MenuVariant } from "@/kitchen/services/cloud/menuService";
import { ActionButton } from "@/kitchen/components/ui";
import { formatINR } from "@/kitchen/domain/rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kitchen/menu")({
  head: () => ({
    meta: [
      { title: "Menu · Crunch Box Kitchen" },
      { name: "description", content: "Edit Crunch Box menu items, prices and photos." },
      { property: "og:title", content: "Menu · Crunch Box Kitchen" },
      { property: "og:description", content: "Edit Crunch Box menu items, prices and photos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<MenuItem | "new" | null>(null);

  async function load() {
    try {
      setItems(await menuService.listMenu());
    } catch {
      toast.error("Couldn't load the menu.");
      setItems([]);
    }
  }
  useEffect(() => {
    load();
    authService.isKitchenAdmin().then(setCanEdit);
  }, []);

  async function toggle(item: MenuItem, v: boolean) {
    setItems((list) => list?.map((i) => (i.id === item.id ? { ...i, isAvailable: v } : i)) ?? null);
    try {
      await menuService.setAvailable(item.id, v);
    } catch {
      toast.error("Couldn't update.");
      load();
    }
  }

  async function remove(item: MenuItem) {
    if (!confirm(`Remove "${item.name}" from the menu?`)) return;
    try {
      await menuService.deleteItem(item);
      toast.success("Item removed");
      load();
    } catch {
      toast.error("Couldn't remove item.");
    }
  }

  const categories = [...new Set((items ?? []).map((i) => i.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-brand">
          <span className="brush-label">Menu</span>
        </h1>
        {canEdit && (
          <ActionButton onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> Add item
          </ActionButton>
        )}
      </div>
      {canEdit === false && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted p-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" /> Only the kitchen account can edit the menu.
        </div>
      )}

      {items === null ? (
        <p className="text-sm text-muted-foreground">Loading menu…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No items yet.
        </p>
      ) : (
        categories.map((cat) => (
          <section key={cat} className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {cat}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {items
                .filter((i) => i.category === cat)
                .map((item) => (
                  <article
                    key={item.id}
                    className={cn(
                      "flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-card",
                      !item.isAvailable && "opacity-60",
                    )}
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <ImagePlus className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 font-semibold">{item.name}</div>
                        {canEdit && (
                          <div className="flex shrink-0 gap-1">
                            <button
                              onClick={() => setEditing(item)}
                              aria-label={`Edit ${item.name}`}
                              className="grid h-9 w-9 place-items-center rounded-lg border border-border text-brand"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => remove(item)}
                              aria-label={`Remove ${item.name}`}
                              className="grid h-9 w-9 place-items-center rounded-lg border border-border text-primary"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <ul className="mt-1 space-y-0.5 text-sm">
                        {item.variants.map((v) => (
                          <li
                            key={v.id}
                            className="flex justify-between gap-2 text-muted-foreground"
                          >
                            <span className="min-w-0 truncate">{v.name}</span>
                            <span className="shrink-0 font-semibold tabular-nums text-foreground">
                              {formatINR(v.price)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {canEdit && (
                        <label className="mt-2 flex items-center justify-between text-xs font-semibold">
                          {item.isAvailable ? "Available" : "Sold out / hidden"}
                          <Switch
                            checked={item.isAvailable}
                            onCheckedChange={(v) => toggle(item, v)}
                          />
                        </label>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))
      )}

      {editing && (
        <ItemEditor
          item={editing === "new" ? null : editing}
          categories={categories}
          nextOrder={(items?.length ?? 0) + 1}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ItemEditor({
  item,
  categories,
  nextOrder,
  onClose,
  onSaved,
}: {
  item: MenuItem | null;
  categories: string[];
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? categories[0] ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [variants, setVariants] = useState<MenuVariant[]>(
    item?.variants.length ? item.variants.map((v) => ({ ...v })) : [{ name: "Regular", price: 0 }],
  );
  const [imagePath, setImagePath] = useState<string | null>(item?.imagePath ?? null);
  const [preview, setPreview] = useState<string | null>(item?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Please choose an image file.");
    if (f.size > 5 * 1024 * 1024) return setError("Image must be under 5 MB.");
    setError(null);
    setUploading(true);
    try {
      const path = await menuService.uploadImage(f);
      setImagePath(path);
      setPreview(URL.createObjectURL(f));
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!name.trim()) return setError("Enter an item name.");
    if (!variants.length) return setError("Add at least one size or price.");
    if (variants.some((v) => !Number.isFinite(v.price) || v.price <= 0))
      return setError("Every price must be more than ₹0.");
    setError(null);
    setSaving(true);
    try {
      await menuService.saveItem({
        id: item?.id,
        name,
        category,
        description,
        imagePath,
        isAvailable: item?.isAvailable ?? true,
        sortOrder: item?.sortOrder ?? nextOrder,
        variants,
      });
      if (item?.imagePath && item.imagePath !== imagePath)
        menuService.removeImageFile(item.imagePath);
      toast.success(item ? "Item updated" : "Item added");
      onSaved();
    } catch {
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const input =
    "mt-1 min-h-12 w-full rounded-xl border border-border bg-card px-3 text-base outline-none focus:border-primary";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-brand">
            {item ? "Edit item" : "Add item"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-xl border border-border"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-dashed border-border bg-muted"
            >
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="mx-auto h-7 w-7 text-muted-foreground" />
              )}
              {uploading && (
                <div className="absolute inset-0 grid place-items-center bg-background/70">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </button>
            <div className="space-y-2 text-sm">
              <ActionButton type="button" tone="ghost" onClick={() => fileRef.current?.click()}>
                {preview ? "Change photo" : "Add photo"}
              </ActionButton>
              {preview && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePath(null);
                    setPreview(null);
                  }}
                  className="block text-xs font-semibold text-primary"
                >
                  Remove photo
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>

          <label className="block text-sm font-semibold">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </label>
          <label className="block text-sm font-semibold">
            Category
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="menu-cats"
              className={input}
              placeholder="e.g. Chicken"
            />
            <datalist id="menu-cats">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="block text-sm font-semibold">
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`${input} py-2`}
            />
          </label>

          <div>
            <div className="text-sm font-semibold">Sizes & prices</div>
            <div className="mt-1 space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_7rem_auto] gap-2">
                  <input
                    value={v.name}
                    onChange={(e) =>
                      setVariants((vs) =>
                        vs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                      )
                    }
                    placeholder="Size"
                    className={input.replace("mt-1 ", "")}
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">₹</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={v.price || ""}
                      onChange={(e) =>
                        setVariants((vs) =>
                          vs.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)),
                        )
                      }
                      className={`${input.replace("mt-1 ", "")} pl-7`}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={variants.length === 1}
                    onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}
                    aria-label="Remove size"
                    className="grid h-12 w-10 place-items-center rounded-xl border border-border text-muted-foreground disabled:opacity-40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setVariants((vs) => [...vs, { name: "", price: 0 }])}
              className="mt-2 text-sm font-bold text-brand"
            >
              + Add size
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-status-new-soft p-3 text-sm font-medium text-primary"
            >
              {error}
            </p>
          )}
          <ActionButton block busy={saving || uploading} onClick={save}>
            {item ? "Save changes" : "Add to menu"}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
