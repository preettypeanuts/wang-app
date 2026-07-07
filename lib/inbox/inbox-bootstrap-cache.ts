import type { ChatMessage } from "@/types/chat";
import type { TodaySummary } from "@/types/summary";
import { mergeInboxMessageTail } from "@/lib/inbox/merge-inbox-messages";

const CACHE_KEY = "wang.inbox.bootstrap.v2";

export interface InboxBootstrapPayload {
  messages: ChatMessage[];
  summary: TodaySummary;
  hasMoreMessages?: boolean;
}

export const EMPTY_TODAY_SUMMARY: TodaySummary = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  categories: [],
};

export function readInboxBootstrapCache(): InboxBootstrapPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as InboxBootstrapPayload;
  } catch {
    return null;
  }
}

export function writeInboxBootstrapCache(payload: InboxBootstrapPayload) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota errors.
  }
}

export function patchInboxBootstrapMessages(messages: ChatMessage[]) {
  const cached = readInboxBootstrapCache();

  if (!cached) {
    return;
  }

  writeInboxBootstrapCache({
    ...cached,
    messages,
  });
}

export function patchInboxBootstrapSummary(summary: TodaySummary) {
  const cached = readInboxBootstrapCache();

  if (!cached) {
    return;
  }

  writeInboxBootstrapCache({
    ...cached,
    summary,
  });
}

function isPendingMessageId(id: string): boolean {
  return id.startsWith("pending-");
}

function messageIds(messages: ChatMessage[]): Set<string> {
  return new Set(messages.map((message) => message.id));
}

/** Keep optimistic/pending chat rows when a background bootstrap refresh returns stale data. */
export function mergeInboxBootstrapPayload(
  current: InboxBootstrapPayload,
  incoming: InboxBootstrapPayload,
): InboxBootstrapPayload {
  const pending = current.messages.filter((message) =>
    isPendingMessageId(message.id),
  );

  if (pending.length > 0) {
    return {
      summary: current.summary,
      messages: [...incoming.messages, ...pending],
      hasMoreMessages:
        incoming.hasMoreMessages ?? current.hasMoreMessages ?? false,
    };
  }

  if (incoming.messages.length === 0 && current.messages.length > 0) {
    return current;
  }

  const currentIds = messageIds(current.messages);
  const incomingIds = messageIds(incoming.messages);
  const currentIsLocalDeletion = [...currentIds].every((id) =>
    incomingIds.has(id),
  );

  if (currentIsLocalDeletion && current.messages.length < incoming.messages.length) {
    return {
      summary: current.summary,
      messages: current.messages,
      hasMoreMessages: current.hasMoreMessages,
    };
  }

  if (current.messages.length > incoming.messages.length) {
    return {
      summary: current.summary,
      messages: mergeInboxMessageTail(current.messages, incoming.messages),
      hasMoreMessages: current.hasMoreMessages ?? incoming.hasMoreMessages,
    };
  }

  return {
    summary: incoming.summary,
    messages: mergeInboxMessageTail(current.messages, incoming.messages),
    hasMoreMessages: incoming.hasMoreMessages ?? false,
  };
}
