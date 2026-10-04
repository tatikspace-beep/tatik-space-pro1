import { describe, expect, it } from "vitest";
import { safeReturnPath } from "./authRedirect";

describe("safeReturnPath", () => {
  it("preserves a local destination and its query", () => {
    expect(safeReturnPath("/schools?invite=abc#students")).toBe(
      "/schools?invite=abc#students",
    );
  });

  it("uses the fallback for external or malformed destinations", () => {
    for (const value of [
      undefined,
      "https://example.com",
      "//example.com",
      "/\\example.com",
      "schools",
    ]) {
      expect(safeReturnPath(value)).toBe("/editor");
    }
  });
});
