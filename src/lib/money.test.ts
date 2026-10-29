import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bpsToPercentInput, centsToInput, parseMoneyToCents, percentToBps } from "@/lib/money";

describe("money parsing", () => {
  it("turns typed prices into cents", () => {
    assert.equal(parseMoneyToCents("12"), 1200);
    assert.equal(parseMoneyToCents("12.5"), 1250);
    assert.equal(parseMoneyToCents("$9.99"), 999);
    assert.equal(parseMoneyToCents("1,250.00"), 125000);
    assert.equal(parseMoneyToCents("0"), 0);
  });

  it("rejects nonsense", () => {
    for (const bad of ["", "abc", "-5", "1.234", "12.", "1e3", "999999999"]) {
      assert.equal(parseMoneyToCents(bad), null, bad);
    }
  });

  it("round-trips for form inputs", () => {
    assert.equal(centsToInput(1250), "12.50");
    assert.equal(percentToBps("8.25"), 825);
    assert.equal(percentToBps("8.25%"), 825);
    assert.equal(percentToBps("80"), null);
    assert.equal(bpsToPercentInput(825), "8.25");
  });
});
