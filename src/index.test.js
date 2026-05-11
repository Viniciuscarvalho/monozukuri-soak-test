import { test } from "node:test";
import assert from "node:assert/strict";
import { hello } from "./index.js";

test("default style is casual", () => {
  assert.match(hello("Alice"), /Alice/);
  assert.match(hello("Alice"), /Hey/);
});

test("explicit casual style", () => {
  assert.equal(hello("Alice", "casual"), "Hey, Alice!");
});

test("formal style", () => {
  assert.equal(hello("Alice", "formal"), "Good day, Alice.");
});

test("pirate style", () => {
  assert.equal(hello("Alice", "pirate"), "Ahoy, Alice! Arr!");
});

test("unknown style falls back to casual", () => {
  assert.equal(hello("Alice", "klingon"), hello("Alice", "casual"));
});
