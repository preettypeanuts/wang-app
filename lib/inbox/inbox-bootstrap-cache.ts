import type { ChatMessage } from "@/types/chat";
import type { TodaySummary } from "@/types/summary";

const CACHE_KEY = "wang.inbox.bootstrap.v1";

export interface InboxBootstrapPayload {
  messages: ChatMessage[];
  summary: TodaySummary;
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
    };
  }

  if (current.messages.length > incoming.messages.length) {
    return {
      summary: current.summary,
      messages: current.messages,
    };
  }

  return incoming;
}
