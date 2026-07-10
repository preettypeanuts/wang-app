import { formatIdr } from "@/lib/finance/format-currency";
import type { BudgetStatus } from "@/types/budget";

export type DailyBudgetDayStatus = "under" | "at" | "over";

export interface DailyCategoryBudgetReflection {
  category: string;
  categoryLabel: string;
  daySpent: number;
  dailyLimit: number | null;
  dayDelta: number | null;
  dayStatus: DailyBudgetDayStatus | null;
  monthlyStatus: BudgetStatus;
}

export interface DailySummaryReflectionContext {
  cumulativeBalance: number;
  categoryBudgets: DailyCategoryBudgetReflection[];
}

function formatDailyBudgetDayStatus(
  item: DailyCategoryBudgetReflection,
): string {
  if (
    item.dailyLimit === null ||
    item.dayStatus === null ||
    item.dayDelta === null
  ) {
    return "tidak ada limit harian";
  }

  if (item.dayStatus === "over") {
    return `MELEBIHI budget harian ${formatIdr(item.dayDelta)} — perlu diperhatikan`;
  }

  if (item.dayStatus === "at") {
    return "tepat di limit harian — masih oke";
  }

  return `masih DI BAWAH budget harian (sisa ${formatIdr(Math.abs(item.dayDelta))}) — masih oke`;
}

export function formatDailySummaryReflectionContextForPrompt(
  context: DailySummaryReflectionContext,
): string {
  const lines = [
    `Saldo kumulatif (total sampai hari ini): ${formatIdr(context.cumulativeBalance)}`,
  ];

  if (context.categoryBudgets.length === 0) {
    lines.push(
      "",
      "Budget kategori: (tidak ada budget yang cocok dengan kategori pengeluaran hari ini)",
    );
    return lines.join("\n");
  }

  lines.push("", "Budget vs pengeluaran hari ini:");

  for (const item of context.categoryBudgets) {
    if (item.dailyLimit !== null) {
      lines.push(
        `- ${item.categoryLabel}: keluar ${formatIdr(item.daySpent)} vs budget ${formatIdr(item.dailyLimit)}/hari → ${formatDailyBudgetDayStatus(item)}`,
      );
    } else {
      lines.push(
        `- ${item.categoryLabel}: keluar ${formatIdr(item.daySpent)} (budget bulanan, tanpa limit harian)`,
      );
    }

    const monthly = item.monthlyStatus;
    lines.push(
      `  Bulan ini: terpakai ${formatIdr(monthly.spent)} dari limit ${formatIdr(monthly.totalLimit)} (${monthly.usedPercent}% terpakai, sisa ${formatIdr(Math.max(0, monthly.remaining))})`,
    );
  }

  return lines.join("\n");
}

export function formatDailyBudgetReflectionSnippet(
  item: DailyCategoryBudgetReflection,
): string | null {
  if (
    item.dailyLimit === null ||
    item.dayStatus === null ||
    item.dayDelta === null
  ) {
    return null;
  }

  if (item.dayStatus === "over") {
    return `${item.categoryLabel} melebihi budget harian (${formatIdr(item.daySpent)} vs ${formatIdr(item.dailyLimit)}/hari, over ${formatIdr(item.dayDelta)})`;
  }

  if (item.dayStatus === "at") {
    return `${item.categoryLabel} tepat di budget harian ${formatIdr(item.dailyLimit)}`;
  }

  return `${item.categoryLabel} masih dalam budget harian (${formatIdr(item.daySpent)} dari ${formatIdr(item.dailyLimit)}/hari)`;
}
