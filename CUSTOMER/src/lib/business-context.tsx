import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { getBusinessStatusServerFn, type BusinessStatus } from "./orders-service";
import { site } from "@/data/site";

interface BusinessContextType {
  status: BusinessStatus | null;
  hours: string;
  hoursLong: string;
  isOpen: boolean;
  acceptingOrders: boolean;
  deliveryFee: number;
  reason?: string | undefined;
  loading: boolean;
  refresh: () => Promise<void>;
}

const defaultContext: BusinessContextType = {
  status: null,
  hours: site.hours,
  hoursLong: site.hoursLong,
  isOpen: true,
  acceptingOrders: true,
  deliveryFee: site.deliveryFee,
  loading: true,
  refresh: async () => {},
};

const BusinessContext = createContext<BusinessContextType>(defaultContext);

export function BusinessStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<BusinessStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const applySettingsPatchLocally = useCallback(
    (patch: {
      acceptingOrders?: boolean;
      openingTime?: string;
      closingTime?: string;
      deliveryFee?: number;
    }) => {
      setStatus((prev) => {
        const openT = patch.openingTime ?? prev?.openingTime ?? "10:00";
        const closeT = patch.closingTime ?? prev?.closingTime ?? "23:00";
        const accepting = patch.acceptingOrders ?? prev?.acceptingOrders ?? true;
        const fee = patch.deliveryFee ?? prev?.deliveryFee ?? 50;

        const formatTime12h = (time24: string) => {
          const [h = 0, m = 0] = time24.split(":").map(Number);
          const period = (h ?? 0) >= 12 ? "PM" : "AM";
          const h12 = (h ?? 0) % 12 || 12;
          return m === 0 ? `${h12} ${period}` : `${h12}:${(m ?? 0).toString().padStart(2, "0")} ${period}`;
        };

        const [openHourStr = "10", openMinStr = "0"] = openT.split(":");
        const openMinutes = parseInt(openHourStr, 10) * 60 + parseInt(openMinStr, 10);
        const [closeHourStr = "23", closeMinStr = "0"] = closeT.split(":");
        const closeMinutes = parseInt(closeHourStr, 10) * 60 + parseInt(closeMinStr, 10);

        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const [nowHourStr = "0", nowMinStr = "0"] = formatter.format(now).split(":");
        const currentMinutes = parseInt(nowHourStr, 10) * 60 + parseInt(nowMinStr, 10);

        let isOpen = false;
        if (openMinutes === closeMinutes) {
          isOpen = true;
        } else if (openMinutes < closeMinutes) {
          isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
        } else {
          isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
        }

        return {
          isOpen,
          acceptingOrders: accepting,
          currentTimeIST: `${nowHourStr}:${nowMinStr}`,
          openingTime: openT,
          closingTime: closeT,
          deliveryFee: fee,
          formattedHours: `${formatTime12h(openT)} – ${formatTime12h(closeT)}`,
          formattedHoursLong: `Monday – Sunday, ${formatTime12h(openT)} – ${formatTime12h(closeT)}`,
          reason: !accepting
            ? "Kitchen is temporarily not accepting orders right now. Check back soon!"
            : !isOpen
              ? `Kitchen is currently closed. Operating hours are ${formatTime12h(openT)} – ${formatTime12h(closeT)} (Asia/Kolkata).`
              : undefined,
        };
      });
    },
    [],
  );

  const fetchStatus = useCallback(async () => {
    try {
      // Pass timestamp cache-buster so browser HTTP caches never return stale state
      const data = await getBusinessStatusServerFn({ data: { _t: Date.now() } });
      setStatus(data);
    } catch {
      // Direct client fallback via Supabase if server function had a network blip
      try {
        const { data: dbData } = await supabase
          .from("kitchen_business_settings")
          .select("accepting_orders, opening_time, closing_time, delivery_fee")
          .eq("id", true)
          .maybeSingle();

        if (dbData) {
          applySettingsPatchLocally({
            acceptingOrders: dbData.accepting_orders ?? true,
            openingTime: dbData.opening_time || "10:00",
            closingTime: dbData.closing_time || "23:00",
            deliveryFee: dbData.delivery_fee ?? 50,
          });
        }
      } catch {
        // Fallback to static site.ts defaults
      }
    } finally {
      setLoading(false);
    }
  }, [applySettingsPatchLocally]);

  useEffect(() => {
    void fetchStatus();

    // 1. Cross-tab/window instant sync via BroadcastChannel (0ms latency)
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("crunch-box-sync");
        bc.onmessage = (event) => {
          if (event.data?.type === "settings_updated" && event.data.payload) {
            applySettingsPatchLocally(event.data.payload);
            void fetchStatus();
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel initialization skipped:", err);
      }
    }

    // 2. Cross-tab storage event sync (same origin fallback)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "crunch-box:kitchen-settings-sync" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          applySettingsPatchLocally(parsed);
          void fetchStatus();
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);

    // 3. Supabase Realtime multi-client sync (instant WebSocket broadcast + Postgres CDC fallback)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel("crunch-box-sync")
        .on("broadcast", { event: "settings_updated" }, ({ payload }) => {
          if (payload) {
            applySettingsPatchLocally(payload);
            void fetchStatus();
          }
        })
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "kitchen_business_settings" },
          (payload) => {
            if (payload.new && typeof payload.new === "object") {
              const row = payload.new as Record<string, any>;
              applySettingsPatchLocally({
                acceptingOrders: row["accepting_orders"],
                openingTime: row["opening_time"],
                closingTime: row["closing_time"],
                deliveryFee: row["delivery_fee"],
              });
            }
            void fetchStatus();
          },
        )
        .subscribe();
    } catch (e) {
      console.warn("Could not establish realtime settings listener:", e);
    }

    // 4. Fast polling every 3 seconds when document is visible (prevents stale state indefinitely)
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        void fetchStatus();
      }
    }, 3000);

    // 5. Instant recheck on window focus and visibilitychange
    const onFocusOrVisible = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        void fetchStatus();
      }
    };
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      if (bc) bc.close();
      if (channel) void supabase.removeChannel(channel);
      window.removeEventListener("storage", onStorage);
      clearInterval(timer);
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, [fetchStatus, applySettingsPatchLocally]);

  const hours = status?.formattedHours || site.hours;
  const hoursLong = status?.formattedHoursLong || site.hoursLong;
  const isOpen = status?.isOpen ?? true;
  const acceptingOrders = status?.acceptingOrders ?? true;
  const deliveryFee = status?.deliveryFee ?? site.deliveryFee;

  return (
    <BusinessContext.Provider
      value={{
        status,
        hours,
        hoursLong,
        isOpen,
        acceptingOrders,
        deliveryFee,
        reason: status?.reason,
        loading,
        refresh: fetchStatus,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessStatus() {
  return useContext(BusinessContext);
}
