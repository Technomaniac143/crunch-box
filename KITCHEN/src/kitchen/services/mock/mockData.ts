// DEVELOPMENT DATASET — fictional customers and orders for UI work only.
// Only the mock adapter may import this file.
import type { Order, OrderItem, OrderStatus, PaymentStatus } from "../../domain/types";
import { DELIVERY_FEE, itemsSubtotal } from "../../domain/rules";

const ITEM_POOL: Omit<OrderItem, "id" | "quantity">[] = [
  { productId: "fries", productName: "French Fries", variantName: "Medium", unitPrice: 89 },
  { productId: "fries", productName: "French Fries", variantName: "Large", unitPrice: 119 },
  {
    productId: "loaded",
    productName: "Chicken Loaded Fries",
    variantName: "Double Layer Medium",
    unitPrice: 199,
  },
  {
    productId: "beef",
    productName: "Beef Loaded Fries",
    variantName: "Single Layer Large",
    unitPrice: 199,
  },
  { productId: "popcorn", productName: "Popcorn Chicken", variantName: "Regular", unitPrice: 99 },
  { productId: "lays", productName: "Lays Chicken", variantName: "Medium", unitPrice: 69 },
  { productId: "lollipop", productName: "Lollipop", variantName: "5 Piece", unitPrice: 229 },
  { productId: "strips", productName: "Chicken Strips", variantName: "8 Piece", unitPrice: 199 },
  { productId: "rice", productName: "Rice Bowl Chicken", variantName: "Large", unitPrice: 249 },
  { productId: "combo1", productName: "Combo 1", unitPrice: 269 },
  { productId: "saving", productName: "Saving Combo", unitPrice: 499 },
  { productId: "pepsi", productName: "Pepsi", variantName: "Small", unitPrice: 40 },
];

const CUSTOMERS = [
  ["Arjun Mehta", "9876543210", "Flat 302, Sai Residency, 4th Cross, Indiranagar", "Opp. HDFC ATM"],
  [
    "Priya Nair",
    "9845012345",
    "12B, Lake View Apartments, HSR Layout Sector 2",
    "Near BDA Complex",
  ],
  ["Rahul Verma", "9900112233", "House 47, 2nd Main, Koramangala 5th Block", "Behind Forum Mall"],
  ["Sneha Iyer", "9731456789", "Tower C-1104, Prestige Sunrise, Whitefield", "Gate 2"],
  ["Karthik R", "9632587410", "88, MG Road, Ulsoor", "Next to Metro pillar 112"],
  ["Ayesha Khan", "9008765432", "PG 3rd floor, BTM 2nd Stage, 16th Main", "Above Medplus"],
  ["Vikram Singh", "9886001122", "21, Jayanagar 9th Block, East End Road", "Near Ragigudda temple"],
  ["Meera Das", "9741230987", "Villa 9, Palm Meadows, Marathahalli", "Clubhouse side"],
] as const;

const NOTES = [
  "Extra spicy please",
  "No mayo on fries",
  "Ring the bell twice, baby sleeping",
  "",
  "Pack sauces separately",
  "",
];

let seq = 1040;
function rnd(n: number) {
  return Math.floor(Math.random() * n);
}

export function makeOrder(opts: {
  minutesAgo: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  base?: number;
}): Order {
  seq += 1;
  const c = CUSTOMERS[rnd(CUSTOMERS.length)]!;
  const count = 1 + rnd(3);
  const items: OrderItem[] = Array.from({ length: count }, (_, i) => ({
    ...ITEM_POOL[rnd(ITEM_POOL.length)]!,
    id: `it-${seq}-${i}`,
    quantity: 1 + rnd(2),
  }));
  const subtotal = itemsSubtotal(items);
  const created = new Date((opts.base ?? Date.now()) - opts.minutesAgo * 60000).toISOString();
  const refunded = ["rejected", "cancelled", "refund_pending", "refunded"].includes(opts.status);
  return {
    id: `ord_${seq}`,
    orderNumber: `CB-${seq}`,
    createdAt: created,
    status: opts.status,
    paymentStatus:
      opts.paymentStatus ??
      (opts.status === "refunded" ? "refunded" : refunded ? "refund_pending" : "paid"),
    paymentReference: `pay_DEV${seq}`,
    customerName: c[0],
    customerPhone: c[1],
    deliveryAddress: c[2],
    landmark: c[3],
    items,
    specialInstructions: NOTES[rnd(NOTES.length)] || undefined,
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total: subtotal + DELIVERY_FEE,
    refundAmount: refunded ? subtotal + DELIVERY_FEE : undefined,
    history: [{ status: "new", at: created }],
  };
}

export function seedOrders(): Order[] {
  const day = 24 * 60;
  return [
    makeOrder({ minutesAgo: 2, status: "new" }),
    makeOrder({ minutesAgo: 5, status: "new" }),
    makeOrder({ minutesAgo: 9, status: "accepted" }),
    makeOrder({ minutesAgo: 14, status: "preparing" }),
    makeOrder({ minutesAgo: 18, status: "preparing" }),
    makeOrder({ minutesAgo: 24, status: "ready_for_pickup" }),
    makeOrder({ minutesAgo: 33, status: "picked_up" }),
    makeOrder({ minutesAgo: 50, status: "delivered" }),
    makeOrder({ minutesAgo: 70, status: "delivered" }),
    makeOrder({ minutesAgo: 95, status: "cancelled" }),
    makeOrder({ minutesAgo: day + 30, status: "delivered" }),
    makeOrder({ minutesAgo: day + 80, status: "delivered" }),
    makeOrder({ minutesAgo: day + 120, status: "refunded" }),
    makeOrder({ minutesAgo: 2 * day + 45, status: "delivered" }),
    makeOrder({ minutesAgo: 2 * day + 90, status: "rejected" }),
  ];
}
