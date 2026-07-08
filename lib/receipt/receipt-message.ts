import type { TransactionCategoryId } from "@/config/categories";
import type { ReceiptDraft } from "@/types/receipt";
import type { ParsedTransaction } from "@/types/transaction";

const RECEIPT_PREFIX = "📄 Struk ";

export function isReceiptUserMessage(content: string): boolean {
  return content.startsWith(RECEIPT_PREFIX);
}

export function parseReceiptUserMessageContent(content: string): {
  merchant: string;
  description: string;
} {
  if (!isReceiptUserMessage(content)) {
    return { merchant: "", description: "" };
  }

  const rest = content.slice(RECEIPT_PREFIX.length);
  const separatorIndex = rest.indexOf(" · ");

  if (separatorIndex >= 0) {
    return {
      merchant: rest.slice(0, separatorIndex).trim(),
      description: rest.slice(separatorIndex + 3).trim(),
    };
  }

  return { merchant: rest.trim(), description: "" };
}

export function buildReceiptDraftFromTransaction(
  transaction: ParsedTransaction,
  merchant = "",
): ReceiptDraft {
  const merchantLabel = merchant.trim() || transaction.description;

  return {
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category as TransactionCategoryId,
    description: transaction.description,
    merchant: merchantLabel,
    occurredAt: transaction.occurredAt,
    rawInput: `[Struk] ${merchantLabel} — ${transaction.description} (${transaction.amount})`,
  };
}
