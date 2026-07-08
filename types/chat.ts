import type { ParsedTransaction } from "@/types/transaction";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  /** Primary / first linked transaction (compat for existing UI). */
  transaction?: ParsedTransaction;
  /** All transactions linked to this assistant reply (batch inbox entry). */
  transactions?: ParsedTransaction[];
  /** True when the linked transaction was removed from Journal. */
  transactionDeleted?: boolean;
  /**
   * Show quick-correct chips when category/type detection had low confidence.
   * For batch replies, only set when the primary transaction (or flagged item) is low-confidence.
   */
  lowConfidenceCategory?: boolean;
  /** Transaction id within a batch that should show quick-correct chips. */
  lowConfidenceTransactionId?: string;
}

export interface UnpaidPayPlanChatItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  statusLabel: string;
  installmentIndex: number;
}

export interface ActivePlanChatItem {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export interface ActiveSavingsChatItem {
  id: string;
  name: string;
  savedAmount: number;
  targetAmount: number;
}

export type ChatSlashEntry =
  | { kind: "payplan"; item: UnpaidPayPlanChatItem }
  | { kind: "plan"; item: ActivePlanChatItem }
  | { kind: "savings"; item: ActiveSavingsChatItem };
