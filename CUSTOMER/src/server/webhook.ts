import { supabase } from "@/integrations/supabase/client";

export async function handleRazorpayWebhook(request: Request): Promise<Response> {
  const webhookSecret = process.env["RAZORPAY_WEBHOOK_SECRET"];
  const signature = request.headers.get("x-razorpay-signature");

  const rawBody = await request.text();

  // 1. Verify signature if secret is configured
  if (webhookSecret) {
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing webhook signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const crypto = await import("node:crypto");
      const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
      if (expected !== signature) {
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err) {
      console.error("Webhook signature verification error:", err);
      return new Response(JSON.stringify({ error: "Signature verification error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // 2. Process payload
  try {
    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: {
        payment?: {
          entity?: {
            id: string;
            order_id?: string;
            amount?: number;
            status?: string;
          };
        };
        order?: {
          entity?: {
            id: string;
            receipt?: string;
          };
        };
      };
    };

    const paymentEntity = event.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;

    if (!razorpayOrderId) {
      return new Response(JSON.stringify({ status: "ignored", reason: "no razorpay order id" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (event.event === "payment.captured" || event.event === "order.paid") {
      // Find order in Supabase
      const { data: order } = await supabase
        .from("orders")
        .select("id, status, payment_status")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (order) {
        // Idempotency: skip if already paid
        if (order.payment_status === "paid") {
          return new Response(JSON.stringify({ status: "ok", message: "already marked paid" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Promote to new and paid
        await supabase
          .from("orders")
          .update({
            status: "new",
            payment_status: "paid",
            razorpay_payment_id: paymentEntity?.id || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        await supabase.from("order_status_events").insert({
          order_id: order.id,
          status: "new",
          note: `Webhook confirmed payment: ${paymentEntity?.id || "N/A"}`,
        });
      }
    } else if (event.event === "refund.processed") {
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (order) {
        await supabase
          .from("orders")
          .update({
            status: "refunded",
            payment_status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        await supabase.from("order_status_events").insert({
          order_id: order.id,
          status: "refunded",
          note: "Webhook confirmed refund processed",
        });
      }
    }

    return new Response(JSON.stringify({ status: "ok", event: event.event }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error processing Razorpay webhook:", err);
    return new Response(JSON.stringify({ error: "Malformed webhook payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
