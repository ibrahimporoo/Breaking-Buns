import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toJsonLdString } from "@/lib/json-ld";

describe("toJsonLdString", () => {
  it("cannot break out of a script tag", () => {
    const output = toJsonLdString({ name: "</script><script>alert(1)</script>" });

    assert.ok(!output.includes("</script>"));
    assert.equal(JSON.parse(output).name, "</script><script>alert(1)</script>");
  });
});
