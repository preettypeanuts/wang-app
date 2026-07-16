import { describe, expect, it } from "vitest";

import {
  computeTransferTotalDebit,
  shouldShowTransferAdminFee,
} from "@/lib/wallets/transfer-admin-fee";

describe("transfer admin fee helpers", () => {
  it("shows admin fee for bank and e-wallet pairs", () => {
    expect(shouldShowTransferAdminFee("bank", "ewallet")).toBe(true);
    expect(shouldShowTransferAdminFee("bank", "bank")).toBe(true);
    expect(shouldShowTransferAdminFee("cash", "bank")).toBe(false);
    expect(shouldShowTransferAdminFee("other", "ewallet")).toBe(false);
  });

  it("totals transfer amount and admin fee", () => {
    expect(computeTransferTotalDebit(50_000, 10_000)).toBe(60_000);
    expect(computeTransferTotalDebit(50_000, 0)).toBe(50_000);
  });
});
