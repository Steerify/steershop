import { describe, it, expect } from "vitest";
import { escapeForOrIlike } from "../utils";

describe("escapeForOrIlike", () => {
  it("leaves a plain term untouched", () => {
    expect(escapeForOrIlike("blue shirt")).toBe("blue shirt");
  });

  it("strips quotes/backslashes that would break the surrounding double-quoting", () => {
    // Commas and parens are safe once the value is double-quoted, so they stay;
    // a raw quote/backslash would terminate the quoted value, so it's removed.
    expect(escapeForOrIlike('a",b)')).toBe("a ,b)");
    expect(escapeForOrIlike("c\\d")).toBe("c d");
  });

  it("neutralizes LIKE wildcards so input can't become a match-all", () => {
    expect(escapeForOrIlike("100%_off")).toBe("100  off");
  });

  it("trims surrounding whitespace left after stripping", () => {
    expect(escapeForOrIlike('  "hello"  ')).toBe("hello");
  });
});
