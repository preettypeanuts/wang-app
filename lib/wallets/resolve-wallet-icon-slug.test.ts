import { describe, expect, it } from "vitest";

import { getFintechLogoUrl } from "@/lib/wallets/fintech-logo-url";
import { resolveWalletIconSlug } from "@/lib/wallets/resolve-wallet-icon-slug";

describe("getFintechLogoUrl", () => {
  it("builds a local public asset url", () => {
    expect(getFintechLogoUrl("bca")).toBe("/icons/fintech/bca");
  });
});

describe("resolveWalletIconSlug", () => {
  it("uses stored icon when available", () => {
    expect(resolveWalletIconSlug("BCA", "bank", "mandiri")).toBe("mandiri");
  });

  it("resolves popular bank names without stored icon", () => {
    expect(resolveWalletIconSlug("BCA", "bank", null)).toBe("bca");
    expect(resolveWalletIconSlug("SeaBank", "bank", null)).toBe("seabank");
  });

  it("resolves more bank names", () => {
    expect(resolveWalletIconSlug("Jenius", "bank", null)).toBe("jenius");
  });

  it("resolves e-wallet names", () => {
    expect(resolveWalletIconSlug("ShopeePay", "ewallet", null)).toBe(
      "shopee-pay",
    );
    expect(resolveWalletIconSlug("GoPay", "ewallet", null)).toBe("gopay");
    expect(resolveWalletIconSlug("GrabPay", "ewallet", null)).toBe("grab-pay");
  });

  it("returns null for cash wallets", () => {
    expect(resolveWalletIconSlug("Cash", "cash", null)).toBeNull();
  });
});
