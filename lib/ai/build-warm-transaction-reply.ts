import { getCategoryLabel } from "@/config/categories";
import { formatIdr } from "@/lib/finance/format-currency";
import { formatTransactionOccurredAtHint } from "@/lib/finance/parse-relative-date";
import type { BudgetStatus } from "@/types/budget";
import type { ParsedTransaction } from "@/types/transaction";

const EXPENSE_OPENERS = [
  "Siap, sudah aku catat!",
  "Oke noted~",
  "Mantap, masuk buku!",
  "Catat!",
] as const;

const INCOME_OPENERS = [
  "Mantap!",
  "Asyik, pemasukan masuk!",
  "Siap, sudah dicatat!",
  "Keren!",
] as const;

function pickOpener(transaction: ParsedTransaction): string {
  const pool = transaction.type === "income" ? INCOME_OPENERS : EXPENSE_OPENERS;
  const seed =
    transaction.amount +
    transaction.category.length +
    transaction.description.length;

  return pool[seed % pool.length] ?? pool[0];
}

/** Warm budget warning line — only when over or near limit; null if still healthy. */
export function buildBudgetWarningLine(status: BudgetStatus): string | null {
  const categoryLabel = getCategoryLabel(status.budget.category);
  const remainingLabel = formatIdr(Math.max(0, status.remaining));

  if (status.remaining < 0) {
    return `Heads up — budget ${categoryLabel} sudah over ${formatIdr(Math.abs(status.remaining))}. Pelan-pelan ya~`;
  }

  if (status.remainingPercent <= 20) {
    return `Budget ${categoryLabel} tinggal ${remainingLabel} (${status.remainingPercent}% sisa). Hati-hati ya~`;
  }

  return null;
}

function buildBudgetFallbackLine(status: BudgetStatus): string {
  return (
    buildBudgetWarningLine(status) ??
    `Budget ${getCategoryLabel(status.budget.category)} masih aman, sisa ${formatIdr(Math.max(0, status.remaining))}.`
  );
}

/** Warm template fallback when Gemini is unavailable — safe for client imports. */
export function buildWarmTransactionReply(
  transaction: ParsedTransaction,
  budgetStatus: BudgetStatus | null,
): string {
  const opener = pickOpener(transaction);
  const amountLabel = formatIdr(transaction.amount);
  const categoryLabel = getCategoryLabel(transaction.category);
  const dateHint = formatTransactionOccurredAtHint(transaction.occurredAt);
  const subject =
    transaction.description.length <= 36
      ? transaction.description
      : categoryLabel;

  const lines: string[] = [];

  if (transaction.type === "income") {
    lines.push(
      `${opener} Pemasukan ${amountLabel} (${categoryLabel}) dari "${subject}"${dateHint ? ` ${dateHint}` : ""} sudah masuk.`,
    );
  } else {
    lines.push(
      `${opener} ${amountLabel} untuk ${subject} masuk kategori ${categoryLabel}${dateHint ? ` ${dateHint}` : ""}.`,
    );
  }

  if (budgetStatus) {
    lines.push(buildBudgetFallbackLine(budgetStatus));
  }

  return lines.join("\n");
}

/** Legacy one-liner — kept for backfill & simple cases. */
export function buildTransactionReply(transaction: ParsedTransaction): string {
  const typeLabel = transaction.type === "income" ? "Pemasukan" : "Pengeluaran";
  const categoryLabel = getCategoryLabel(transaction.category);

  return `${typeLabel} ${formatIdr(transaction.amount)} tercatat · ${categoryLabel}`;
}

function formatMultiTransactionBullet(transaction: ParsedTransaction): string {
  const categoryLabel = getCategoryLabel(transaction.category);
  const subject =
    transaction.description.length <= 36
      ? transaction.description
      : categoryLabel;

  return `• ${subject} ${formatIdr(transaction.amount)} (${categoryLabel})`;
}

/** Reply for batch inbox entries — bullets + total + optional budget warnings. */
export function buildWarmMultipleTransactionReply(
  transactions: ParsedTransaction[],
  budgetStatuses: BudgetStatus[],
): string {
  if (transactions.length === 0) {
    return "Belum ada transaksi yang tercatat.";
  }

  if (transactions.length === 1) {
    return buildWarmTransactionReply(
      transactions[0],
      budgetStatuses[0] ?? null,
    );
  }

  const total = transactions.reduce((sum, item) => sum + item.amount, 0);
  const lines = [
    `Siap, ${transactions.length} transaksi tercatat:`,
    ...transactions.map(formatMultiTransactionBullet),
    `Total: ${formatIdr(total)}`,
  ];

  const warnings = budgetStatuses
    .map(buildBudgetWarningLine)
    .filter((line): line is string => Boolean(line));

  const uniqueWarnings = [...new Set(warnings)];
  if (uniqueWarnings.length > 0) {
    lines.push(...uniqueWarnings);
  }

  return lines.join("\n");
}
