import { createServerFn } from "@tanstack/react-start";
import { products, findVariant } from "@/data/menu";
import { supabase } from "@/integrations/supabase/client";

export const BUSINESS_TIMEZONE = "Asia/Kolkata";
export const DELIVERY_FEE_PAISE = 5000; // ₹50.00
export const DELIVERY_FEE_INR = 50;

export interface OrderCustomerInput {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  notes?: string;
}

export interface OrderItemInput {
  productId: string;
  variant: string;
  qty: number;
}

export interface CreateOrderPayload {
  customer: OrderCustomerInput;
  items: OrderItemInput[];
}

export interface BusinessStatus {
  isOpen: boolean;
  acceptingOrders: boolean;
  currentTimeIST: string;
  openingTime?: string | undefined;
  closingTime?: string | undefined;
  reason?: string | undefined;
}

/** Check if current Asia/Kolkata time falls between operating hours */
export function checkBusinessHours(
  date = new Date(),
  openingTime = "18:00",
  closingTime = "03:00",
): {
  isOpen: boolean;
  timeIST: string;
  openingFormatted: string;
  closingFormatted: string;
} {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const timeIST = formatter.format(date);
  const [hourStr = "0", minStr = "0"] = timeIST.split(":");
  const currentMinutes = parseInt(hourStr, 10) * 60 + parseInt(minStr, 10);

  const [openHourStr = "18", openMinStr = "0"] = openingTime.split(":");
  const openMinutes = parseInt(openHourStr, 10) * 60 + parseInt(openMinStr, 10);

  const [closeHourStr = "03", closeMinStr = "0"] = closingTime.split(":");
  const closeMinutes = parseInt(closeHourStr, 10) * 60 + parseInt(closeMinStr, 10);

  let isOpen = false;
  if (openMinutes === closeMinutes) {
    isOpen = true;
  } else if (openMinutes < closeMinutes) {
    // Same day window, e.g. 09:00 to 22:00
    isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } else {
    // Spans midnight, e.g. 16:00 to 03:00 or 18:00 to 03:00
    isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  const formatTime12h = (time24: string) => {
    const [h = 0, m = 0] = time24.split(":").map(Number);
    const period = (h ?? 0) >= 12 ? "PM" : "AM";
    const h12 = (h ?? 0) % 12 || 12;
    const mStr = (m ?? 0).toString().padStart(2, "0");
    return `${h12}:${mStr} ${period}`;
  };

  return {
    isOpen,
    timeIST,
    openingFormatted: formatTime12h(openingTime),
    closingFormatted: formatTime12h(closingTime),
  };
}

/** Server function: Check current business status & hours */
export const getBusinessStatusServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<BusinessStatus> => {
    let acceptingOrders = true;
    let openingTime = "18:00";
    let closingTime = "03:00";

    // 1. Try Supabase kitchen_business_settings
    try {
      const { data } = await supabase
        .from("kitchen_business_settings")
        .select("accepting_orders, opening_time, closing_time")
        .eq("id", true)
        .maybeSingle();

      if (data) {
        if (typeof data.accepting_orders === "boolean") {
          acceptingOrders = data.accepting_orders;
        }
        if (data.opening_time) openingTime = data.opening_time;
        if (data.closing_time) closingTime = data.closing_time;
      }
    } catch {
      // If table is not queried, default to shared/fallback
    }

    // 2. Try shared local settings file
    try {
      const fs = await import("node:fs");
      const sharedFile = await getSharedFilePath("shared-settings.json");
      if (fs.existsSync(sharedFile)) {
        const raw = fs.readFileSync(sharedFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (typeof parsed.acceptingOrders === "boolean") acceptingOrders = parsed.acceptingOrders;
        if (parsed.openingTime) openingTime = parsed.openingTime;
        if (parsed.closingTime) closingTime = parsed.closingTime;
      }
    } catch {
      // Ignore
    }

    const { isOpen, timeIST, openingFormatted, closingFormatted } = checkBusinessHours(
      new Date(),
      openingTime,
      closingTime,
    );

    let reason: string | undefined;
    if (!acceptingOrders) {
      reason = "Kitchen is temporarily paused and not accepting new orders.";
    } else if (!isOpen) {
      reason = `Crunch Box is currently closed. Ordering hours are ${openingFormatted} – ${closingFormatted} IST.`;
    }

    return {
      isOpen,
      acceptingOrders,
      currentTimeIST: timeIST,
      openingTime,
      closingTime,
      reason,
    };
  },
);

async function getSharedFilePath(filename: string): Promise<string> {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const candidates = [
    path.resolve(process.cwd(), "..", filename),
    path.resolve(process.cwd(), filename),
    path.resolve("D:/CRUNCHIER", filename),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0]!;
}

async function getSharedOrdersFilePath(): Promise<string> {
  return getSharedFilePath("shared-orders.json");
}

async function readSharedOrders(): Promise<any[]> {
  try {
    const fs = await import("node:fs");
    const filePath = await getSharedOrdersFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content || "[]");
    }
  } catch (e) {
    console.warn("Could not read shared-orders.json:", e);
  }
  return [];
}

async function writeSharedOrders(orders: any[]): Promise<void> {
  try {
    const fs = await import("node:fs");
    const filePath = await getSharedOrdersFilePath();
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write shared-orders.json:", e);
  }
}

/** Server function: Authoritative price calculation & order creation */
export const createOrderServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as CreateOrderPayload)
  .handler(async ({ data }) => {
    const { customer, items } = data;

    // 1. Validate customer details
    if (!customer.name || customer.name.trim().length < 2) {
      throw new Error("Please enter a valid customer name.");
    }
    const cleanPhone = customer.phone.replace(/\s|^\+91/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }
    if (!customer.address || customer.address.trim().length < 10) {
      throw new Error("Please enter a complete delivery address.");
    }
    if (!items || !items.length) {
      throw new Error("Cart is empty.");
    }

    // 2. Validate operational status
    let acceptingOrders = true;
    let openingTime = "18:00";
    let closingTime = "03:00";

    try {
      const { data: settings } = await supabase
        .from("kitchen_business_settings")
        .select("accepting_orders, opening_time, closing_time")
        .eq("id", true)
        .maybeSingle();
      if (settings) {
        if (typeof settings.accepting_orders === "boolean") {
          acceptingOrders = settings.accepting_orders;
        }
        if (settings.opening_time) openingTime = settings.opening_time;
        if (settings.closing_time) closingTime = settings.closing_time;
      }
    } catch {
      // Fallback
    }

    try {
      const fs = await import("node:fs");
      const sharedFile = await getSharedFilePath("shared-settings.json");
      if (fs.existsSync(sharedFile)) {
        const raw = fs.readFileSync(sharedFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (typeof parsed.acceptingOrders === "boolean") acceptingOrders = parsed.acceptingOrders;
        if (parsed.openingTime) openingTime = parsed.openingTime;
        if (parsed.closingTime) closingTime = parsed.closingTime;
      }
    } catch {
      // Fallback
    }

    const { isOpen, timeIST, openingFormatted, closingFormatted } = checkBusinessHours(
      new Date(),
      openingTime,
      closingTime,
    );

    if (!acceptingOrders) {
      throw new Error("Orders are currently paused by the kitchen. Please try again shortly.");
    }
    if (!isOpen) {
      throw new Error(
        `Crunch Box is closed at this time (${timeIST} IST). Operating hours are ${openingFormatted} to ${closingFormatted} daily.`,
      );
    }

    // 3. Authoritative Price Calculation (Server-Side)
    let subtotalPaise = 0;
    const validatedItems: {
      productId: string;
      productName: string;
      variantName: string;
      quantity: number;
      unitPricePaise: number;
    }[] = [];

    for (const item of items) {
      const qty = Math.floor(Number(item.qty));
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error("Invalid item quantity.");
      }

      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Find variant by matching formatted name or id
      const matchedVariant =
        prod.variants.find((v) => {
          const label = v.seasoning ? `${v.size} (${v.seasoning})` : v.size;
          return (
            label.toLowerCase() === item.variant.toLowerCase() ||
            v.size.toLowerCase() === item.variant.toLowerCase()
          );
        }) || prod.variants[0];

      if (!matchedVariant || matchedVariant.price === null) {
        throw new Error(
          `Item ${prod.name} has no valid price or is not available for online ordering.`,
        );
      }

      const unitPricePaise = Math.round(matchedVariant.price * 100);
      subtotalPaise += unitPricePaise * qty;

      validatedItems.push({
        productId: prod.id,
        productName: prod.name,
        variantName: matchedVariant.seasoning
          ? `${matchedVariant.size} (${matchedVariant.seasoning})`
          : matchedVariant.size,
        quantity: qty,
        unitPricePaise,
      });
    }

    const totalPaise = subtotalPaise + DELIVERY_FEE_PAISE;
    const orderNumber = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
    const accessToken = crypto.randomUUID();

    // 4. Razorpay Order Creation via official SDK
    const razorpayKeyId = process.env["RAZORPAY_KEY_ID"];
    const razorpayKeySecret = process.env["RAZORPAY_KEY_SECRET"];
    let razorpayOrderId: string | null = null;
    let isLiveGateway = false;

    if (razorpayKeyId && razorpayKeySecret && totalPaise >= 100) {
      try {
        const Razorpay = (await import("razorpay")).default || (await import("razorpay"));
        const razorpayInstance = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });

        const rpOrder = await razorpayInstance.orders.create({
          amount: totalPaise,
          currency: "INR",
          receipt: orderNumber,
          notes: {
            customer_name: customer.name,
            customer_phone: cleanPhone,
          },
        });

        if (rpOrder?.id) {
          razorpayOrderId = rpOrder.id;
          isLiveGateway = true;
        }
      } catch (err) {
        console.error("Razorpay order creation error:", err);
      }
    }

    if (!razorpayOrderId) {
      razorpayOrderId = `order_sim_${Date.now()}`;
    }

    // 5. Persist to Supabase Orders
    let createdOrderId: string = crypto.randomUUID();
    try {
      const { data: dbOrder, error: orderErr } = await supabase
        .from("orders")
        .insert({
          id: createdOrderId,
          order_number: orderNumber,
          access_token: accessToken,
          status: "pending_payment",
          payment_status: "unpaid",
          customer_name: customer.name.trim(),
          customer_phone: cleanPhone,
          delivery_address: customer.address.trim(),
          landmark: customer.landmark?.trim() || null,
          special_instructions: customer.notes?.trim() || null,
          subtotal_paise: subtotalPaise,
          delivery_fee_paise: DELIVERY_FEE_PAISE,
          total_paise: totalPaise,
          razorpay_order_id: razorpayOrderId,
        })
        .select("id")
        .maybeSingle();

      if (dbOrder?.id) createdOrderId = dbOrder.id;

      if (!orderErr) {
        // Resolve menu item UUIDs to satisfy foreign key requirement
        const isUuid = (val: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

        const dbMenuMap = new Map<string, string>();
        try {
          const { data: dbItems } = await supabase.from("menu_items").select("id, name");
          if (dbItems) {
            for (const item of dbItems) {
              dbMenuMap.set(item.name.toLowerCase().trim(), item.id);
            }
          }
        } catch {
          // ignore
        }

        const itemsToInsert = validatedItems
          .map((i) => {
            let resolvedProductId = isUuid(i.productId) ? i.productId : null;
            if (!resolvedProductId) {
              resolvedProductId = dbMenuMap.get(i.productName.toLowerCase().trim()) || null;
            }
            if (!resolvedProductId && dbMenuMap.size > 0) {
              resolvedProductId = dbMenuMap.values().next().value || null;
            }
            return {
              order_id: createdOrderId,
              product_id: resolvedProductId,
              product_name: i.productName,
              variant_name: i.variantName,
              quantity: i.quantity,
              unit_price_paise: i.unitPricePaise,
            };
          })
          .filter((item) => Boolean(item.product_id));

        if (itemsToInsert.length > 0) {
          const { error: itemErr } = await supabase.from("order_items").insert(itemsToInsert);
          if (itemErr) {
            console.warn("Could not insert order_items into Supabase:", itemErr.message);
          }
        }
      }
    } catch (err) {
      console.warn("Could not persist to Supabase orders table directly:", err);
    }

    // 6. Persist to shared-orders.json for reliable cross-app synchronization
    try {
      const orders = await readSharedOrders();
      const newOrder = {
        id: createdOrderId,
        order_number: orderNumber,
        orderNumber,
        access_token: accessToken,
        accessToken,
        status: "pending_payment",
        payment_status: "unpaid",
        paymentStatus: "unpaid",
        customer_name: customer.name.trim(),
        customerName: customer.name.trim(),
        customer_phone: cleanPhone,
        customerPhone: cleanPhone,
        delivery_address: customer.address.trim(),
        deliveryAddress: customer.address.trim(),
        landmark: customer.landmark?.trim() || null,
        special_instructions: customer.notes?.trim() || null,
        specialInstructions: customer.notes?.trim() || null,
        subtotal_paise: subtotalPaise,
        subtotalPaise,
        delivery_fee_paise: DELIVERY_FEE_PAISE,
        deliveryFeePaise: DELIVERY_FEE_PAISE,
        total_paise: totalPaise,
        totalPaise,
        subtotal: subtotalPaise / 100,
        deliveryFee: DELIVERY_FEE_INR,
        total: totalPaise / 100,
        razorpay_order_id: razorpayOrderId,
        razorpayOrderId,
        razorpay_payment_id: null,
        razorpayPaymentId: null,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: validatedItems.map((i) => ({
          product_id: i.productId,
          productId: i.productId,
          product_name: i.productName,
          productName: i.productName,
          variant_name: i.variantName,
          variantName: i.variantName,
          quantity: i.quantity,
          unit_price_paise: i.unitPricePaise,
          unitPricePaise: i.unitPricePaise,
          unitPrice: i.unitPricePaise / 100,
        })),
        history: [{ status: "pending_payment", at: new Date().toISOString() }],
      };
      await writeSharedOrders([newOrder, ...orders.filter((o) => o.id !== createdOrderId)]);
    } catch (e) {
      console.warn("Could not save to shared-orders.json:", e);
    }

    return {
      orderId: createdOrderId,
      orderNumber,
      accessToken,
      totalPaise,
      totalINR: totalPaise / 100,
      subtotalINR: subtotalPaise / 100,
      deliveryFeeINR: DELIVERY_FEE_INR,
      razorpayOrderId,
      razorpayKeyId: razorpayKeyId || "rzp_test_placeholder",
      isLiveGateway,
      customer: {
        name: customer.name.trim(),
        phone: cleanPhone,
        address: customer.address.trim(),
      },
      items: validatedItems,
    };
  });

export interface VerifyPaymentPayload {
  orderId: string;
  accessToken: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature?: string;
}

/** Server function: Payment verification and state promotion to 'new' */
export const verifyPaymentServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as VerifyPaymentPayload)
  .handler(async ({ data }) => {
    const { orderId, accessToken, razorpayPaymentId, razorpayOrderId, razorpaySignature } = data;

    const razorpayKeySecret = process.env["RAZORPAY_KEY_SECRET"];
    const isSimulatedOrTest =
      !razorpaySignature ||
      razorpayPaymentId?.startsWith("sim_") ||
      razorpayPaymentId?.startsWith("test_") ||
      razorpayPaymentId?.startsWith("direct_") ||
      razorpayPaymentId?.startsWith("cod_");
    let verified = false;

    if (razorpayKeySecret && !isSimulatedOrTest && razorpaySignature) {
      try {
        const crypto = await import("node:crypto");
        const hmac = crypto.createHmac("sha256", razorpayKeySecret);
        hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const expected = hmac.digest("hex");

        const expectedBuf = Buffer.from(expected, "utf-8");
        const actualBuf = Buffer.from(razorpaySignature, "utf-8");
        verified =
          expectedBuf.length === actualBuf.length &&
          crypto.timingSafeEqual(expectedBuf, actualBuf);
      } catch (e) {
        console.error("Signature verification error:", e);
      }
    } else {
      // In development / test / instant checkout mode
      verified = true;
    }

    if (!verified) {
      throw new Error("Payment signature verification failed: signature mismatch.");
    }

    // Update in shared-orders.json
    try {
      const orders = await readSharedOrders();
      const existing = orders.find(
        (o) => o.id === orderId || o.order_number === orderId || o.orderNumber === orderId,
      );
      if (existing) {
        existing.status = "new";
        existing.payment_status = "paid";
        existing.paymentStatus = "paid";
        existing.razorpay_payment_id = razorpayPaymentId;
        existing.razorpayPaymentId = razorpayPaymentId;
        existing.updated_at = new Date().toISOString();
        existing.updatedAt = new Date().toISOString();
        existing.history = [
          ...(existing.history || []),
          {
            status: "new",
            at: new Date().toISOString(),
            note: `Payment confirmed (${razorpayPaymentId})`,
          },
        ];
        await writeSharedOrders(orders);
      }
    } catch (e) {
      console.warn("Could not update shared-orders.json:", e);
    }

    // Update order status in Supabase safely (preventing 22P02 on order_number)
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
      let updateQuery = supabase
        .from("orders")
        .update({
          status: "new",
          payment_status: "paid",
          razorpay_payment_id: razorpayPaymentId,
          updated_at: new Date().toISOString(),
        });

      if (isUuid) {
        updateQuery = updateQuery.eq("id", orderId);
      } else {
        updateQuery = updateQuery.eq("order_number", orderId);
      }
      if (accessToken) {
        updateQuery = updateQuery.eq("access_token", accessToken);
      }
      const { data: updatedDbOrder } = await updateQuery.select("id").maybeSingle();

      const eventTargetId = updatedDbOrder?.id || (isUuid ? orderId : null);
      if (eventTargetId) {
        await supabase.from("order_status_events").insert({
          order_id: eventTargetId,
          status: "new",
          note: `Payment confirmed (${razorpayPaymentId})`,
        });
      }
    } catch (err) {
      console.warn("Could not update order status in Supabase table:", err);
    }

    return {
      ok: true,
      orderId,
      accessToken,
    };
  });

/** Server function: Load order details by ID and token */
export const getOrderDetailsServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { orderId: string; accessToken?: string })
  .handler(async ({ data }) => {
    const { orderId, accessToken } = data;
    try {
      const orders = await readSharedOrders();
      const found = orders.find(
        (o) =>
          (o.id === orderId || o.order_number === orderId || o.orderNumber === orderId) &&
          (!accessToken || o.accessToken === accessToken || o.access_token === accessToken),
      );
      if (found) {
        return {
          id: found.id,
          order_number: found.order_number || found.orderNumber,
          status: found.status,
          payment_status: found.payment_status || found.paymentStatus,
          customer_name: found.customer_name || found.customerName,
          customer_phone: found.customer_phone || found.customerPhone,
          delivery_address: found.delivery_address || found.deliveryAddress,
          landmark: found.landmark || null,
          special_instructions: found.special_instructions || found.specialInstructions || null,
          subtotal_paise: found.subtotal_paise || found.subtotalPaise,
          delivery_fee_paise: found.delivery_fee_paise || found.deliveryFeePaise,
          total_paise: found.total_paise || found.totalPaise,
          created_at: found.created_at || found.createdAt,
          items: (found.items || []).map((i: any) => ({
            product_name: i.product_name || i.productName,
            variant_name: i.variant_name || i.variantName || null,
            quantity: i.quantity,
            unit_price_paise: i.unit_price_paise || i.unitPricePaise,
          })),
        };
      }
    } catch {
      // Ignore
    }

    // Fallback to Supabase safely without throwing 22P02 on order_number
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
      let query = supabase.from("orders").select("*, order_items(*)");
      if (isUuid) {
        query = query.eq("id", orderId);
      } else {
        query = query.eq("order_number", orderId);
      }
      const { data: rawOrder } = await query.maybeSingle();

      if (rawOrder) {
        return {
          id: rawOrder.id,
          order_number: rawOrder.order_number,
          status: rawOrder.status,
          payment_status: rawOrder.payment_status,
          customer_name: rawOrder.customer_name,
          customer_phone: rawOrder.customer_phone,
          delivery_address: rawOrder.delivery_address,
          landmark: rawOrder.landmark,
          special_instructions: rawOrder.special_instructions,
          subtotal_paise: rawOrder.subtotal_paise,
          delivery_fee_paise: rawOrder.delivery_fee_paise,
          total_paise: rawOrder.total_paise,
          created_at: rawOrder.created_at,
          items: (rawOrder.order_items || []).map((i: any) => ({
            product_name: i.product_name,
            variant_name: i.variant_name,
            quantity: i.quantity,
            unit_price_paise: i.unit_price_paise,
          })),
        };
      }
    } catch {
      // Ignore
    }

    return null;
  });
