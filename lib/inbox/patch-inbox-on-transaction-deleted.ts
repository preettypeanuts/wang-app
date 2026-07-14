import {
  readInboxBootstrapCache,
  writeInboxBootstrapCache,
  type InboxBootstrapPayload,
} from "@/lib/inbox/inbox-bootstrap-cache";
import { removeTransactionFromSummary } from "@/lib/inbox/remove-transaction-from-summary";
import { isTransactionToday } from "@/lib/finance/is-transaction-today";
import type { ParsedTransaction } from "@/types/transaction";

export const INBOX_BOOTSTRAP_PATCHED_EVENT = "wang:inbox-bootstrap-patched";

export interface JournalTransactionDeletedPatch {
  inboxMessageId: string | null;
  transaction: ParsedTransaction;
}

function patchPayload(
  cached: InboxBootstrapPayload,
  input: JournalTransactionDeletedPatch,
): InboxBootstrapPayload {
  const messages = input.inboxMessageId
    ? cached.messages.map((message) =>
        message.id === input.inboxMessageId && message.transaction
          ? { ...message, transactionDeleted: true }
          : message,
      )
    : cached.messages;

  const summary = isTransactionToday(input.transaction.occurredAt)
    ? removeTransactionFromSummary(cached.summary, input.transaction)
    : cached.summary;

  return {
    ...cached,
    messages,
    summary,
  };
}

export function patchInboxBootstrapOnTransactionDeleted(
  input: JournalTransactionDeletedPatch,
): InboxBootstrapPayload | null {
  const cached = readInboxBootstrapCache();

  if (!cached) {
    return null;
  }

  const next = patchPayload(cached, input);
  writeInboxBootstrapCache(next);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<InboxBootstrapPayload>(INBOX_BOOTSTRAP_PATCHED_EVENT, {
        detail: next,
      }),
    );
  }

  return next;
}
