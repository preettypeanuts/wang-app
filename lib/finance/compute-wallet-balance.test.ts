import { describe, expect, it } from "vitest";

import {
  buildInsufficientWalletBalanceMessage,
  computeWalletBalance,
  isInsufficientWalletBalance,
  signedWalletTransactionAmount,
} from "@/lib/finance/compute-wallet-balance";

describe("signedWalletTransactionAmount", () => {
  it("negates expense amounts", () => {
    expect(signedWalletTransactionAmount("expense", 50_000)).toBe(-50_000);
  });

  it("keeps income and transfer legs positive", () => {
    expect(signedWalletTransactionAmount("income", 100_000)).toBe(100_000);
    expect(signedWalletTransactionAmount("transfer", 75_000)).toBe(75_000);
    expect(signedWalletTransactionAmount("adjustment", 10_000)).toBe(10_000);
  });
});

describe("computeWalletBalance", () => {
  it("nets income, expense, and transfer legs", () => {
    const balance = computeWalletBalance(100_000, [
      { type: "income", amount: 200_000 },
      { type: "expense", amount: 50_000 },
      { type: "transfer", amount: -30_000 },
      { type: "transfer", amount: 30_000 },
    ]);

    expect(balance).toBe(250_000);
  });

  it("allows negative balances", () => {
    const balance = computeWalletBalance(10_000, [
      { type: "expense", amount: 25_000 },
    ]);

    expect(balance).toBe(-15_000);
  });
});

describe("buildInsufficientWalletBalanceMessage", () => {
  it("describes transfer shortfall", () => {
    expect(
      buildInsufficientWalletBalanceMessage({
        walletName: "BCA",
        balanceLabel: "Rp50.000",
        amountLabel: "Rp100.000",
        context: "transfer",
      }),
    ).toContain("transfer");
  });
});

describe("isInsufficientWalletBalance", () => {
  it("flags debits larger than balance", () => {
    expect(isInsufficientWalletBalance(50_000, 100_000)).toBe(true);
  });

  it("allows exact balance and surplus", () => {
    expect(isInsufficientWalletBalance(100_000, 100_000)).toBe(false);
    expect(isInsufficientWalletBalance(100_000, 50_000)).toBe(false);
  });

  it("ignores non-positive debit amounts", () => {
    expect(isInsufficientWalletBalance(0, 0)).toBe(false);
  });
});
