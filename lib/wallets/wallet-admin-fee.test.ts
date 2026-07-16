import { describe, expect, it } from "vitest";

import { parseDayKey } from "@/lib/finance/day-range";
import { findInstallmentIndexDueOn } from "@/lib/wallets/find-installment-index-due-on";
import {
  buildWalletAdminFeeStartAt,
  billingDayToDateInput,
  dateInputToBillingDay,
  isValidWalletAdminFeeDay,
} from "@/lib/wallets/wallet-admin-fee";
import type { PlannedItemRecord } from "@/types/planner";

describe("wallet admin fee helpers", () => {
  it("validates billing day range", () => {
    expect(isValidWalletAdminFeeDay(1)).toBe(true);
    expect(isValidWalletAdminFeeDay(28)).toBe(true);
    expect(isValidWalletAdminFeeDay(29)).toBe(false);
  });

  it("uses this month when billing day is still ahead", () => {
    const startAt = buildWalletAdminFeeStartAt(
      15,
      parseDayKey("2026-07-10"),
    );

    expect(startAt.toISOString()).toContain("2026-07-15");
  });

  it("uses next month when billing day already passed", () => {
    const startAt = buildWalletAdminFeeStartAt(
      5,
      parseDayKey("2026-07-10"),
    );

    expect(startAt.toISOString()).toContain("2026-08-05");
  });

  it("converts billing day to date input and back", () => {
    expect(billingDayToDateInput(15)).toMatch(/-15$/);
    expect(dateInputToBillingDay("2026-07-15")).toBe(15);
    expect(dateInputToBillingDay("2026-01-31")).toBe(28);
  });

  it("finds installment index for due date", () => {
    const item: PlannedItemRecord = {
      id: "plan-1",
      name: "Biaya admin BCA",
      kind: "bill",
      repeat: "monthly",
      amount: 15_000,
      flowType: "expense",
      category: "fees",
      startAt: parseDayKey("2026-05-15"),
      endAt: null,
      installmentCount: null,
      paidInstallmentCount: 0,
      note: "[wallet-admin-fee:wallet-1]",
      walletId: "wallet-1",
    };

    expect(
      findInstallmentIndexDueOn(item, parseDayKey("2026-07-15")),
    ).toBe(2);
    expect(
      findInstallmentIndexDueOn(item, parseDayKey("2026-07-16")),
    ).toBeNull();
  });
});
