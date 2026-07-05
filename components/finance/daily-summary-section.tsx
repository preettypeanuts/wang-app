import { DailySummaryReflection } from "@/components/finance/daily-summary-reflection";
import { DailySummaryStats } from "@/components/finance/daily-summary-stats";
import { formatIdr } from "@/lib/finance/format-currency";
import type { DailySummarySnapshot } from "@/types/summary";

interface DailySummarySectionProps {
  dailySummary: DailySummarySnapshot;
}

export function DailySummarySection({ dailySummary }: DailySummarySectionProps) {
  const { summary } = dailySummary;
  const topCategories = summary.categories.slice(0, 2);

  return (
    <section className="space-y-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {dailySummary.title}
      </p>

      <DailySummaryStats
        totalExpense={summary.totalExpense}
        totalIncome={summary.totalIncome}
        balance={summary.balance}
      />

      {topCategories.length > 0 ? (
        <p className="truncate text-xs text-muted-foreground">
          {topCategories
            .map(
              (category) =>
                `${category.label} ${formatIdr(category.total)}`,
            )
            .join(" · ")}
        </p>
      ) : null}

      {dailySummary.insight && dailySummary.condition ? (
        <DailySummaryReflection
          insight={dailySummary.insight}
          condition={dailySummary.condition}
        />
      ) : null}
    </section>
  );
}
