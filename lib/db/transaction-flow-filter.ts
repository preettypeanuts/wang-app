import type { Prisma } from "@/generated/prisma/client";
import type { FlowTransactionType, TransactionType } from "@/types/transaction";

/** Income/expense only — excludes wallet-to-wallet transfers from aggregates. */
export const FLOW_TRANSACTION_TYPES = [
  "income",
  "expense",
] as const satisfies readonly FlowTransactionType[];

export function isFlowTransactionType(type: string): type is FlowTransactionType {
  return type === "income" || type === "expense";
}

export function isTransferTransactionType(type: string): type is "transfer" {
  return type === "transfer";
}

export function isAdjustmentTransactionType(type: string): type is "adjustment" {
  return type === "adjustment";
}

/** Non-flow wallet ledger rows — excluded from income/expense aggregates. */
export function isWalletLedgerTransactionType(type: string): boolean {
  return isTransferTransactionType(type) || isAdjustmentTransactionType(type);
}

/** Prisma filter: use on queries that must not include transfer rows. */
export function flowTransactionTypesWhere(): Pick<
  Prisma.TransactionWhereInput,
  "type"
> {
  return {
    type: { in: [...FLOW_TRANSACTION_TYPES] },
  };
}

/** Narrows DB rows after flow-only queries (defensive for TypeScript). */
export function toFlowTransactionRows<
  T extends { type: TransactionType },
>(rows: T[]): Array<T & { type: FlowTransactionType }> {
  return rows.filter(
    (row): row is T & { type: FlowTransactionType } =>
      isFlowTransactionType(row.type),
  );
}

export function assertFlowTransactionType(type: TransactionType): FlowTransactionType {
  if (!isFlowTransactionType(type)) {
    throw new Error(`Expected income or expense transaction, got "${type}".`);
  }

  return type;
}
