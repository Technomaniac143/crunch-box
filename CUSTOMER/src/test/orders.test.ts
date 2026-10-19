import { describe, expect, it } from "vitest";
import { checkBusinessHours, DELIVERY_FEE_PAISE, DELIVERY_FEE_INR } from "@/lib/orders-service";
import { validateCheckout } from "@/routes/checkout";

describe("Operating hours & business rules", () => {
  it("enforces ₹50 delivery fee constant", () => {
    expect(DELIVERY_FEE_INR).toBe(50);
    expect(DELIVERY_FEE_PAISE).toBe(5000);
  });

  it("validates Asia/Kolkata operating hours (6:00 PM – 3:00 AM)", () => {
    // 18:00 IST (12:30 UTC) -> Open
    const openEvening = new Date("2026-10-17T12:30:00Z");
    expect(checkBusinessHours(openEvening).isOpen).toBe(true);

    // 23:30 IST (18:00 UTC) -> Open
    const openNight = new Date("2026-10-17T18:00:00Z");
    expect(checkBusinessHours(openNight).isOpen).toBe(true);

    // 01:15 IST (19:45 UTC previous day) -> Open
    const openLateNight = new Date("2026-10-17T19:45:00Z");
    expect(checkBusinessHours(openLateNight).isOpen).toBe(true);

    // 03:05 IST (21:35 UTC previous day) -> Closed
    const closedAfterThree = new Date("2026-10-17T21:35:00Z");
    expect(checkBusinessHours(closedAfterThree).isOpen).toBe(false);

    // 12:00 IST (06:30 UTC) -> Closed
    const closedAfternoon = new Date("2026-10-17T06:30:00Z");
    expect(checkBusinessHours(closedAfternoon).isOpen).toBe(false);

    // 17:59 IST (12:29 UTC) -> Closed
    const closedJustBeforeSix = new Date("2026-10-17T12:29:00Z");
    expect(checkBusinessHours(closedJustBeforeSix).isOpen).toBe(false);
  });

  it("dynamically reflects updated opening hours (e.g. 4:00 PM / 16:00)", () => {
    // At 5:20 PM IST (11:50 UTC):
    const fiveTwentyPM = new Date("2026-10-17T11:50:00Z");

    // With default 18:00 (6 PM) opening -> Closed
    expect(checkBusinessHours(fiveTwentyPM, "18:00", "03:00").isOpen).toBe(false);

    // With updated 16:00 (4 PM) opening -> Open!
    expect(checkBusinessHours(fiveTwentyPM, "16:00", "03:00").isOpen).toBe(true);
    expect(checkBusinessHours(fiveTwentyPM, "16:00", "03:00").openingFormatted).toBe("4:00 PM");
    expect(checkBusinessHours(fiveTwentyPM, "16:00", "03:00").closingFormatted).toBe("3:00 AM");
  });

  it("validates checkout form requirements strictly", () => {
    // Valid form
    const valid = validateCheckout({
      name: "Karthik Raja",
      phone: "9876543210",
      address: "Flat 402, Sunshine Heights, MG Road, Indiranagar",
      landmark: "Near Metro",
      notes: "Ring bell twice",
    });
    expect(Object.keys(valid)).toHaveLength(0);

    // Invalid phone
    const invalidPhone = validateCheckout({
      name: "Karthik",
      phone: "12345",
      address: "Flat 402, Sunshine Heights, MG Road",
      landmark: "",
      notes: "",
    });
    expect(invalidPhone.phone).toBeDefined();

    // Short address
    const shortAddress = validateCheckout({
      name: "Karthik",
      phone: "9876543210",
      address: "Short",
      landmark: "",
      notes: "",
    });
    expect(shortAddress.address).toBeDefined();

    // Short name
    const shortName = validateCheckout({
      name: "A",
      phone: "9876543210",
      address: "Flat 402, Sunshine Heights, MG Road",
      landmark: "",
      notes: "",
    });
    expect(shortName.name).toBeDefined();
  });
});
