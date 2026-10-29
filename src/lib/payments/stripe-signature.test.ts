import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { verifyStripeSignature } from "@/lib/payments/stripe-signature";

const secret = "whsec_test_secret";
const payload = '{"id":"evt_1","type":"checkout.session.completed"}';
const now = 1_800_000_000;

function sign(timestamp: number, body = payload, key = secret) {
  return createHmac("sha256", key).update(`${timestamp}.${body}`).digest("hex");
}

describe("verifyStripeSignature", () => {
  it("accepts a correct signature", () => {
    const header = `t=${now},v1=${sign(now)}`;

    assert.ok(verifyStripeSignature({ payload, header, secret, nowSeconds: now }));
  });

  it("accepts when any v1 signature matches (secret rotation)", () => {
    const header = `t=${now},v1=${"0".repeat(64)},v1=${sign(now)}`;

    assert.ok(verifyStripeSignature({ payload, header, secret, nowSeconds: now }));
  });

  it("rejects tampered bodies, wrong secrets and malformed headers", () => {
    const header = `t=${now},v1=${sign(now)}`;

    assert.ok(!verifyStripeSignature({ payload: payload + " ", header, secret, nowSeconds: now }));
    assert.ok(!verifyStripeSignature({ payload, header, secret: "other", nowSeconds: now }));
    assert.ok(!verifyStripeSignature({ payload, header: null, secret, nowSeconds: now }));
    assert.ok(!verifyStripeSignature({ payload, header: "garbage", secret, nowSeconds: now }));
    assert.ok(!verifyStripeSignature({ payload, header: `t=${now},v1=zz`, secret, nowSeconds: now }));
  });

  it("rejects replayed (old) requests", () => {
    const header = `t=${now - 301},v1=${sign(now - 301)}`;

    assert.ok(!verifyStripeSignature({ payload, header, secret, nowSeconds: now }));
  });
});
