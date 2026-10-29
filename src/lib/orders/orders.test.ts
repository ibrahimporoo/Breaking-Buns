import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateOrderCode, generateTrackingToken, hashTrackingToken } from "@/lib/orders/codes";
import { calculateTotals, minimumShortfall, type PricingSettings } from "@/lib/orders/pricing";
import { placeOrderSchema } from "@/lib/orders/schemas";
import { canTransition, nextStatuses, progressSteps } from "@/lib/orders/status";

const settings: PricingSettings = {
  deliveryFeeCents: 399,
  freeDeliveryThresholdCents: 4000,
  minDeliveryOrderCents: 1500,
  taxRateBps: 800,
};

describe("calculateTotals", () => {
  it("adds delivery fee and tax on food only", () => {
    const totals = calculateTotals(2000, "delivery", settings);

    assert.deepEqual(totals, {
      subtotalCents: 2000,
      deliveryFeeCents: 399,
      taxCents: 160,
      totalCents: 2559,
    });
  });

  it("charges no delivery fee for pickup", () => {
    assert.equal(calculateTotals(2000, "pickup", settings).deliveryFeeCents, 0);
  });

  it("makes delivery free at the threshold, and never when the threshold is 0", () => {
    assert.equal(calculateTotals(4000, "delivery", settings).deliveryFeeCents, 0);
    assert.equal(calculateTotals(3999, "delivery", settings).deliveryFeeCents, 399);
    assert.equal(
      calculateTotals(99999, "delivery", { ...settings, freeDeliveryThresholdCents: 0 })
        .deliveryFeeCents,
      399,
    );
  });

  it("rounds tax to the nearest cent", () => {
    assert.equal(calculateTotals(1099, "pickup", settings).taxCents, 88);
    assert.equal(calculateTotals(1006, "pickup", { ...settings, taxRateBps: 825 }).taxCents, 83);
  });
});

describe("minimumShortfall", () => {
  it("applies to delivery only", () => {
    assert.equal(minimumShortfall(1000, "delivery", settings), 500);
    assert.equal(minimumShortfall(1500, "delivery", settings), 0);
    assert.equal(minimumShortfall(100, "pickup", settings), 0);
  });
});

describe("order status machine", () => {
  it("walks a delivery order through the kitchen", () => {
    assert.deepEqual(nextStatuses("new", "delivery"), ["preparing", "cancelled"]);
    assert.ok(canTransition("ready", "out_for_delivery", "delivery"));
    assert.ok(!canTransition("ready", "completed", "delivery"));
  });

  it("lets pickup orders complete straight from ready", () => {
    assert.ok(canTransition("ready", "completed", "pickup"));
    assert.ok(!canTransition("ready", "out_for_delivery", "pickup"));
  });

  it("never lets staff skip payment or reopen finished orders", () => {
    assert.ok(!canTransition("pending_payment", "new", "delivery"));
    assert.deepEqual(nextStatuses("completed", "pickup"), []);
    assert.deepEqual(nextStatuses("cancelled", "delivery"), []);
  });

  it("gives customers the right progress steps", () => {
    assert.equal(progressSteps("delivery").length, 5);
    assert.ok(!progressSteps("pickup").includes("out_for_delivery"));
  });
});

describe("order codes and tokens", () => {
  it("creates readable, unambiguous codes", () => {
    for (let index = 0; index < 200; index += 1) {
      assert.match(generateOrderCode(), /^BB-[A-HJ-NP-Z2-9]{6}$/);
    }
  });

  it("stores only a hash of the tracking token", () => {
    const { token, hash } = generateTrackingToken();

    assert.notEqual(token, hash);
    assert.equal(hashTrackingToken(token), hash);
    assert.ok(token.length >= 30);
  });
});

describe("placeOrderSchema", () => {
  const base = {
    items: [{ itemId: "7d6a0ee0-3b52-4f4f-8c33-1c0cf7b7a111", quantity: 2 }],
    name: "Ada Lovelace",
    email: "ADA@Example.com",
    phone: "+1 555 123 4567",
    fulfillment: "pickup" as const,
    paymentMethod: "cash" as const,
    expectedTotalCents: 1000,
  };

  it("accepts pickup without an address and lowercases the email", () => {
    const result = placeOrderSchema.safeParse(base);

    assert.ok(result.success);
    assert.equal(result.data.email, "ada@example.com");
  });

  it("requires a full address for delivery", () => {
    const result = placeOrderSchema.safeParse({ ...base, fulfillment: "delivery" });

    assert.ok(!result.success);
    const paths = result.error.issues.map((issue) => issue.path[0]);
    assert.deepEqual(paths.sort(), ["addressLine", "city", "postalCode"]);
  });

  it("rejects empty carts, absurd quantities and filled honeypots", () => {
    assert.ok(!placeOrderSchema.safeParse({ ...base, items: [] }).success);
    assert.ok(
      !placeOrderSchema.safeParse({
        ...base,
        items: [{ itemId: base.items[0].itemId, quantity: 500 }],
      }).success,
    );
    assert.ok(!placeOrderSchema.safeParse({ ...base, website: "http://spam" }).success);
  });
});
