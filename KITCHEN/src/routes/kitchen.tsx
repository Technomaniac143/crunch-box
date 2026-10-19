import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  ListOrdered,
  UtensilsCrossed,
  History,
  Settings,
  LogOut,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  RefreshCw,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/kitchen/services";
import { KitchenProvider, useKitchen } from "@/kitchen/KitchenProvider";
import { Logo } from "@/kitchen/components/ui";
import { BUSINESS_TZ } from "@/kitchen/domain/rules";
import { unlockAudio } from "@/kitchen/notifications/alerts";
import { ShinyText } from "@/components/reactbits";

export const Route = createFileRoute("/kitchen")({
  ssr: false,
  pendingComponent: () => (
    <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
      Loading kitchen…
    </div>
  ),
  beforeLoad: async () => {
    if (!(await authService.isSignedIn())) throw redirect({ to: "/login" });
  },
  component: () => (
    <KitchenProvider>
      <Shell />
    </KitchenProvider>
  ),
});

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Shell() {
  const { settings, connection, unread, acknowledge, updateSettings } = useKitchen();
  const nav = useNavigate();
  const now = useClock();
  const accepting = settings?.acceptingOrders ?? true;
  const sound = settings?.soundEnabled ?? true;

  async function logout() {
    await authService.signOut();
    nav({ to: "/login", replace: true });
  }

  const conn = {
    connected: {
      icon: Wifi,
      label: "Live",
      cls: "text-status-ready",
    },
    reconnecting: { icon: RefreshCw, label: "Reconnecting", cls: "text-status-prep animate-pulse" },
    offline: { icon: WifiOff, label: "Offline", cls: "text-primary" },
  }[connection];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                unlockAudio();
                updateSettings({ soundEnabled: !sound });
              }}
              aria-label={sound ? "Mute alerts" : "Unmute alerts"}
              className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-brand"
            >
              {sound ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={logout}
              aria-label="Log out"
              className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-brand"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pb-3 text-xs">
          <div className="min-w-0 text-muted-foreground">
            <span className="font-semibold text-foreground">
              {new Intl.DateTimeFormat("en-IN", {
                timeZone: BUSINESS_TZ,
                weekday: "short",
                day: "numeric",
                month: "short",
              }).format(now)}
            </span>{" "}
            ·{" "}
            {new Intl.DateTimeFormat("en-IN", {
              timeZone: BUSINESS_TZ,
              hour: "numeric",
              minute: "2-digit",
            }).format(now)}
            <span className={cn("ml-2 inline-flex items-center gap-1 font-semibold", conn.cls)}>
              <conn.icon className="h-3.5 w-3.5" />
              {conn.label === "Live" ? (
                <ShinyText text="Live" speed={2.5} shimmerColor="rgba(255, 255, 255, 0.95)" />
              ) : (
                conn.label
              )}
            </span>
          </div>
          <button
            role="switch"
            aria-checked={accepting}
            onClick={() => updateSettings({ acceptingOrders: !accepting })}
            className={cn(
              "flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 font-bold transition-transform active:scale-95",
              accepting
                ? "border-status-ready/40 bg-status-ready-soft text-status-ready"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                accepting ? "bg-status-ready animate-pulse" : "bg-muted-foreground",
              )}
            />
            {accepting ? "Accepting orders" : "Paused"}
          </button>
        </div>
        {unread.size > 0 && (
          <div className="bg-brand text-brand-foreground shadow-inner">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 text-sm font-bold">
              <span className="flex items-center gap-2">
                <BellRing className="h-4 w-4 animate-bounce text-gold" />{" "}
                <ShinyText
                  text={`${unread.size} new order${unread.size > 1 ? "s" : ""} waiting`}
                  shimmerColor="rgba(255, 185, 40, 0.9)"
                />
              </span>
              <button
                onClick={() => acknowledge()}
                className="rounded-lg bg-card/20 px-3 py-1.5 text-xs transition hover:bg-card/30 active:scale-95"
              >
                Acknowledge all
              </button>
            </div>
          </div>
        )}
      </header>

      <nav className="mx-auto hidden max-w-6xl gap-2 px-4 pt-4 md:flex">
        <NavItems />
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-4">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        <NavItems mobile />
      </nav>
    </div>
  );
}

function NavItems({ mobile }: { mobile?: boolean }) {
  const { unread } = useKitchen();
  const items = [
    { to: "/kitchen", label: "Today", icon: LayoutGrid, exact: true },
    { to: "/kitchen/orders", label: "Orders", icon: ListOrdered, exact: false },
    { to: "/kitchen/menu", label: "Menu", icon: UtensilsCrossed, exact: false },
    { to: "/kitchen/history", label: "History", icon: History, exact: false },
    { to: "/kitchen/settings", label: "Settings", icon: Settings, exact: false },
  ] as const;
  return items.map((i) => (
    <Link
      key={i.to}
      to={i.to}
      activeOptions={{ exact: i.exact }}
      className={cn(
        "relative flex items-center gap-2 font-semibold",
        mobile
          ? "min-h-16 flex-col justify-center gap-1 text-[11px] text-muted-foreground data-[status=active]:text-primary"
          : "rounded-full px-4 py-2 text-sm text-muted-foreground data-[status=active]:bg-brand data-[status=active]:text-brand-foreground",
      )}
    >
      <i.icon className="h-5 w-5" />
      {i.label}
      {i.to === "/kitchen" && unread.size > 0 && (
        <span
          className={cn(
            "absolute h-2.5 w-2.5 rounded-full bg-primary pulse-ring",
            mobile ? "right-[30%] top-3" : "right-1 top-1",
          )}
        />
      )}
    </Link>
  ));
}
