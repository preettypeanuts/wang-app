"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  EMPTY_TODAY_SUMMARY,
  mergeInboxBootstrapPayload,
  patchInboxBootstrapSummary,
  readInboxBootstrapCache,
  writeInboxBootstrapCache,
  type InboxBootstrapPayload,
} from "@/lib/inbox/inbox-bootstrap-cache";
import { applyTransactionToSummary } from "@/lib/inbox/apply-transaction-to-summary";
import {
  INBOX_BOOTSTRAP_PATCHED_EVENT,
} from "@/lib/inbox/patch-inbox-on-transaction-deleted";
import { removeTransactionFromSummary } from "@/lib/inbox/remove-transaction-from-summary";
import {
  fetchInboxBootstrap,
  triggerInboxMaintenance,
} from "@/lib/inbox/fetch-inbox-bootstrap";
import type {
  ActivePlanChatItem,
  ActiveSavingsChatItem,
  ChatMessage,
  UnpaidPayPlanChatItem,
} from "@/types/chat";
import type { DailySummarySnapshot, TodaySummary } from "@/types/summary";
import type { ParsedTransaction } from "@/types/transaction";

const EMPTY_SLASH = {
  unpaidPayPlanItems: [] as UnpaidPayPlanChatItem[],
  activePlanItems: [] as ActivePlanChatItem[],
  activeSavingsItems: [] as ActiveSavingsChatItem[],
};

interface InboxBootstrapState {
  messages: ChatMessage[];
  summary: TodaySummary;
  ready: boolean;
  hasMoreMessages: boolean;
}

function toBootstrapState(
  payload: InboxBootstrapPayload | null,
  ready: boolean,
): InboxBootstrapState {
  return {
    messages: payload?.messages ?? [],
    summary: payload?.summary ?? EMPTY_TODAY_SUMMARY,
    ready,
    hasMoreMessages: payload?.hasMoreMessages ?? false,
  };
}

interface InboxBootstrapOptions {
  initialBootstrap?: InboxBootstrapPayload | null;
  /** Pause background sync when the inbox tab panel is hidden. */
  enabled?: boolean;
}

function isPendingMessageId(id: string): boolean {
  return id.startsWith("pending-");
}

function applyForcedRefreshPayload(
  current: InboxBootstrapPayload,
  incoming: InboxBootstrapPayload,
): InboxBootstrapPayload {
  const pending = current.messages.filter((message) =>
    isPendingMessageId(message.id),
  );

  if (pending.length === 0) {
    return incoming;
  }

  return {
    summary: incoming.summary,
    messages: [...incoming.messages, ...pending],
    hasMoreMessages: incoming.hasMoreMessages ?? false,
  };
}

function seedBootstrapCache(payload: InboxBootstrapPayload | null | undefined) {
  if (!payload) {
    return readInboxBootstrapCache();
  }

  const cached = readInboxBootstrapCache();

  if (cached) {
    const cachedTailId = cached.messages.at(-1)?.id;
    const payloadTailId = payload.messages.at(-1)?.id;

    if (
      cachedTailId &&
      cachedTailId === payloadTailId &&
      cached.messages.length >= payload.messages.length
    ) {
      return cached;
    }
  }

  writeInboxBootstrapCache(payload);
  return payload;
}

export function useInboxBootstrap(options: InboxBootstrapOptions = {}) {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<InboxBootstrapState>(() => {
    const seeded = seedBootstrapCache(options.initialBootstrap ?? null);
    return toBootstrapState(seeded, Boolean(seeded));
  });
  const [dailySummary, setDailySummary] =
    useState<DailySummarySnapshot | null>(null);
  const [slash, setSlash] = useState(EMPTY_SLASH);
  const [slashRequested, setSlashRequested] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const prevEnabledRef = useRef<boolean | null>(null);
  const syncInFlightRef = useRef(false);

  const applyBootstrapPayload = useCallback(
    (payload: InboxBootstrapPayload, mode: "merge" | "force") => {
      setState((current) => {
        const merged =
          mode === "force"
            ? applyForcedRefreshPayload(
                {
                  messages: current.messages,
                  summary: current.summary,
                  hasMoreMessages: current.hasMoreMessages,
                },
                payload,
              )
            : mergeInboxBootstrapPayload(
                {
                  messages: current.messages,
                  summary: current.summary,
                  hasMoreMessages: current.hasMoreMessages,
                },
                payload,
              );

        writeInboxBootstrapCache(merged);

        return toBootstrapState(merged, true);
      });
    },
    [],
  );

  const runBootstrapSync = useCallback(
    async (options?: { force?: boolean; clearDailySummary?: boolean }) => {
      if (syncInFlightRef.current) {
        return;
      }

      syncInFlightRef.current = true;
      setIsSyncing(true);

      try {
        if (options?.force) {
          triggerInboxMaintenance(true);
        }

        const payload = await fetchInboxBootstrap();

        if (!payload) {
          return;
        }

        applyBootstrapPayload(payload, options?.force ? "force" : "merge");

        if (options?.clearDailySummary) {
          setDailySummary(null);
        }
      } finally {
        syncInFlightRef.current = false;
        setIsSyncing(false);
      }
    },
    [applyBootstrapPayload],
  );

  useEffect(() => {
    if (!enabled) {
      prevEnabledRef.current = false;
      return;
    }

    const prev = prevEnabledRef.current;
    prevEnabledRef.current = true;

    if (prev === false) {
      void runBootstrapSync();
      return;
    }

    if (prev !== null) {
      return;
    }

    const cached = readInboxBootstrapCache();

    if (!cached) {
      triggerInboxMaintenance();
      void runBootstrapSync();
    }
  }, [enabled, runBootstrapSync]);

  useEffect(() => {
    function handleBootstrapPatched(event: Event) {
      const detail = (event as CustomEvent<InboxBootstrapPayload>).detail;

      if (!detail) {
        return;
      }

      setState(toBootstrapState(detail, true));
    }

    window.addEventListener(INBOX_BOOTSTRAP_PATCHED_EVENT, handleBootstrapPatched);

    return () => {
      window.removeEventListener(
        INBOX_BOOTSTRAP_PATCHED_EVENT,
        handleBootstrapPatched,
      );
    };
  }, []);

  useEffect(() => {
    if (!slashRequested) {
      return;
    }

    const controller = new AbortController();

    void fetch("/api/inbox/context?scope=slash", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data || controller.signal.aborted) {
          return;
        }

        setSlash(data as typeof EMPTY_SLASH);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [slashRequested]);

  function requestSlashContext() {
    setSlashRequested(true);
  }

  function requestDailySummary() {
    if (dailySummary) {
      return;
    }

    void fetch("/api/inbox/context?scope=daily-summary", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) {
          return;
        }

        setDailySummary(
          (data as { dailySummary: DailySummarySnapshot | null }).dailySummary,
        );
      })
      .catch(() => {});
  }

  function applyTransactionSummary(transaction: ParsedTransaction) {
    setState((current) => {
      const summary = applyTransactionToSummary(current.summary, transaction);
      patchInboxBootstrapSummary(summary);
      return { ...current, summary };
    });
  }

  function applyTransactionRemoved(transaction: ParsedTransaction) {
    setState((current) => {
      const summary = removeTransactionFromSummary(current.summary, transaction);
      patchInboxBootstrapSummary(summary);
      return { ...current, summary };
    });
  }

  function applyMessages(
    messages: ChatMessage[],
    hasMoreMessages?: boolean,
  ) {
    setState((current) => {
      if (
        current.messages.length === messages.length &&
        current.messages.every(
          (message, index) => message.id === messages[index]?.id,
        ) &&
        hasMoreMessages === undefined
      ) {
        return current;
      }

      const next: InboxBootstrapPayload = {
        messages,
        summary: current.summary,
        hasMoreMessages: hasMoreMessages ?? current.hasMoreMessages,
      };

      writeInboxBootstrapCache(next);

      return {
        ...current,
        messages,
        hasMoreMessages: next.hasMoreMessages ?? false,
        ready: true,
      };
    });
  }

  const refreshInbox = useCallback(async () => {
    if (isSyncing) {
      return;
    }

    await runBootstrapSync({ force: true, clearDailySummary: true });
  }, [isSyncing, runBootstrapSync]);

  return {
    ...state,
    dailySummary,
    slash,
    isRefreshing: isSyncing,
    isSyncing,
    requestSlashContext,
    requestDailySummary,
    refreshInbox,
    applyTransactionSummary,
    applyTransactionRemoved,
    applyMessages,
  };
}
