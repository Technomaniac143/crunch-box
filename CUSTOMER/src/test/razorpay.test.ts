import { describe, expect, it, beforeEach } from "vitest";
import crypto from "node:crypto";
import { handleCreateOrder, handleVerifyPayment } from "@/server/razorpay";

describe("Razorpay Standard Web Checkout Integration", () => {
  const testKeyId = "rzp_test_TpPRpLifdLg1yN";
  const testKeySecret = "BvcVI5ZNJX29ujTclZ1WFY4j";

  beforeEach(() => {
    process.env["RAZORPAY_KEY_ID"] = testKeyId;
    process.env["RAZORPAY_KEY_SECRET"] = testKeySecret;
  });

  describe("STEP 1: Backend - Create Order (/api/create-order)", () => {
    it("rejects non-POST requests with 405", async () => {
      const req = new Request("http://localhost/api/create-order", { method: "GET" });
      const res = await handleCreateOrder(req);
      expect(res.status).toBe(405);
    });

    it("handles CORS OPTIONS preflight", async () => {
      const req = new Request("http://localhost/api/create-order", { method: "OPTIONS" });
      const res = await handleCreateOrder(req);
      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    });

    it("rejects missing amount with 400", async () => {
      const req = new Request("http://localhost/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: "INR" }),
      });
      const res = await handleCreateOrder(req);
      expect(res.status).toBe(400);
      const data = (await res.json()) as { error: string };
      expect(data.error).toContain("Amount is required");
    });

    it("rejects amount < 100 paise with 400", async () => {
      const req = new Request("http://localhost/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 99, currency: "INR" }),
      });
      const res = await handleCreateOrder(req);
      expect(res.status).toBe(400);
      const data = (await res.json()) as { error: string };
      expect(data.error).toContain("Minimum amount is 100 paise");
    });

    it("returns 401 when Razorpay credentials are not configured", async () => {
      delete process.env["RAZORPAY_KEY_ID"];
      delete process.env["RAZORPAY_KEY_SECRET"];

      const req = new Request("http://localhost/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 5000, currency: "INR" }),
      });
      const res = await handleCreateOrder(req);
      expect(res.status).toBe(401);
      const data = (await res.json()) as { error: string };
      expect(data.error).toContain("credentials not configured or unauthorized");
    });

    it("creates a Razorpay order with valid amount and credentials", async () => {
      const req = new Request("http://localhost/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 50000, // ₹500.00
          currency: "INR",
          receipt: "test_receipt_101",
        }),
      });
      const res = await handleCreateOrder(req);
      expect(res.status).toBe(200);

      const data = (await res.json()) as {
        order_id: string;
        amount: number;
        currency: string;
        key_id: string;
      };
      expect(data.order_id).toMatch(/^order_/);
      expect(data.amount).toBe(50000);
      expect(data.currency).toBe("INR");
      expect(data.key_id).toBe(testKeyId);
    });
  });

  describe("STEP 3: Backend - Verify Signature (/api/verify-payment)", () => {
    it("rejects missing fields with 400", async () => {
      const req = new Request("http://localhost/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: "order_123",
          payment_id: "pay_123",
          // missing signature
        }),
      });
      const res = await handleVerifyPayment(req);
      expect(res.status).toBe(400);
      const data = (await res.json()) as { success: boolean; error: string };
      expect(data.success).toBe(false);
      expect(data.error).toContain("Missing required fields");
    });

    it("rejects mismatched signature with 400 and does NOT verify", async () => {
      const req = new Request("http://localhost/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: "order_test_999",
          payment_id: "pay_test_999",
          signature: "forged_invalid_signature_hash_12345",
        }),
      });
      const res = await handleVerifyPayment(req);
      expect(res.status).toBe(400);
      const data = (await res.json()) as { success: boolean; error: string };
      expect(data.success).toBe(false);
      expect(data.error).toContain("signature mismatch");
    });

    it("successfully verifies valid HMAC-SHA256 signature", async () => {
      const orderId = "order_live_ABC123";
      const paymentId = "pay_live_XYZ789";

      // Compute standard Razorpay HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
      const validSignature = crypto
        .createHmac("sha256", testKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const req = new Request("http://localhost/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: paymentId,
          signature: validSignature,
        }),
      });
      const res = await handleVerifyPayment(req);
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        success: boolean;
        message: string;
        order_id: string;
        payment_id: string;
      };
      expect(data.success).toBe(true);
      expect(data.message).toContain("Payment verified successfully");
      expect(data.order_id).toBe(orderId);
      expect(data.payment_id).toBe(paymentId);
    });

    it("also supports razorpay_* property names from standard checkout payload", async () => {
      const orderId = "order_checkout_456";
      const paymentId = "pay_checkout_789";

      const validSignature = crypto
        .createHmac("sha256", testKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const req = new Request("http://localhost/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        }),
      });
      const res = await handleVerifyPayment(req);
      expect(res.status).toBe(200);
      const data = (await res.json()) as { success: boolean };
      expect(data.success).toBe(true);
    });
  });
});
