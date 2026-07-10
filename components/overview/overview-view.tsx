import { OverviewAlertsCard } from "@/components/overview/overview-alerts-card";
import { OverviewBalanceHero } from "@/components/overview/overview-balance-hero";
import { OverviewGreetingCard } from "@/components/overview/overview-greeting-card";
import { OverviewMonthlySnapshotCard } from "@/components/overview/overview-monthly-snapshot-card";
import { OverviewPlansProgressCard } from "@/components/overview/overview-plans-progress-card";
import { OverviewSavingsProgressCard } from "@/components/overview/overview-savings-progress-card";
import { OverviewTodayActivityCard } from "@/components/overview/overview-today-activity-card";
import { OverviewUpcomingCard } from "@/components/overview/overview-upcoming-card";
import {
  OVERVIEW_BENTO_GRID,
  OVERVIEW_SAVINGS_SNAPSHOT_PAIR,
  OVERVIEW_SPAN_FULL,
  OVERVIEW_TOP_PAIR,
} from "@/config/overview";
import type { OverviewPageData } from "@/types/overview";

interface OverviewViewProps {
  data: OverviewPageData;
  aiBrief: React.ReactNode;
}

export function OverviewView({ data, aiBrief }: OverviewViewProps) {
  return (
    <div className={OVERVIEW_BENTO_GRID}>
      <div className={OVERVIEW_TOP_PAIR}>
        <OverviewGreetingCard greeting={data.greeting} className="h-full" />
        {aiBrief}
      </div>

      <OverviewBalanceHero
        balance={data.balance}
        todayIncome={data.todaySummary.totalIncome}
        todayExpense={data.todaySummary.totalExpense}
        dayDeltas={data.dayDeltas}
        filterContext={data.filterContext}
        className={OVERVIEW_SPAN_FULL}
      />

      <OverviewAlertsCard alerts={data.alerts} />

      <OverviewUpcomingCard items={data.upcoming} />

      <OverviewPlansProgressCard overview={data.plansOverview} />

      <div className={OVERVIEW_SAVINGS_SNAPSHOT_PAIR}>
        <OverviewSavingsProgressCard
          className="h-full"
          overview={data.savingsOverview}
        />
        <OverviewMonthlySnapshotCard
          className="h-full"
          snapshot={data.monthlySnapshot}
        />
      </div>

      <OverviewTodayActivityCard
        className={OVERVIEW_SPAN_FULL}
        items={data.todayActivity}
        filterContext={data.filterContext}
      />
    </div>
  );
}
