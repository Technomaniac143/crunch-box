import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "../domain/types";
import { STATUS_LABEL } from "../domain/rules";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-gold bg-brand">
        <span className="font-display text-sm leading-none text-gold">CB</span>
      </div>
      <div className="min-w-0 leading-none">
        <div className="font-display truncate text-lg font-bold text-brand">Crunch Box</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Kitchen</div>
      </div>
    </div>
  );
}

const actionBtn = cva(
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      tone: {
        primary: "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90",
        accent: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        brand: "bg-brand text-brand-foreground hover:bg-brand/90",
        danger: "border border-border bg-card text-primary hover:bg-status-new-soft",
        ghost: "border border-border bg-card text-foreground hover:bg-accent",
        gold: "bg-gold text-gold-foreground hover:bg-gold/90",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { tone: "primary" },
  },
);

export function ActionButton({
  tone,
  block,
  busy,
  disabled,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof actionBtn> & { busy?: boolean }) {
  return (
    <button
      className={cn(actionBtn({ tone, block }), className)}
      disabled={busy || disabled}
      {...props}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

const statusStyle: Record<OrderStatus, string> = {
  new: "bg-status-new-soft text-status-new",
  accepted: "bg-status-ready-soft text-status-ready",
  preparing: "bg-status-ready-soft text-status-ready",
  ready_for_pickup: "bg-status-ready-soft text-status-ready",
  picked_up: "bg-status-ready-soft text-status-ready",
  delivered: "bg-status-ready-soft text-status-ready",
  rejected: "bg-status-bad-soft text-status-bad",
  cancelled: "bg-status-bad-soft text-status-bad",
  refund_pending: "bg-status-bad-soft text-status-bad",
  refunded: "bg-status-done-soft text-status-done",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        statusStyle[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

const payStyle: Record<PaymentStatus, string> = {
  paid: "border-status-ready/30 text-status-ready",
  pending: "border-status-prep/30 text-status-prep",
  unpaid: "border-status-prep/30 text-status-prep",
  failed: "border-status-bad/30 text-status-bad",
  refund_pending: "border-status-bad/30 text-status-bad",
  refunded: "border-border text-muted-foreground",
};
const payLabel: Record<PaymentStatus, string> = {
  paid: "Prepaid",
  pending: "Payment pending",
  unpaid: "Payment pending",
  failed: "Payment failed",
  refund_pending: "Refund pending",
  refunded: "Refunded",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        payStyle[status],
      )}
    >
      {payLabel[status]}
    </span>
  );
}

export function DevBanner() {
  return (
    <div className="bg-gold px-4 py-1 text-center text-[11px] font-semibold text-gold-foreground">
      Orders shown are sample data · menu changes are saved for real
    </div>
  );
}
