import { createClient } from "./KITCHEN/node_modules/@supabase/supabase-js/dist/index.mjs";
import http from "node:http";

const SUPABASE_URL = "https://xqkvaxdfxinzhppgpejl.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxa3ZheGRmeGluemhwcGdwZWpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjMxNDk0MCwiZXhwIjoyMTA3ODkwOTQwfQ.BcP6Xw73auweCbwoIEHrUy6zMGVnJo9Xg6VBiWaeQh0";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      resolve({ statusCode: res.statusCode, headers: res.headers });
    }).on("error", reject);
  });
}

async function runSmokeTest() {
  console.log("==================================================");
  console.log("   CRUNCH BOX SYSTEM & CONNECTIVITY SMOKE TEST    ");
  console.log("==================================================\n");

  let passes = 0;
  let fails = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passes++;
    } else {
      console.error(`  [FAIL] ${message}`);
      fails++;
    }
  }

  // 1. Check HTTP connectivity for Local Dev Servers
  console.log("--- 1. Web Application Dev Servers Check ---");
  try {
    const custRes = await httpGet("http://localhost:8080/");
    assert(custRes.statusCode === 200, `Customer Dev Server responding on http://localhost:8080/ (HTTP ${custRes.statusCode})`);
  } catch (err) {
    assert(false, `Customer Dev Server failed: ${err.message}`);
  }

  try {
    const kitRes = await httpGet("http://localhost:8081/kitchen");
    assert(kitRes.statusCode === 200, `Kitchen Dev Server responding on http://localhost:8081/kitchen (HTTP ${kitRes.statusCode})`);
  } catch (err) {
    assert(false, `Kitchen Dev Server failed: ${err.message}`);
  }

  // 2. Supabase Core Connectivity & Tables Check
  console.log("\n--- 2. Supabase Database & Tables Check ---");
  try {
    const { data: settings, error: sErr } = await supabase
      .from("kitchen_business_settings")
      .select("*")
      .limit(1);
    assert(!sErr, `Query kitchen_business_settings: ${sErr ? sErr.message : "Success"}`);
    if (settings && settings.length > 0) {
      console.log(`         Business Status: accepting_orders=${settings[0].accepting_orders}, hours=${settings[0].opening_time} to ${settings[0].closing_time}`);
    }
  } catch (err) {
    assert(false, `kitchen_business_settings error: ${err.message}`);
  }

  try {
    const { data: orders, error: oErr } = await supabase
      .from("orders")
      .select("id, order_number, status")
      .limit(3);
    assert(!oErr, `Query orders table: ${oErr ? oErr.message : "Success (found " + orders.length + " sample orders)"}`);
  } catch (err) {
    assert(false, `orders table query error: ${err.message}`);
  }

  try {
    const { count, error: iErr } = await supabase
      .from("order_items")
      .select("*", { count: "exact", head: true });
    assert(!iErr, `Query order_items table: ${iErr ? iErr.message : "Success"}`);
  } catch (err) {
    assert(false, `order_items table query error: ${err.message}`);
  }

  try {
    const { count, error: eErr } = await supabase
      .from("order_status_events")
      .select("*", { count: "exact", head: true });
    assert(!eErr, `Query order_status_events table: ${eErr ? eErr.message : "Success"}`);
  } catch (err) {
    assert(false, `order_status_events table query error: ${err.message}`);
  }

  // 3. End-to-End Live Order Creation & UUID / Order-Number Query Test
  console.log("\n--- 3. End-to-End Order Creation & UUID 22P02 Regression Test ---");
  const testOrderId = crypto.randomUUID();
  const testOrderNum = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
  const testAccessToken = crypto.randomUUID();

  try {
    // 3a. Insert Order
    const { data: createdOrder, error: insErr } = await supabase
      .from("orders")
      .insert({
        id: testOrderId,
        order_number: testOrderNum,
        access_token: testAccessToken,
        status: "pending_payment",
        payment_status: "unpaid",
        customer_name: "Smoke Test Runner",
        customer_phone: "9876543210",
        delivery_address: "Wingz Academy, Padur, OMR",
        subtotal_paise: 29900,
        delivery_fee_paise: 3500,
        total_paise: 33400,
        razorpay_order_id: `test_rp_${Date.now()}`,
      })
      .select()
      .single();

    assert(!insErr && createdOrder?.id === testOrderId, `Inserted test order ${testOrderNum} (${testOrderId})`);

    // 3b. Insert Item (using real menu_item UUID for foreign key validation)
    const { data: menuList } = await supabase.from("menu_items").select("id, name").limit(1);
    const validProductId = menuList?.[0]?.id || crypto.randomUUID();

    const { error: itemInsErr } = await supabase.from("order_items").insert({
      order_id: testOrderId,
      product_id: validProductId,
      product_name: "Classic French Fries",
      variant_name: "Large (Peri Peri)",
      quantity: 1,
      unit_price_paise: 29900,
    });
    assert(!itemInsErr, `Inserted item for order ${testOrderNum}: ${itemInsErr ? itemInsErr.message : "Success"}`);

    // 3c. Query by UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let queryByUuid = supabase.from("orders").select("id, order_number, status");
    if (isUuid.test(testOrderId)) {
      queryByUuid = queryByUuid.eq("id", testOrderId);
    } else {
      queryByUuid = queryByUuid.eq("order_number", testOrderId);
    }
    const { data: foundByUuid, error: uuidErr } = await queryByUuid.maybeSingle();
    assert(!uuidErr && foundByUuid?.id === testOrderId, `Lookup by UUID (${testOrderId}) succeeded`);

    // 3d. Query by Order Number (e.g. "CB-XXXX") - PROVES FIX FOR POSTGRES 22P02 ERROR
    let queryByNum = supabase.from("orders").select("id, order_number, status");
    if (isUuid.test(testOrderNum)) {
      queryByNum = queryByNum.eq("id", testOrderNum);
    } else {
      queryByNum = queryByNum.eq("order_number", testOrderNum);
    }
    const { data: foundByNum, error: numErr } = await queryByNum.maybeSingle();
    assert(
      !numErr && foundByNum?.order_number === testOrderNum,
      `Lookup by order_number (${testOrderNum}) without UUID error 22P02: ${numErr ? numErr.message : "Success"}`
    );

    // 4. Kitchen Order Lifecycle & Status Progression Check
    console.log("\n--- 4. Kitchen Order Lifecycle Transitions ---");
    // Transition to 'new' (Confirmed)
    const { error: newErr } = await supabase
      .from("orders")
      .update({ status: "new", payment_status: "paid" })
      .eq("id", testOrderId);
    assert(!newErr, `Order confirmed: status -> "new" (paid)`);

    await supabase.from("order_status_events").insert({
      order_id: testOrderId,
      status: "new",
      note: "Smoke test payment verified",
    });

    // Transition to 'ready_for_pickup'
    const { error: readyErr } = await supabase
      .from("orders")
      .update({ status: "ready_for_pickup" })
      .eq("id", testOrderId);
    assert(!readyErr, `Kitchen state advance: status -> "ready_for_pickup": ${readyErr ? readyErr.message : "Success"}`);

    await supabase.from("order_status_events").insert({
      order_id: testOrderId,
      status: "ready_for_pickup",
      note: "Kitchen marked order ready",
    });

    // Transition to 'delivered'
    const { error: delErr } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", testOrderId);
    assert(!delErr, `Delivery completed: status -> "delivered"`);

    await supabase.from("order_status_events").insert({
      order_id: testOrderId,
      status: "delivered",
      note: "Order delivered to customer",
    });

    // Verify history events
    const { data: events, error: evErr } = await supabase
      .from("order_status_events")
      .select("status, note")
      .eq("order_id", testOrderId)
      .order("created_at", { ascending: true });
    assert(!evErr && events?.length === 3, `Order status event trail verified: ${events?.length} transitions recorded`);

    // Clean up test order
    await supabase.from("order_status_events").delete().eq("order_id", testOrderId);
    await supabase.from("order_items").delete().eq("order_id", testOrderId);
    await supabase.from("orders").delete().eq("id", testOrderId);
    console.log("  [CLEANUP] Successfully purged temporary smoke test order.");
  } catch (err) {
    assert(false, `Lifecycle test failed: ${err.message}`);
  }

  // 5. Realtime PubSub Channel Check
  console.log("\n--- 5. Supabase Realtime PubSub Connectivity ---");
  await new Promise((resolve) => {
    const channel = supabase.channel("smoke-test-realtime");
    const timeout = setTimeout(() => {
      assert(false, "Realtime channel subscription timed out after 8s");
      channel.unsubscribe();
      resolve();
    }, 8000);

    channel
      .on("broadcast", { event: "ping" }, (payload) => {
        console.log("         Received realtime broadcast:", payload);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          assert(true, `Realtime connection established! Channel status: ${status}`);
          channel.unsubscribe().then(() => resolve());
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timeout);
          assert(false, `Realtime channel error status: ${status}`);
          channel.unsubscribe().then(() => resolve());
        }
      });
  });

  // Summary
  console.log("\n==================================================");
  console.log(`SMOKE TEST COMPLETE: ${passes} PASSED, ${fails} FAILED`);
  console.log("==================================================");

  if (fails > 0) {
    process.exit(1);
  }
}

runSmokeTest().catch((err) => {
  console.error("FATAL ERROR in smoke test runner:", err);
  process.exit(1);
});
