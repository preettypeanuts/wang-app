import { describe, expect, it } from "vitest";

import { extractCategoryKeyword } from "@/lib/finance/extract-category-keyword";

describe("extractCategoryKeyword", () => {
  it("extracts the last meaningful token from a grocery purchase", () => {
    expect(extractCategoryKeyword("beli kopi di indomaret 20rb")).toBe(
      "indomaret",
    );
  });

  it("extracts merchant from a two-word description", () => {
    expect(extractCategoryKeyword("kopi indomaret")).toBe("indomaret");
  });

  it("strips amount units and stopwords", () => {
    expect(extractCategoryKeyword("bayar parkir 10rb")).toBe("parkir");
  });

  it("returns empty when only stopwords remain", () => {
    expect(extractCategoryKeyword("beli lagi di")).toBe("");
  });
});
