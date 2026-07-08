import type { TransactionCategoryId } from "@/config/categories";

export type TransactionType = "income" | "expense";

export interface ParsedTransaction {
  id?: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategoryId;
  description: string;
  occurredAt: string;
}
