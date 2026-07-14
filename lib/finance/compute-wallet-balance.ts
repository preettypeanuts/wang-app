/** Signed delta for one transaction row when summing per wallet. */
export function signedWalletTransactionAmount(
  type: string,
  amount: number,
): number {
  return type === "expense" ? -amount : amount;
}

/** Per-wallet balance = initialBalance + signed sum of assigned transactions. */
export function computeWalletBalance(
  initialBalance: number,
  transactions: ReadonlyArray<{ type: string; amount: number }>,
): number {
  const flowDelta = transactions.reduce(
    (sum, row) => sum + signedWalletTransactionAmount(row.type, row.amount),
    0,
  );

  return initialBalance + flowDelta;
}

/** True when a debit would push the wallet below zero (negative still allowed). */
export function isInsufficientWalletBalance(
  balance: number,
  debitAmount: number,
): boolean {
  return debitAmount > 0 && debitAmount > balance;
}

export type InsufficientWalletBalanceContext = "transfer" | "expense";

export function buildInsufficientWalletBalanceMessage(input: {
  walletName: string;
  balanceLabel: string;
  amountLabel: string;
  context: InsufficientWalletBalanceContext;
}): string {
  if (input.context === "transfer") {
    return `Saldo ${input.walletName} (${input.balanceLabel}) tidak cukup untuk transfer ${input.amountLabel}.`;
  }

  return `Saldo ${input.walletName} (${input.balanceLabel}) tidak cukup untuk pengeluaran ${input.amountLabel}.`;
}
