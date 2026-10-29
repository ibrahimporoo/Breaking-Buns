import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_QUANTITY,
  addToCart,
  cartCount,
  cartSubtotal,
  parseCart,
  removeLine,
  serializeCart,
  setQuantity,
  type CartProduct,
} from "@/lib/cart";

const bun: CartProduct = { id: "a", name: "Bun", priceCents: 899, image: null };
const fries: CartProduct = { id: "b", name: "Fries", priceCents: 399, image: "https://x/y.jpg" };

describe("cart", () => {
  it("merges repeated products and sums totals", () => {
    let lines = addToCart([], bun);
    lines = addToCart(lines, bun, 2);
    lines = addToCart(lines, fries);

    assert.equal(lines.length, 2);
    assert.equal(cartCount(lines), 4);
    assert.equal(cartSubtotal(lines), 899 * 3 + 399);
  });

  it("caps quantity and removes lines at zero", () => {
    let lines = addToCart([], bun, 999);
    assert.equal(lines[0].quantity, MAX_QUANTITY);

    lines = setQuantity(lines, "a", 0);
    assert.deepEqual(lines, []);
  });

  it("removes a line without touching others", () => {
    const lines = addToCart(addToCart([], bun), fries);
    assert.deepEqual(removeLine(lines, "a").map((line) => line.id), ["b"]);
  });

  it("round-trips through storage and survives corrupted data", () => {
    const lines = addToCart([], fries, 2);

    assert.deepEqual(parseCart(serializeCart(lines)), lines);
    assert.deepEqual(parseCart("not json"), []);
    assert.deepEqual(parseCart('{"a":1}'), []);
    assert.deepEqual(parseCart('[{"id":"x","name":"n","priceCents":-5,"image":null,"quantity":1}]'), []);
    assert.deepEqual(parseCart(null), []);
  });
});
