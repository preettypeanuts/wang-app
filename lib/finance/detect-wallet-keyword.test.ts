import { describe, expect, it } from "vitest";

import {
  detectWalletCandidates,
  detectWalletFromText,
} from "@/lib/finance/detect-wallet-keyword";

const wallets = [
  { id: "w1", name: "Cash" },
  { id: "w2", name: "BCA" },
  { id: "w3", name: "GoPay" },
];

describe("detectWalletFromText", () => {
  it("matches a wallet name case-insensitively", () => {
    expect(detectWalletFromText("bayar pakai gopay 20rb", wallets)?.id).toBe(
      "w3",
    );
    expect(
      detectWalletFromText("bayar parkir pakai bca 5rb", wallets)?.id,
    ).toBe("w2");
  });

  it("returns null when no wallet is mentioned", () => {
    expect(detectWalletFromText("beli kopi 20rb", wallets)).toBeNull();
  });

  it("does not match wallet names inside other words", () => {
    expect(detectWalletFromText("beli abcambang 5rb", wallets)).toBeNull();
  });

  it("matches a multi-word wallet name by a single token", () => {
    const multiWord = [
      { id: "w1", name: "Cash" },
      { id: "w2", name: "BCA Utama" },
    ];

    expect(detectWalletFromText("bayar pakai bca 5rb", multiWord)?.id).toBe(
      "w2",
    );
  });

  it("prefers a full-name match over a token match", () => {
    const overlapping = [
      { id: "w1", name: "BCA" },
      { id: "w2", name: "BCA Bisnis" },
    ];

    expect(detectWalletFromText("bayar pakai bca 5rb", overlapping)?.id).toBe(
      "w1",
    );
    expect(
      detectWalletFromText("bayar pakai bca bisnis 5rb", overlapping)?.id,
    ).toBe("w2");
  });

  it("returns null when the mention is ambiguous", () => {
    const ambiguous = [
      { id: "w1", name: "BCA Utama" },
      { id: "w2", name: "BCA Bisnis" },
    ];

    expect(detectWalletFromText("bayar pakai bca 5rb", ambiguous)).toBeNull();
    expect(
      detectWalletCandidates("bayar pakai bca 5rb", ambiguous),
    ).toHaveLength(2);
  });

  it("ignores very short name tokens", () => {
    const shortToken = [{ id: "w1", name: "an e-wallet" }];
    expect(detectWalletFromText("makan siang 25rb", shortToken)).toBeNull();
  });
});
