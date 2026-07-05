import { buildTodaySummary } from "@/lib/finance/build-summary";
import { formatDayMonth, formatJournalDate } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import type { DailySummarySnapshot, FinanceCondition } from "@/types/summary";

interface DailySummaryTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
}

export function buildDailySummaryTitle(date: Date): string {
  return `Summary of ${formatDayMonth(date)}`;
}

export function buildDailySummaryMessage(
  date: Date,
  transactions: DailySummaryTransaction[],
  insight?: string | null,
): string {
  const summary = buildTodaySummary(transactions);
  const dateLabel = formatJournalDate(date);
  const transactionCount = transactions.length;

  if (transactionCount === 0) {
    return `Ringkasan harian — ${dateLabel}\n\nTidak ada transaksi tercatat hari ini.`;
  }

  const lines = [
    `Ringkasan harian — ${dateLabel}`,
    "",
    `Pemasukan: ${formatIdr(summary.totalIncome)}`,
    `Pengeluaran: ${formatIdr(summary.totalExpense)}`,
    `Saldo hari ini: ${formatIdr(summary.balance)}`,
    "",
    `${transactionCount} transaksi tercatat.`,
  ];

  if (summary.categories.length > 0) {
    lines.push("", "Top pengeluaran:");
    for (const category of summary.categories.slice(0, 5)) {
      lines.push(
        `• ${category.label} — ${formatIdr(category.total)} (${category.count}x)`,
      );
    }
  }

  lines.push("", "Sampai jumpa besok — terus catat keuanganmu.");

  if (insight) {
    lines.push("", `Refleksi: ${insight}`);
  }

  return lines.join("\n");
}

export function buildDailySummarySnapshot(
  date: Date,
  transactions: DailySummaryTransaction[],
  content: string,
  insight: string | null,
  condition: FinanceCondition | null = null,
): DailySummarySnapshot {
  return {
    date: date.toISOString(),
    title: buildDailySummaryTitle(date),
    content,
    insight,
    condition,
    summary: buildTodaySummary(transactions),
  };
}
