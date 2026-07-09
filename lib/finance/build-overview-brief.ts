import { formatIdr } from "@/lib/finance/format-currency";
import type { JournalCondition } from "@/types/journal";
import type { OverviewAiBrief } from "@/types/overview";
import type { PlansOverview } from "@/types/plan";
import type { TodaySummary } from "@/types/summary";

export type OverviewBriefPeriod = "today" | "yesterday";

interface BuildOverviewBriefOptions {
  period?: OverviewBriefPeriod;
}

function dayReference(period: OverviewBriefPeriod): string {
  return period === "yesterday" ? "kemarin" : "hari ini";
}

export function buildOverviewBrief(
  condition: JournalCondition,
  todaySummary: TodaySummary,
  plansOverview: PlansOverview,
  options: BuildOverviewBriefOptions = {},
): OverviewAiBrief {
  const period = options.period ?? "today";
  const dayRef = dayReference(period);
  const conditionLabel = condition.label;
  const hasActivity =
    todaySummary.totalIncome > 0 || todaySummary.totalExpense > 0;

  if (!hasActivity) {
    const planNote =
      plansOverview.activeCount > 0
        ? ` ${plansOverview.activeCount} wish aktif menunggu keputusan.`
        : "";

    return {
      conditionLabel,
      text: `Belum ada transaksi ${dayRef}. Saldo tersedia ${formatIdr(plansOverview.availableBalance)}.${planNote}`,
    };
  }

  const expenseLabel = formatIdr(todaySummary.totalExpense);
  const balanceLabel = formatIdr(plansOverview.availableBalance);

  if (conditionLabel === "Kritis" || conditionLabel === "Boros") {
    return {
      conditionLabel,
      text: `Pengeluaran ${dayRef} ${expenseLabel}. Saldo kumulatif ${balanceLabel} — pertimbangkan tunda belanja non-esensial.`,
    };
  }

  if (conditionLabel === "Waspada") {
    return {
      conditionLabel,
      text: `Pengeluaran ${expenseLabel} ${dayRef} cukup tinggi. Saldo ${balanceLabel}; prioritaskan kebutuhan penting dulu.`,
    };
  }

  const incomePart =
    todaySummary.totalIncome > 0
      ? ` Pemasukan ${formatIdr(todaySummary.totalIncome)}.`
      : "";

  return {
    conditionLabel,
    text: `Pengeluaran ${expenseLabel} masih terkendali.${incomePart} Saldo kumulatif ${balanceLabel}.`,
  };
}
