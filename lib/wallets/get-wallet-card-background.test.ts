import { describe, expect, it } from "vitest";

import { getAllCuratedInstitutionEntries } from "@/config/wallet-institutions";
import { WALLET_INSTITUTION_BRAND_COLORS } from "@/config/wallet-institutions";
import { getWalletCardBackground } from "@/lib/wallets/get-wallet-card-background";
import { buildBrandGradient } from "@/lib/wallets/hex-color";

describe("buildBrandGradient", () => {
  it("builds a gradient from brand colors", () => {
    expect(buildBrandGradient("#0060AF", "#004E8C")).toContain(
      "linear-gradient(to bottom right",
    );
    expect(buildBrandGradient("#0060AF", "#004E8C")).toContain("#0060AF");
  });
});

describe("getWalletCardBackground", () => {
  it("uses brand gradient when slug is known", () => {
    const result = getWalletCardBackground("bca", "bank");

    expect(result.className).toBeUndefined();
    expect(result.style?.background).toContain("linear-gradient");
  });

  it("falls back to wallet type when slug is unknown", () => {
    const result = getWalletCardBackground(null, "cash");

    expect(result.className).toContain("from-[#34C759]");
    expect(result.style).toBeUndefined();
  });
});

describe("WALLET_INSTITUTION_BRAND_COLORS", () => {
  it("covers most curated institution slugs", () => {
    const missing = getAllCuratedInstitutionEntries()
      .filter((entry) => entry.slug)
      .filter((entry) => !WALLET_INSTITUTION_BRAND_COLORS[entry.slug!])
      .map((entry) => entry.slug);

    expect(missing.length).toBeLessThan(20);
  });
});
