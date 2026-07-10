import { buildFallbackJournalCondition } from "@/lib/finance/build-journal-condition";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { formatIdr } from "@/lib/finance/format-currency";
import {
  type DailySummaryReflectionContext,
  formatDailyBudgetReflectionSnippet,
} from "@/lib/finance/format-daily-summary-reflection-context";
import type { FinanceCondition } from "@/types/summary";

interface DailySummaryTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
}

function appendBudgetReflection(
  insight: string,
  context: DailySummaryReflectionContext,
): string {
  const budgetSnippets = context.categoryBudgets
    .map((item) => formatDailyBudgetReflectionSnippet(item))
    .filter((snippet): snippet is string => snippet !== null);

  if (budgetSnippets.length === 0) {
    return insight;
  }

  return `${insight} ${budgetSnippets.join(". ")}.`;
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
  context?: DailySummaryReflectionContext,
): string {
  const count = transactions.length;

  if (count === 0) {
    return "Tidak ada transaksi — hari yang tenang tanpa arus kas.";
  }

  const summary = buildTodaySummary(transactions);

  if (summary.totalExpense === 0 && summary.totalIncome > 0) {
    const insight = `Hanya pemasukan ${formatIdr(summary.totalIncome)} — saldo positif tanpa pengeluaran tercatat.`;
    return context ? appendBudgetReflection(insight, context) : insight;
  }

  if (summary.totalIncome === 0 && summary.totalExpense > 0) {
    const top = summary.categories[0];
    const topPart = top
      ? ` Dominasi ${top.label} (${formatIdr(top.total)}).`
      : "";

    const insight = `Pengeluaran ${formatIdr(summary.totalExpense)} tanpa pemasukan.${topPart} Periksa apakah ada pemasukan yang belum dicatat.`;
    return context ? appendBudgetReflection(insight, context) : insight;
  }

  const ratio =
    summary.totalIncome > 0 ? summary.totalExpense / summary.totalIncome : null;

  if (ratio !== null && ratio >= 1) {
    const insight = `Pengeluaran (${formatIdr(summary.totalExpense)}) melebihi pemasukan (${formatIdr(summary.totalIncome)}). Evaluasi kategori discretionary jika ingin mengetatkan bulan ini.`;
    return context ? appendBudgetReflection(insight, context) : insight;
  }

  if (ratio !== null && ratio >= 0.7) {
    const top = summary.categories[0];
    const topPart = top ? ` Fokus terbesar: ${top.label}.` : "";

    const insight = `Pengeluaran cukup tinggi (${Math.round(ratio * 100)}% dari pemasukan).${topPart}`;
    return context ? appendBudgetReflection(insight, context) : insight;
  }

  if (ratio !== null && ratio <= 0.3) {
    const insight = `Pengeluaran terkendali — hanya ${Math.round(ratio * 100)}% dari pemasukan. Pertahankan kebiasaan ini.`;
    return context ? appendBudgetReflection(insight, context) : insight;
  }

  const top = summary.categories[0];

  if (top) {
    const insight = `${count} transaksi, pengeluaran ${formatIdr(summary.totalExpense)}. Terbesar di ${top.label} (${formatIdr(top.total)}).`;
    return context ? appendBudgetReflection(insight, context) : insight;
  }

  const insight = `${count} transaksi tercatat dengan saldo ${formatIdr(summary.balance)}.`;
  return context ? appendBudgetReflection(insight, context) : insight;
}

export function buildFallbackDailySummaryInsightBundle(
  transactions: DailySummaryTransaction[],
  context: DailySummaryReflectionContext,
): { insight: string; condition: FinanceCondition } {
  return {
    insight: buildFallbackDailySummaryInsight(transactions, context),
    condition: buildFallbackDailySummaryCondition(
      transactions,
      context.cumulativeBalance,
    ),
  };
}
