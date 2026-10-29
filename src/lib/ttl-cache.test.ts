import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTtlCache } from "@/lib/ttl-cache";

describe("createTtlCache", () => {
  it("reuses a value until it expires", async () => {
    const cache = createTtlCache<number>(1000);
    let calls = 0;
    const load = async () => ++calls;

    assert.equal(await cache.get(load, 0), 1);
    assert.equal(await cache.get(load, 500), 1);
    assert.equal(calls, 1);
  });

  it("shares one in-flight load between concurrent callers", async () => {
    const cache = createTtlCache<number>(1000);
    let calls = 0;
    const load = async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return calls;
    };

    const results = await Promise.all(Array.from({ length: 50 }, () => cache.get(load)));

    assert.equal(calls, 1);
    assert.ok(results.every((value) => value === 1));
  });

  it("reloads after clear and after a failed load", async () => {
    const cache = createTtlCache<string>(1000);

    await assert.rejects(cache.get(async () => Promise.reject(new Error("db down"))));
    assert.equal(await cache.get(async () => "ok"), "ok");

    cache.clear();
    assert.equal(await cache.get(async () => "fresh"), "fresh");
  });
});
