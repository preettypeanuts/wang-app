import { describe, expect, it } from "vitest";

import {
  buildBankInstitutionSections,
  buildEwalletInstitutionSections,
} from "@/lib/wallets/build-wallet-institution-catalog";

describe("buildBankInstitutionSections", () => {
  it("includes a broad bank catalog outside the popular list", () => {
    const sections = buildBankInstitutionSections();
    const popular = sections.find((section) => section.id === "popular");
    const more = sections.find((section) => section.id === "all");

    expect(popular?.options[0]?.slug).toBe("bca");
    expect(popular?.options[1]?.slug).toBe("mandiri");
    expect(popular?.options).toHaveLength(10);
    expect(more?.options.length).toBeGreaterThan(100);
  });
});

describe("buildEwalletInstitutionSections", () => {
  it("includes popular, international, and a broad more e-wallet list", () => {
    const sections = buildEwalletInstitutionSections();

    expect(sections.map((section) => section.id)).toEqual([
      "popular",
      "international",
      "all",
    ]);
    expect(sections[0]?.options[0]?.slug).toBe("dana");
    expect(sections[1]?.options[0]?.slug).toBe("paypal");
    expect(sections[2]?.options.length).toBeGreaterThan(10);
  });
});
