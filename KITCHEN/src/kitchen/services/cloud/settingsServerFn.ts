import { createServerFn } from "@tanstack/react-start";
import type { KitchenSettings } from "../../domain/types";

async function resolveSharedFile(name: string): Promise<string> {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const candidates = [
    path.resolve(process.cwd(), "..", name),
    path.resolve(process.cwd(), name),
    path.resolve("D:/CRUNCHIER", name),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0]!;
}

export const saveSharedSettingsServerFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as Partial<KitchenSettings>)
  .handler(async ({ data }) => {
    try {
      const fs = await import("node:fs");
      const sharedFile = await resolveSharedFile("shared-settings.json");
      let current: Record<string, unknown> = {};
      if (fs.existsSync(sharedFile)) {
        try {
          current = JSON.parse(fs.readFileSync(sharedFile, "utf-8"));
        } catch {
          current = {};
        }
      }
      const updated = {
        ...current,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(sharedFile, JSON.stringify(updated, null, 2), "utf-8");
      return { ok: true, settings: updated };
    } catch (err) {
      console.warn("Could not save shared settings file:", err);
      return { ok: false };
    }
  });

export const loadSharedSettingsServerFn = createServerFn({ method: "GET" })
  .validator((d?: { _t?: number }) => d)
  .handler(async (): Promise<Partial<KitchenSettings> | null> => {
    try {
      const fs = await import("node:fs");
      const sharedFile = await resolveSharedFile("shared-settings.json");
      if (fs.existsSync(sharedFile)) {
        return JSON.parse(fs.readFileSync(sharedFile, "utf-8"));
      }
    } catch {
      // Ignore
    }
    return null;
  });

export async function getSharedSettings(): Promise<Partial<KitchenSettings> | null> {
  try {
    return await loadSharedSettingsServerFn({ data: { _t: Date.now() } });
  } catch {
    if (typeof process !== "undefined" && process.versions?.node) {
      try {
        const fs = await import("node:fs");
        const path = await import("node:path");
        const candidates = [
          path.resolve(process.cwd(), "..", "shared-settings.json"),
          path.resolve(process.cwd(), "shared-settings.json"),
          path.resolve("D:/CRUNCHIER", "shared-settings.json"),
        ];
        for (const c of candidates) {
          if (fs.existsSync(c)) {
            return JSON.parse(fs.readFileSync(c, "utf-8"));
          }
        }
      } catch {}
    }
    return null;
  }
}

export const loadSharedOrdersServerFn = createServerFn({ method: "GET" })
  .validator((d?: { _t?: number }) => d)
  .handler(async (): Promise<any[]> => {
    // 1. Query Supabase directly using supabaseAdmin on server
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from("orders")
          .select("*, order_items(*), order_status_events(*)")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Could not query Supabase orders in server fn:", e);
    }

    // 2. Fallback to shared-orders.json (local development / offline)
    try {
      const fs = await import("node:fs");
      const sharedFile = await resolveSharedFile("shared-orders.json");
      if (fs.existsSync(sharedFile)) {
        const raw = fs.readFileSync(sharedFile, "utf-8");
        return JSON.parse(raw || "[]");
      }
    } catch (e) {
      console.warn("Could not load shared orders in Kitchen:", e);
    }
    return [];
  });

export async function getSharedOrders(): Promise<any[]> {
  try {
    return await loadSharedOrdersServerFn({ data: { _t: Date.now() } });
  } catch {
    if (typeof process !== "undefined" && process.versions?.node) {
      try {
        const fs = await import("node:fs");
        const path = await import("node:path");
        const candidates = [
          path.resolve(process.cwd(), "..", "shared-orders.json"),
          path.resolve(process.cwd(), "shared-orders.json"),
          path.resolve("D:/CRUNCHIER", "shared-orders.json"),
        ];
        for (const c of candidates) {
          if (fs.existsSync(c)) {
            const raw = fs.readFileSync(c, "utf-8");
            return JSON.parse(raw || "[]");
          }
        }
      } catch {}
    }
    return [];
  }
}

export const updateSharedOrderStatusServerFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { orderId: string; status: string })
  .handler(async ({ data }) => {
    // 1. Update in Supabase using supabaseAdmin on server
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (supabaseAdmin) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.orderId);
        const isRefundState = data.status === "rejected" || data.status === "cancelled";
        const updatePayload: Record<string, any> = {
          status: data.status,
          updated_at: new Date().toISOString(),
        };
        if (isRefundState) {
          updatePayload.payment_status = "refund_pending";
        }

        let query = supabaseAdmin.from("orders").update(updatePayload);
        if (isUuid) {
          query = query.eq("id", data.orderId);
        } else {
          query = query.eq("order_number", data.orderId);
        }
        await query;

        const eventTargetId = isUuid ? data.orderId : null;
        if (eventTargetId) {
          await supabaseAdmin.from("order_status_events").insert({
            order_id: eventTargetId,
            status: data.status,
          });
        }
      }
    } catch (e) {
      console.warn("Could not update Supabase order in server fn:", e);
    }

    // 2. Also update local shared-orders.json if present
    try {
      const fs = await import("node:fs");
      const sharedFile = await resolveSharedFile("shared-orders.json");
      if (fs.existsSync(sharedFile)) {
        const orders = JSON.parse(fs.readFileSync(sharedFile, "utf-8") || "[]");
        const match = orders.find(
          (o: any) =>
            o.id === data.orderId ||
            o.order_number === data.orderId ||
            o.orderNumber === data.orderId,
        );
        if (match) {
          match.status = data.status;
          match.updated_at = new Date().toISOString();
          match.updatedAt = new Date().toISOString();
          if (data.status === "rejected" || data.status === "cancelled") {
            const isPaid = match.payment_status === "paid" || match.paymentStatus === "paid";
            if (isPaid) {
              match.payment_status = "refund_pending";
              match.paymentStatus = "refund_pending";
              match.refund_amount_paise =
                match.total_paise || Math.round((match.total || 0) * 100);
              match.refundAmount = match.total || (match.total_paise || 0) / 100;
            }
          }
          match.history = [
            ...(match.history || []),
            { status: data.status, at: new Date().toISOString() },
          ];
          fs.writeFileSync(sharedFile, JSON.stringify(orders, null, 2), "utf-8");
          return { ok: true, order: match };
        }
      }
    } catch (e) {
      console.warn("Could not update shared order in Kitchen:", e);
    }
    return { ok: true };
  });

export async function updateSharedOrderStatus(data: {
  orderId: string;
  status: string;
}): Promise<{ ok: boolean; order?: any }> {
  try {
    return await updateSharedOrderStatusServerFn({ data });
  } catch {
    if (typeof process !== "undefined" && process.versions?.node) {
      try {
        const fs = await import("node:fs");
        const path = await import("node:path");
        const candidates = [
          path.resolve(process.cwd(), "..", "shared-orders.json"),
          path.resolve(process.cwd(), "shared-orders.json"),
          path.resolve("D:/CRUNCHIER", "shared-orders.json"),
        ];
        let target = "";
        for (const c of candidates) {
          if (fs.existsSync(c)) {
            target = c;
            break;
          }
        }
        if (target) {
          const orders = JSON.parse(fs.readFileSync(target, "utf-8") || "[]");
          const match = orders.find(
            (o: any) =>
              o.id === data.orderId ||
              o.order_number === data.orderId ||
              o.orderNumber === data.orderId,
          );
          if (match) {
            match.status = data.status;
            match.updated_at = new Date().toISOString();
            match.updatedAt = new Date().toISOString();
            if (data.status === "rejected" || data.status === "cancelled") {
              const isPaid = match.payment_status === "paid" || match.paymentStatus === "paid";
              if (isPaid) {
                match.payment_status = "refund_pending";
                match.paymentStatus = "refund_pending";
                match.refund_amount_paise =
                  match.total_paise || Math.round((match.total || 0) * 100);
                match.refundAmount = match.total || (match.total_paise || 0) / 100;
              }
            }
            match.history = [
              ...(match.history || []),
              { status: data.status, at: new Date().toISOString() },
            ];
            fs.writeFileSync(target, JSON.stringify(orders, null, 2), "utf-8");
            return { ok: true, order: match };
          }
        }
      } catch {}
    }
    return { ok: false };
  }
}
