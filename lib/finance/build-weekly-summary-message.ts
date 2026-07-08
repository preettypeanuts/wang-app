import { getCategoryLabel } from "@/config/categories";
import { formatCompactDayMonth } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";

export interface WeeklySummaryStats {
  weekStart: Date;
  weekEnd: Date;
  totalExpense: number;
  totalIncome: number;
  topCategoryId: string | null;
  topCategoryAmount: number;
  previousWeekExpense: number | null;
}

/** Format expense vs previous week for the weekly recap line. */
export function formatWeeklyExpenseDelta(
  totalExpense: number,
  previousWeekExpense: number | null,
): string | null {
  if (previousWeekExpense === null) {
    return null;
  }

  if (previousWeekExpense === 0) {
    if (totalExpense === 0) {
      return "sama dengan minggu lalu";
    }
    return "baru mulai dibanding minggu lalu (Rp0)";
  }

  const deltaRatio = (totalExpense - previousWeekExpense) / previousWeekExpense;
  const percent = Math.round(Math.abs(deltaRatio) * 100);

  if (percent === 0) {
    return "sama dengan minggu lalu";
  }

  if (deltaRatio > 0) {
    return `naik ${percent}% dari minggu lalu`;
  }

  return `turun ${percent}% dari minggu lalu`;
}

export function buildWeeklySummaryTitle(weekStart: Date, weekEnd: Date): string {
  return `Rekap minggu ${formatCompactDayMonth(weekStart)} - ${formatCompactDayMonth(weekEnd)}`;
}

/**
 * Build assistant content for a weekly recap inbox message.
 * `weekStart`/`weekEnd` are the calendar bounds of the week being summarized.
 */
export function buildWeeklySummaryMessage(stats: WeeklySummaryStats): string {
  const rangeLabel = `${formatCompactDayMonth(stats.weekStart)} - ${formatCompactDayMonth(stats.weekEnd)}`;
  const delta = formatWeeklyExpenseDelta(
    stats.totalExpense,
    stats.previousWeekExpense,
  );

  const expenseLine = delta
    ? `Total keluar: ${formatIdr(stats.totalExpense)} (${delta})`
    : `Total keluar: ${formatIdr(stats.totalExpense)}`;

  const topCategoryLine =
    stats.topCategoryId && stats.topCategoryAmount > 0
      ? `Kategori terbesar: ${getCategoryLabel(stats.topCategoryId)} (${formatIdr(stats.topCategoryAmount)})`
      : "Kategori terbesar: —";

  return [
    `📊 Rekap minggu ini (${rangeLabel})`,
    expenseLine,
    topCategoryLine,
    `Pemasukan: ${formatIdr(stats.totalIncome)}`,
  ].join("\n");
}
