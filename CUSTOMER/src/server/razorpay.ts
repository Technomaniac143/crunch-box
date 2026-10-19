import crypto from "node:crypto";

export interface CreateOrderRequestBody {
  amount: number; // in paise (e.g. 100 paise = 1 INR)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentRequestBody {
  order_id?: string;
  payment_id?: string;
  signature?: string;
  // Alternate naming support for razorpay payload objects
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

/**
 * Helper to build JSON responses with consistent headers
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

/**
 * POST /api/create-order
 * Calls Razorpay API: POST https://api.razorpay.com/v1/orders
 * Request: { amount (paise), currency, receipt }
 * Return: { order_id, amount, currency, key_id }
 * Minimum amount: 100 paise
 */
export async function handleCreateOrder(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed. Use POST." }, 405);
  }

  let body: CreateOrderRequestBody;
  try {
    body = (await request.json()) as CreateOrderRequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON in request body" }, 400);
  }

  const { amount, currency = "INR", receipt, notes = {} } = body;

  // 1. Validate amount
  if (amount === undefined || amount === null || typeof amount !== "number" || isNaN(amount)) {
    return jsonResponse({ error: "Amount is required and must be a valid number (in paise)" }, 400);
  }

  const parsedAmount = Math.round(amount);
  if (parsedAmount < 100) {
    return jsonResponse({ error: "Minimum amount is 100 paise (₹1.00)" }, 400);
  }

  // 2. Read server-side Razorpay credentials
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];

  if (!keyId || !keySecret) {
    return jsonResponse(
      { error: "Razorpay credentials not configured or unauthorized on server" },
      401,
    );
  }

  // 3. Call Razorpay API: POST https://api.razorpay.com/v1/orders
  try {
    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const orderReceipt = receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: parsedAmount,
        currency: currency.toUpperCase(),
        receipt: orderReceipt,
        notes,
      }),
    });

    const data = (await response.json()) as {
      id?: string;
      amount?: number;
      currency?: string;
      error?: { description?: string; code?: string };
    };

    if (!response.ok) {
      if (response.status === 401) {
        return jsonResponse(
          { error: "Razorpay authentication failed: Invalid Key ID or Key Secret" },
          401,
        );
      }
      return jsonResponse(
        { error: data.error?.description || "Failed to create Razorpay order" },
        response.status >= 500 ? 500 : response.status,
      );
    }

    return jsonResponse(
      {
        order_id: data.id,
        amount: data.amount,
        currency: data.currency,
        key_id: keyId,
      },
      200,
    );
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return jsonResponse(
      { error: "Failed to create Razorpay order due to a network or server error" },
      500,
    );
  }
}

/**
 * POST /api/verify-payment
 * Verifies Razorpay payment signature using HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Returns success only if signatures match
 */
export async function handleVerifyPayment(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed. Use POST." }, 405);
  }

  let body: VerifyPaymentRequestBody;
  try {
    body = (await request.json()) as VerifyPaymentRequestBody;
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON in request body" }, 400);
  }

  const orderId = body.order_id || body.razorpay_order_id;
  const paymentId = body.payment_id || body.razorpay_payment_id;
  const signature = body.signature || body.razorpay_signature;

  // 1. Missing fields validation
  if (!orderId || !paymentId || !signature) {
    return jsonResponse(
      {
        success: false,
        error:
          "Missing required fields: order_id, payment_id, and signature (or razorpay_* equivalents) are required",
      },
      400,
    );
  }

  // 2. Server credentials check
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keySecret) {
    return jsonResponse(
      { success: false, error: "RAZORPAY_KEY_SECRET is not configured on the server" },
      500,
    );
  }

  // 3. Compute HMAC-SHA256 signature
  try {
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const actualBuffer = Buffer.from(signature, "utf-8");

    // Secure constant-time comparison
    const isMatch =
      expectedBuffer.length === actualBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, actualBuffer);

    if (!isMatch) {
      return jsonResponse(
        {
          success: false,
          error: "Payment verification failed: signature mismatch",
        },
        400,
      );
    }

    return jsonResponse(
      {
        success: true,
        message: "Payment verified successfully",
        order_id: orderId,
        payment_id: paymentId,
      },
      200,
    );
  } catch (err) {
    console.error("Signature verification error:", err);
    return jsonResponse(
      {
        success: false,
        error: "Internal error during signature verification",
      },
      500,
    );
  }
}
