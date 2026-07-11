import { describe, expect, it } from "vitest";

import {
  buildBudgetDetailExplanation,
  formatBudgetDetailExplanationPlain,
} from "@/lib/finance/build-budget-detail-explanation";
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
  it("menyorot angka penting pada pacing cepat", () => {
    const segments = buildBudgetDetailExplanation(buildStatus());
    const plain = formatBudgetDetailExplanationPlain(segments);

    expect(plain).toContain("Rp75.948");
    expect(plain).toContain("Rp70.000");
    expect(plain).toContain("Rp66.729");
    expect(plain).toContain("20 hari");
    expect(plain).toContain("bisa habis sebelum akhir bulan");

    expect(
      segments.some(
        (segment) =>
          segment.tone === "warning" && segment.text.includes("Rp75.948"),
      ),
    ).toBe(true);
    expect(
      segments.some(
        (segment) =>
          segment.tone === "warning" &&
          segment.text.includes("bisa habis sebelum akhir bulan"),
      ),
    ).toBe(true);
    expect(
      segments.filter((segment) => segment.tone === undefined).length,
    ).toBeGreaterThan(0);
  });

  it("menyorot over budget dengan tone danger", () => {
    const segments = buildBudgetDetailExplanation(
      buildStatus({
        spent: 2_200_000,
        remaining: -30_000,
        remainingPercent: 0,
      }),
    );

    expect(
      segments.some(
        (segment) => segment.tone === "danger" && segment.text === "Rp30.000",
      ),
    ).toBe(true);
  });

  it("menjelaskan bulan yang belum dimulai", () => {
    const plain = formatBudgetDetailExplanationPlain(
      buildBudgetDetailExplanation(
        buildStatus({
          budget: { periodMonth: "2026-08" },
          spent: 0,
          remaining: 2_170_000,
        }),
      ),
    );

    expect(plain).toContain("belum dimulai");
    expect(plain).toContain("Rp70.000");
  });
});
