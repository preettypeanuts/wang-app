import { buildTodaySummary } from "@/lib/finance/build-summary";
import { buildFallbackJournalCondition } from "@/lib/finance/build-journal-condition";
import { formatIdr } from "@/lib/finance/format-currency";
import type { FinanceCondition } from "@/types/summary";

interface DailySummaryTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
}

export function buildFallbackDailySummaryCondition(
  transactions: DailySummaryTransaction[],
  cumulativeBalance = 0,
): FinanceCondition {
  const summary = buildTodaySummary(transactions);

  return buildFallbackJournalCondition(
    transactions,
    summary.totalExpense,
    summary.totalIncome,
    cumulativeBalance,
  );
}

export function buildFallbackDailySummaryInsight(
  transactions: DailySummaryTransaction[],
): string {
  const count = transactions.length;

  if (count === 0) {
    return "Tidak ada transaksi — hari yang tenang tanpa arus kas.";
  }

  const summary = buildTodaySummary(transactions);

  if (summary.totalExpense === 0 && summary.totalIncome > 0) {
    return `Hanya pemasukan ${formatIdr(summary.totalIncome)} — saldo positif tanpa pengeluaran tercatat.`;
  }

  if (summary.totalIncome === 0 && summary.totalExpense > 0) {
    const top = summary.categories[0];
    const topPart = top
      ? ` Dominasi ${top.label} (${formatIdr(top.total)}).`
      : "";

    return `Pengeluaran ${formatIdr(summary.totalExpense)} tanpa pemasukan.${topPart} Periksa apakah ada pemasukan yang belum dicatat.`;
  }

  const ratio =
    summary.totalIncome > 0
      ? summary.totalExpense / summary.totalIncome
      : null;

  if (ratio !== null && ratio >= 1) {
    return `Pengeluaran (${formatIdr(summary.totalExpense)}) melebihi pemasukan (${formatIdr(summary.totalIncome)}). Evaluasi kategori discretionary jika ingin mengetatkan bulan ini.`;
  }

  if (ratio !== null && ratio >= 0.7) {
    const top = summary.categories[0];
    const topPart = top ? ` Fokus terbesar: ${top.label}.` : "";

    return `Pengeluaran cukup tinggi (${Math.round(ratio * 100)}% dari pemasukan).${topPart}`;
  }

  if (ratio !== null && ratio <= 0.3) {
    return `Pengeluaran terkendali — hanya ${Math.round(ratio * 100)}% dari pemasukan. Pertahankan kebiasaan ini.`;
  }

  const top = summary.categories[0];

  if (top) {
    return `${count} transaksi, pengeluaran ${formatIdr(summary.totalExpense)}. Terbesar di ${top.label} (${formatIdr(top.total)}).`;
  }

  return `${count} transaksi tercatat dengan saldo ${formatIdr(summary.balance)}.`;
}

export function buildFallbackDailySummaryInsightBundle(
  transactions: DailySummaryTransaction[],
  cumulativeBalance = 0,
): { insight: string; condition: FinanceCondition } {
  return {
    insight: buildFallbackDailySummaryInsight(transactions),
    condition: buildFallbackDailySummaryCondition(
      transactions,
      cumulativeBalance,
    ),
  };
}
