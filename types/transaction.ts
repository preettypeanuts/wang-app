export type TransactionType = "income" | "expense";

export interface ParsedTransaction {
  id?: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  occurredAt: string;
}
