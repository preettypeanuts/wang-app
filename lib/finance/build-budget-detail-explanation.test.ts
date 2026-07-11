import { describe, expect, it } from "vitest";

import { buildBudgetDetailExplanation } from "@/lib/finance/build-budget-detail-explanation";
import { computeBudgetPace } from "@/lib/finance/compute-budget-pace";
import type { BudgetStatus, CategoryBudgetRecord } from "@/types/budget";

const referenceDate = new Date("2026-07-11T12:00:00");

function buildStatus(
  overrides: {
    budget?: Partial<CategoryBudgetRecord>;
    spent?: number;
    remaining?: number;
    totalLimit?: number;
    dayCount?: number;
    remainingPercent?: number;
  } = {},
): BudgetStatus {
  const budget: CategoryBudgetRecord = {
    id: "budget-1",
    category: "food",
    periodMonth: "2026-07",
    limitMode: "daily",
    dailyAmount: 70_000,
    fixedLimit: null,
    dayCount: null,
    note: null,
    repeatNextMonth: true,
    ...overrides.budget,
  };

  const base = {
    budget,
    categoryLabel: "Makanan & Minum",
    periodMonth: budget.periodMonth,
    dayCount: overrides.dayCount ?? 31,
    totalLimit: overrides.totalLimit ?? 2_170_000,
    spent: overrides.spent ?? 835_425,
    remaining: overrides.remaining ?? 1_334_575,
    usedPercent: 38,
    remainingPercent: overrides.remainingPercent ?? 62,
  };

  return {
    ...base,
    pace: computeBudgetPace(base, referenceDate),
  };
}

describe("buildBudgetDetailExplanation", () => {
  it("menjelaskan pacing cepat dengan adjusted daily di bawah rencana", () => {
    const explanation = buildBudgetDetailExplanation(buildStatus());

    expect(explanation).toContain("Rp75.948");
    expect(explanation).toContain("Rp70.000");
    expect(explanation).toContain("Rp66.729");
    expect(explanation).toContain("20 hari");
    expect(explanation).toContain("bisa habis sebelum akhir bulan");
  });

  it("menjelaskan kondisi over budget", () => {
    const explanation = buildBudgetDetailExplanation(
      buildStatus({
        spent: 2_200_000,
        remaining: -30_000,
        remainingPercent: 0,
      }),
    );

    expect(explanation).toContain("melebihi limit");
    expect(explanation).toContain("Rp30.000");
  });

  it("menjelaskan bulan yang belum dimulai", () => {
    const explanation = buildBudgetDetailExplanation(
      buildStatus({
        budget: { periodMonth: "2026-08" },
        spent: 0,
        remaining: 2_170_000,
      }),
    );

    expect(explanation).toContain("belum dimulai");
    expect(explanation).toContain("Rp70.000");
  });
});
