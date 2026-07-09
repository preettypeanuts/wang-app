import { describe, expect, it } from "vitest";

import { buildOverviewBrief } from "@/lib/finance/build-overview-brief";
import type { PlansOverview } from "@/types/plan";
import type { TodaySummary } from "@/types/summary";

const emptySummary: TodaySummary = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  categories: [],
};

const plansOverview: PlansOverview = {
  activeCount: 1,
  availableBalance: 4_426_401,
  estimatedCost: 0,
  upcomingPayPlanTotal: 0,
  upcomingPayPlanCount: 0,
  insight: "",
};

describe("buildOverviewBrief", () => {
  it("uses kemarin when period is yesterday", () => {
    const brief = buildOverviewBrief(
      { label: "Tenang" },
      emptySummary,
      plansOverview,
      { period: "yesterday" },
    );

    expect(brief.text).toContain("Belum ada transaksi kemarin.");
    expect(brief.text).not.toContain("hari ini");
  });

  it("uses hari ini by default", () => {
    const brief = buildOverviewBrief(
      { label: "Tenang" },
      emptySummary,
      plansOverview,
    );

    expect(brief.text).toContain("Belum ada transaksi hari ini.");
  });
});
