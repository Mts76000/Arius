import { describe, expect, it } from "vitest";
import { escapeRegex } from "../../src/utils/regex.js";

describe("escapeRegex", () => {
  it("escapes regex special characters", () => {
    expect(escapeRegex("a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o")).toBe(
      "a\\.b\\*c\\+d\\?e\\^f\\$g\\{h\\}i\\(j\\)k\\|l\\[m\\]n\\\\o",
    );
  });

  it("leaves plain text unchanged", () => {
    expect(escapeRegex("relance client")).toBe("relance client");
  });

  it("neutralizes a catastrophic backtracking pattern", () => {
    const malicious = "(a+)+$";
    const escaped = escapeRegex(malicious);
    const regex = new RegExp(escaped, "i");

    expect(regex.test(malicious)).toBe(true);
    expect(regex.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!")).toBe(
      false,
    );
  });
});
