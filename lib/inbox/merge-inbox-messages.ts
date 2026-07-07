import type { ChatMessage } from "@/types/chat";

function isPendingMessageId(id: string): boolean {
  return id.startsWith("pending-");
}

/**
 * Merge a fresh tail page from the server into the current thread.
 * Preserves older messages loaded via infinite scroll when the tail overlaps.
 */
export function mergeInboxMessageTail(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const pending = current.filter((message) => isPendingMessageId(message.id));

  if (incoming.length === 0) {
    return current;
  }

  const oldestIncoming = incoming[0];
  const overlapIndex = current.findIndex(
    (message) => message.id === oldestIncoming.id,
  );

  if (overlapIndex === -1) {
    return pending.length > 0 ? [...incoming, ...pending] : incoming;
  }

  const prefix = current.slice(0, overlapIndex);
  return [...prefix, ...incoming, ...pending];
}

/** Replace thread with latest server page (refresh) but keep optimistic pending rows. */
export function applyInboxMessageRefresh(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const pending = current.filter((message) => isPendingMessageId(message.id));

  if (pending.length === 0) {
    return incoming;
  }

  return [...incoming, ...pending];
}

export function prependOlderInboxMessages(
  current: ChatMessage[],
  older: ChatMessage[],
): ChatMessage[] {
  if (older.length === 0) {
    return current;
  }

  const existingIds = new Set(current.map((message) => message.id));
  const uniqueOlder = older.filter((message) => !existingIds.has(message.id));

  if (uniqueOlder.length === 0) {
    return current;
  }

  return [...uniqueOlder, ...current];
}
