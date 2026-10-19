// Domain models shared by the kitchen UI and any data adapter.
// These mirror what the shared backend will eventually expose.

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g. "Medium", "Double Layer Large"
  price: number; // INR
}

export interface Product {
  id: string;
  name: string;
  category: string;
  variants: ProductVariant[];
}

export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready_for_pickup"
  | "picked_up"
  | "delivered"
  | "rejected"
  | "cancelled"
  | "refund_pending"
  | "refunded";

export type PaymentStatus =
  | "paid"
  | "pending"
  | "unpaid"
  | "failed"
  | "refund_pending"
  | "refunded";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string | undefined;
  variantName?: string | undefined;
  quantity: number;
  unitPrice: number;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string; // ISO
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string | undefined;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  landmark?: string | undefined;
  items: OrderItem[];
  specialInstructions?: string | undefined;
  subtotal: number;
  deliveryFee: number;
  total: number;
  refundAmount?: number | undefined;
  history: OrderStatusEvent[];
}

export interface KitchenSettings {
  acceptingOrders: boolean;
  openingTime: string; // "18:00"
  closingTime: string; // "03:00"
  deliveryFee: number;
  soundEnabled: boolean;
  timezone: "Asia/Kolkata";
}

export interface OrderHistoryQuery {
  search?: string | undefined; // order number or phone
  date?: string | undefined; // YYYY-MM-DD in Asia/Kolkata
}

export type OrderEvent =
  | { type: "orders_reset" }
  | { type: "order_created"; order: Order }
  | { type: "order_updated"; order: Order };

export type ConnectionState = "connected" | "reconnecting" | "offline";
