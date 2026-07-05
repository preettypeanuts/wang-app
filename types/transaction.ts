import type { TransactionCategoryId } from "@/config/categories";

export type TransactionType = "income" | "expense";

export interface ParsedTransaction {
  type: TransactionType;
  amount: number;
  category: TransactionCategoryId;
  description: string;
  occurredAt: string;
}
