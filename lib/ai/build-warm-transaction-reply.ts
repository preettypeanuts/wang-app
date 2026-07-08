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

function buildBudgetFallbackLine(status: BudgetStatus): string {
  const categoryLabel = getCategoryLabel(status.budget.category);
  const remainingLabel = formatIdr(Math.max(0, status.remaining));

  if (status.remaining < 0) {
    return `Heads up — budget ${categoryLabel} sudah over ${formatIdr(Math.abs(status.remaining))}. Pelan-pelan ya~`;
  }

  if (status.remainingPercent <= 20) {
    return `Budget ${categoryLabel} tinggal ${remainingLabel} (${status.remainingPercent}% sisa). Hati-hati ya~`;
  }

  return `Budget ${categoryLabel} masih aman, sisa ${remainingLabel}.`;
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
