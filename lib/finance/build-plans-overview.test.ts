import { describe, expect, it } from "vitest";

import {
  buildFallbackPlansInsight,
  computePlansProjectedBalance,
  computePlansSalaryCycleProjection,
  computePlansSpendableBalance,
  resolvePlansInsightMeta,
} from "@/lib/finance/build-plans-overview";

describe("computePlansSpendableBalance", () => {
  it("excludes unreceived income from projection", () => {
    const spendable = computePlansSpendableBalance(
      1_861_553,
      500_000,
      2_646_640,
      1_183_676,
    );
    const withIncome = computePlansProjectedBalance(
      1_861_553,
      500_000,
      2_646_640,
      1_183_676,
      8_010_000,
    );

    expect(spendable).toBe(-2_468_763);
    expect(withIncome).toBe(5_541_237);
  });
});

describe("computePlansSalaryCycleProjection", () => {
  it("reserves this month's salary for next month's PayPlan and budget", () => {
    const projection = computePlansSalaryCycleProjection(
      1_861_553,
      500_000,
      2_646_640,
      1_183_676,
      6_319_000,
      2_100_000,
      900_000,
    );

    expect(projection).toBe(850_237);
  });

  it("falls back to spendable balance when no income is scheduled", () => {
    const projection = computePlansSalaryCycleProjection(
      2_000_000,
      500_000,
      800_000,
      200_000,
      0,
      1_000_000,
      500_000,
    );

    expect(projection).toBe(computePlansSpendableBalance(2_000_000, 500_000, 800_000, 200_000));
  });
});

describe("resolvePlansInsightMeta", () => {
  it("marks unsafe when cash cannot cover this month's obligations even with salary incoming", () => {
    const meta = resolvePlansInsightMeta(
      500_000,
      1_861_553,
      2_646_640,
      1_183_676,
      8_010_000,
    );

    expect(meta.tone).toBe("unsafe");
  });

  it("does not mark safe from unreceived salary alone", () => {
    const meta = resolvePlansInsightMeta(
      0,
      1_000_000,
      2_500_000,
      0,
      5_000_000,
    );

    expect(meta.tone).toBe("unsafe");
  });

  it("marks safe when spendable balance is comfortable", () => {
    const meta = resolvePlansInsightMeta(
      500_000,
      5_000_000,
      1_000_000,
      500_000,
      6_000_000,
    );

    expect(meta.tone).toBe("safe");
  });
});

describe("buildFallbackPlansInsight", () => {
  it("returns a short verdict without repeating breakdown numbers", () => {
    const insight = buildFallbackPlansInsight(
      500_000,
      1_861_553,
      2_646_640,
      1_183_676,
      8_010_000,
    );

    expect(insight).toContain("Belum aman, kurang");
    expect(insight).not.toContain("PayPlan");
    expect(insight).not.toContain("sisa budget");
    expect(insight).toContain("Gaji terjadwal belum bisa dipakai sekarang.");
  });

  it("mentions a specific category budget when usage is high", () => {
    const insight = buildFallbackPlansInsight(
      500_000,
      1_861_553,
      2_646_640,
      1_183_676,
      0,
      null,
      [
        {
          budget: {
            id: "1",
            category: "food",
            periodMonth: "2026-07",
            limitMode: "fixed",
            dailyAmount: null,
            fixedLimit: 2_000_000,
            dayCount: null,
            note: null,
            repeatNextMonth: false,
          },
          categoryLabel: "Makanan & Minum",
          periodMonth: "2026-07",
          dayCount: 31,
          totalLimit: 2_000_000,
          spent: 1_850_000,
          remaining: 150_000,
          usedPercent: 92,
          remainingPercent: 8,
          pace: {
            elapsedDays: 11,
            remainingDays: 20,
            isCurrentMonth: true,
            isPastMonth: false,
            isFutureMonth: false,
            avgDailySpent: null,
            plannedDailyBudget: null,
            adjustedDailyBudget: null,
            dailyDelta: null,
            paceStatus: "fast",
          },
        },
      ],
    );

    expect(insight).toContain("Makanan & Minum");
    expect(insight).toContain("92%");
  });
});
