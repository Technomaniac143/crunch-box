import { supabase } from "@/integrations/supabase/client";

export interface MenuVariant {
  id?: string | undefined;
  name: string;
  price: number;
}
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  variants: MenuVariant[];
}

const BUCKET = "menu-images";

export async function listMenu(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*, menu_item_variants(*)")
    .order("sort_order");
  if (error) throw error;
  const paths = data.map((d) => d.image_url).filter((p): p is string => !!p);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, 60 * 60 * 24);
    signed?.forEach((s) => s.path && s.signedUrl && urls.set(s.path, s.signedUrl));
  }
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    description: d.description,
    imagePath: d.image_url,
    imageUrl: d.image_url ? (urls.get(d.image_url) ?? null) : null,
    isAvailable: d.is_available,
    sortOrder: d.sort_order,
    variants: [...d.menu_item_variants]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({ id: v.id, name: v.name, price: v.price })),
  }));
}

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `items/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export interface SaveInput {
  id?: string | undefined;
  name: string;
  category: string;
  description: string;
  imagePath: string | null;
  isAvailable: boolean;
  sortOrder: number;
  variants: MenuVariant[];
}

export async function saveItem(input: SaveInput): Promise<void> {
  const row = {
    name: input.name.trim(),
    category: input.category.trim() || "Other",
    description: input.description.trim() || null,
    image_url: input.imagePath,
    is_available: input.isAvailable,
    sort_order: input.sortOrder,
  };
  let id = input.id;
  if (id) {
    const { error } = await supabase.from("menu_items").update(row).eq("id", id);
    if (error) throw error;
    const { error: delErr } = await supabase.from("menu_item_variants").delete().eq("item_id", id);
    if (delErr) throw delErr;
  } else {
    const { data, error } = await supabase.from("menu_items").insert(row).select("id").single();
    if (error) throw error;
    id = data.id;
  }
  const { error: vErr } = await supabase.from("menu_item_variants").insert(
    input.variants.map((v, i) => ({
      item_id: id!,
      name: v.name.trim() || "Standard",
      price: Math.round(v.price),
      sort_order: i + 1,
    })),
  );
  if (vErr) throw vErr;
}

export async function setAvailable(id: string, isAvailable: boolean) {
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteItem(item: MenuItem) {
  const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
  if (error) throw error;
  if (item.imagePath) await supabase.storage.from(BUCKET).remove([item.imagePath]);
}

export async function removeImageFile(path: string) {
  await supabase.storage.from(BUCKET).remove([path]);
}
