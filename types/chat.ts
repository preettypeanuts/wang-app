import type { RecurringSuggestion } from "@/lib/finance/detect-recurring-transaction";
import type { ParsedTransaction } from "@/types/transaction";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  /** Stable React key across optimistic → server id swap. */
  mountKey?: string;
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
  /** Offer to schedule a recurring PayPlan item when a monthly pattern is detected. */
  recurringSuggestion?: RecurringSuggestion;
  /**
   * Wallet quick-correct chips — set when the chat text matched two or more
   * wallet names so the fallback default wallet may be wrong.
   */
  walletCandidates?: WalletChipCandidate[];
}

export interface WalletChipCandidate {
  id: string;
  name: string;
}

export interface UnpaidPayPlanChatItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  statusLabel: string;
  installmentIndex: number;
  flowType: "income" | "expense";
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
