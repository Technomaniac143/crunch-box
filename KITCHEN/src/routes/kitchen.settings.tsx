import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Radio, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useKitchen } from "@/kitchen/KitchenProvider";
import { ActionButton } from "@/kitchen/components/ui";
import { formatINR } from "@/kitchen/domain/rules";
import { playNewOrderChime, unlockAudio } from "@/kitchen/notifications/alerts";
import { authService } from "@/kitchen/services";
import { ShinyText } from "@/components/reactbits";

export const Route = createFileRoute("/kitchen/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Crunch Box Kitchen" },
      { name: "description", content: "Kitchen hours, ordering and alert preferences." },
      { property: "og:title", content: "Settings · Crunch Box Kitchen" },
      { property: "og:description", content: "Kitchen hours, ordering and alert preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings } = useKitchen();
  const [open, setOpen] = useState("18:00");
  const [close, setClose] = useState("03:00");
  const [saving, setSaving] = useState(false);
  const [fee, setFee] = useState("");
  const [savingFee, setSavingFee] = useState(false);
  const [canEditFee, setCanEditFee] = useState(false);

  useEffect(() => {
    void authService.isKitchenAdmin().then(setCanEditFee);
  }, []);

  useEffect(() => {
    if (settings?.deliveryFee !== undefined) setFee(String(settings.deliveryFee));
  }, [settings?.deliveryFee]);

  async function saveFee() {
    if (!fee.trim()) {
      toast.error("Enter a delivery fee.");
      return;
    }
    setSavingFee(true);
    try {
      await updateSettings({ deliveryFee: Number(fee) });
      toast.success("Delivery fee saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the delivery fee.");
    } finally {
      setSavingFee(false);
    }
  }

  useEffect(() => {
    if (settings) {
      setOpen(settings.openingTime);
      setClose(settings.closingTime);
    }
  }, [settings]);

  if (!settings) return <p className="text-sm text-muted-foreground">Loading settings…</p>;

  async function saveHours() {
    setSaving(true);
    await updateSettings({ openingTime: open, closingTime: close });
    setSaving(false);
    toast.success("Hours updated");
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-display text-2xl font-bold text-brand">
        <span className="brush-label">Kitchen settings</span>
      </h1>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-ready opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-ready"></span>
              </span>
              <h2 className="font-semibold text-foreground">
                <ShinyText text="Live Realtime Environment" speed={2.5} shimmerColor="rgba(255, 255, 255, 0.9)" />
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Connected directly to Supabase PostgreSQL Realtime CDC channels. All incoming customer orders, status changes, and notifications dispatch instantly without mock simulation.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-status-ready/30 bg-status-ready-soft px-2.5 py-1 text-[11px] font-bold text-status-ready">
            <Radio className="h-3 w-3 animate-pulse" />
            Live
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 border-t border-border pt-3 text-xs sm:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-2">
            <span className="block font-medium text-muted-foreground">FSSAI Registration</span>
            <span className="font-semibold text-foreground">22426077000999</span>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <span className="block font-medium text-muted-foreground">Location & Landmarks</span>
            <span className="font-semibold text-foreground">Outside Wingz Academy, Adj. Pooja Supermarket, Padur</span>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <span className="block font-medium text-muted-foreground">Contact</span>
            <span className="font-semibold text-foreground">+91 63697 15501 (Amalan)</span>
          </div>
        </div>
      </Card>

      <Card>
        <ToggleRow
          label="Accepting orders"
          hint="Pause to stop new orders reaching the kitchen."
          checked={settings.acceptingOrders}
          onChange={(v) => updateSettings({ acceptingOrders: v })}
        />
      </Card>

      <Card>
        <h2 className="font-semibold">Operating hours</h2>
        <p className="text-xs text-muted-foreground">
          India time (Asia/Kolkata). Closing after midnight is next day.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">
            Opens
            <input
              type="time"
              value={open}
              onChange={(e) => setOpen(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-border bg-card px-3 text-base"
            />
          </label>
          <label className="text-sm font-semibold">
            Closes
            <input
              type="time"
              value={close}
              onChange={(e) => setClose(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-border bg-card px-3 text-base"
            />
          </label>
        </div>
        <ActionButton block className="mt-3" busy={saving} onClick={saveHours}>
          Save hours
        </ActionButton>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Delivery fee</h2>
            <p className="text-xs text-muted-foreground">
              New orders only. Existing totals stay unchanged.
            </p>
          </div>
          <div className="font-display text-2xl font-bold text-brand">
            {formatINR(settings.deliveryFee)}
          </div>
        </div>
        {canEditFee && (
          <div className="mt-3 space-y-3">
            <label className="block text-sm font-semibold">
              Delivery fee (₹)
              <input
                aria-label="Delivery fee (₹)"
                type="number"
                min="0"
                max="99999999.99"
                step="0.01"
                inputMode="decimal"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="mt-1 min-h-12 w-full rounded-xl border border-border bg-card px-3 text-base"
              />
            </label>
            <ActionButton block busy={savingFee} onClick={saveFee}>
              Save delivery fee
            </ActionButton>
          </div>
        )}
      </Card>

      <Card>
        <ToggleRow
          label="Sound alerts"
          hint="Chime for new orders while this page is open. Alerts do not work when the browser is closed."
          checked={settings.soundEnabled}
          onChange={(v) => {
            unlockAudio();
            updateSettings({ soundEnabled: v });
          }}
        />
        <ActionButton
          tone="ghost"
          block
          className="mt-3"
          onClick={() => {
            unlockAudio();
            playNewOrderChime();
          }}
        >
          Test sound
        </ActionButton>
      </Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
