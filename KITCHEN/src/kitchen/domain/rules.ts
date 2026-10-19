import type { Order, OrderItem, OrderStatus } from "./types";

export const DELIVERY_FEE = 50;
export const BUSINESS_TZ = "Asia/Kolkata";

export function validateDeliveryFee(fee: number): void {
  if (
    !Number.isFinite(fee) ||
    fee < 0 ||
    fee > 99999999.99 ||
    Math.abs(fee * 100 - Math.round(fee * 100)) > 0.000001
  ) {
    throw new Error("Enter a non-negative delivery fee with at most two decimal places.");
  }
}

export function itemsSubtotal(items: Pick<OrderItem, "quantity" | "unitPrice">[]): number {
  return items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
}

export function orderTotal(subtotal: number, deliveryFee = DELIVERY_FEE): number {
  return subtotal + deliveryFee;
}

export interface StatusAction {
  to: OrderStatus;
  label: string;
  tone: "primary" | "danger";
}

/** Valid next actions per status. Only these may be shown or executed. */
export const TRANSITIONS: Record<OrderStatus, StatusAction[]> = {
  new: [
    { to: "ready_for_pickup", label: "Accept Order", tone: "primary" },
    { to: "rejected", label: "Reject", tone: "danger" },
  ],
  accepted: [
    { to: "ready_for_pickup", label: "Mark Ready / Picked Up", tone: "primary" },
    { to: "cancelled", label: "Cancel", tone: "danger" },
  ],
  preparing: [
    { to: "ready_for_pickup", label: "Mark Ready / Picked Up", tone: "primary" },
    { to: "cancelled", label: "Cancel", tone: "danger" },
  ],
  ready_for_pickup: [{ to: "delivered", label: "Deliver", tone: "primary" }],
  picked_up: [{ to: "delivered", label: "Deliver", tone: "primary" }],
  delivered: [],
  rejected: [],
  cancelled: [],
  refund_pending: [],
  refunded: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].some((a) => a.to === to);
}

export const ACTIVE_STATUSES: OrderStatus[] = [
  "new",
  "accepted",
  "preparing",
  "ready_for_pickup",
  "picked_up",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  accepted: "Accepted",
  preparing: "Preparing",
  ready_for_pickup: "Ready / Picked Up",
  picked_up: "Ready / Picked Up",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
  refund_pending: "Refund Pending",
  refunded: "Refunded",
};

const URGENCY: Record<OrderStatus, number> = {
  new: 0,
  ready_for_pickup: 1,
  picked_up: 1,
  preparing: 2,
  accepted: 2,
  delivered: 9,
  rejected: 9,
  cancelled: 9,
  refund_pending: 9,
  refunded: 9,
};

/** New first, then ready, preparing...; oldest first within a group (waiting longest). */
export function sortByUrgency(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) => URGENCY[a.status] - URGENCY[b.status] || a.createdAt.localeCompare(b.createdAt),
  );
}

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function kolkataDateKey(iso: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function formatTime(iso: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: BUSINESS_TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function minutesAgo(iso: string, now = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}
