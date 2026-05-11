import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isEmail, isUrl, isNonEmpty } from "./validate.js";

describe("isEmail", () => {
  it("accepts user@example.com", () => assert.equal(isEmail("user@example.com"), true));
  it("accepts user@example.co.uk", () => assert.equal(isEmail("user@example.co.uk"), true));
  it("rejects plain string", () => assert.equal(isEmail("not-an-email"), false));
  it("rejects empty string", () => assert.equal(isEmail(""), false));
  it("rejects null", () => assert.equal(isEmail(null), false));
  it("rejects undefined", () => assert.equal(isEmail(undefined), false));
});

describe("isUrl", () => {
  it("accepts https://example.com", () => assert.equal(isUrl("https://example.com"), true));
  it("accepts http with path and query", () => assert.equal(isUrl("http://sub.domain.io/path?q=1"), true));
  it("rejects plain string", () => assert.equal(isUrl("not-a-url"), false));
  it("rejects ftp:// protocol", () => assert.equal(isUrl("ftp://example.com"), false));
  it("rejects null", () => assert.equal(isUrl(null), false));
  it("rejects undefined", () => assert.equal(isUrl(undefined), false));
});

describe("isNonEmpty", () => {
  it("accepts non-empty string", () => assert.equal(isNonEmpty("hello"), true));
  it("accepts string with surrounding whitespace", () => assert.equal(isNonEmpty("  x  "), true));
  it("rejects empty string", () => assert.equal(isNonEmpty(""), false));
  it("rejects whitespace-only string", () => assert.equal(isNonEmpty("   "), false));
  it("rejects null", () => assert.equal(isNonEmpty(null), false));
  it("rejects undefined", () => assert.equal(isNonEmpty(undefined), false));
  it("rejects number", () => assert.equal(isNonEmpty(42), false));
});
