import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import { handleRazorpayWebhook } from "@/server/webhook";

describe("Razorpay Webhook Verification", () => {
  const secret = "test_webhook_secret_123";

  it("rejects webhooks with missing signature when secret is set", async () => {
    process.env["RAZORPAY_WEBHOOK_SECRET"] = secret;

    const req = new Request("http://localhost/api/webhooks/razorpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "payment.captured" }),
    });

    const res = await handleRazorpayWebhook(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("Missing");
  });

  it("rejects webhooks with invalid HMAC signature", async () => {
    process.env["RAZORPAY_WEBHOOK_SECRET"] = secret;

    const payload = JSON.stringify({ event: "payment.captured" });
    const req = new Request("http://localhost/api/webhooks/razorpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": "invalid_forged_signature",
      },
      body: payload,
    });

    const res = await handleRazorpayWebhook(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("Invalid");
  });

  it("accepts webhooks with valid HMAC signature", async () => {
    process.env["RAZORPAY_WEBHOOK_SECRET"] = secret;

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test123",
            order_id: "order_test123",
            amount: 29900,
          },
        },
      },
    });

    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const req = new Request("http://localhost/api/webhooks/razorpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": signature,
      },
      body: payload,
    });

    const res = await handleRazorpayWebhook(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ok");
  }, 15000);
});
