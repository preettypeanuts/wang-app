"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applyTransactionsToSummary } from "@/lib/inbox/apply-transaction-to-summary";
import {
  fetchInboxBootstrap,
  triggerInboxMaintenance,
} from "@/lib/inbox/fetch-inbox-bootstrap";
import {
  EMPTY_TODAY_SUMMARY,
  type InboxBootstrapPayload,
  mergeInboxBootstrapPayload,
  patchInboxBootstrapSummary,
  readInboxBootstrapCache,
  writeInboxBootstrapCache,
} from "@/lib/inbox/inbox-bootstrap-cache";
import { INBOX_BOOTSTRAP_PATCHED_EVENT } from "@/lib/inbox/patch-inbox-on-transaction-deleted";
import { removeTransactionFromSummary } from "@/lib/inbox/remove-transaction-from-summary";
import type {
  ActivePlanChatItem,
  ActiveSavingsChatItem,
  ChatMessage,
  UnpaidPayPlanChatItem,
} from "@/types/chat";
import type { TodaySummary } from "@/types/summary";
import type { InboxDailySummaries } from "@/lib/inbox/get-inbox-daily-summaries";
import type { ParsedTransaction } from "@/types/transaction";

const EMPTY_DAILY_SUMMARIES: InboxDailySummaries = {
  yesterdaySummary: null,
  todayReflection: null,
};

const EMPTY_SLASH = {
  unpaidPayPlanItems: [] as UnpaidPayPlanChatItem[],
  activePlanItems: [] as ActivePlanChatItem[],
  activeSavingsItems: [] as ActiveSavingsChatItem[],
};

interface InboxBootstrapState {
  messages: ChatMessage[];
  summary: TodaySummary;
  availableBalance: number | null;
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
    availableBalance: payload?.availableBalance ?? null,
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
  const [state, setState] = useState<InboxBootstrapState>(() =>
    toBootstrapState(options.initialBootstrap ?? null, Boolean(options.initialBootstrap)),
  );
  const [dailySummaries, setDailySummaries] = useState<InboxDailySummaries>(
    EMPTY_DAILY_SUMMARIES,
  );
  const [slash, setSlash] = useState(EMPTY_SLASH);
  const [slashRequested, setSlashRequested] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const prevEnabledRef = useRef<boolean | null>(null);
  const syncInFlightRef = useRef(false);
  const hydratedCacheRef = useRef(false);

  // Restore session cache after hydration — never in useState (SSR/client mismatch).
  useEffect(() => {
    if (hydratedCacheRef.current) {
      return;
    }

    hydratedCacheRef.current = true;
    const seeded = seedBootstrapCache(options.initialBootstrap ?? null);

    if (!seeded) {
      return;
    }

    setState((current) => {
      const next = toBootstrapState(seeded, true);

      if (
        current.ready === next.ready &&
        current.hasMoreMessages === next.hasMoreMessages &&
        current.messages.length === next.messages.length &&
        current.messages.every(
          (message, index) => message.id === next.messages[index]?.id,
        )
      ) {
        return current;
      }

      return next;
    });
  }, [options.initialBootstrap]);

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
          setDailySummaries(EMPTY_DAILY_SUMMARIES);
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

    window.addEventListener(
      INBOX_BOOTSTRAP_PATCHED_EVENT,
      handleBootstrapPatched,
    );

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
    void fetch("/api/inbox/context?scope=daily-summary", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) {
          return;
        }

        setDailySummaries(
          (data as InboxDailySummaries).yesterdaySummary !== undefined
            ? (data as InboxDailySummaries)
            : EMPTY_DAILY_SUMMARIES,
        );
      })
      .catch(() => {});
  }

  function applyTransactionSummary(
    input: ParsedTransaction | ParsedTransaction[],
  ) {
    const transactions = Array.isArray(input) ? input : [input];
    if (transactions.length === 0) {
      return;
    }

    setDailySummaries(EMPTY_DAILY_SUMMARIES);

    setState((current) => {
      const summary = applyTransactionsToSummary(current.summary, transactions);
      patchInboxBootstrapSummary(summary);
      return { ...current, summary };
    });
  }

  function applyTransactionRemoved(transaction: ParsedTransaction) {
    setState((current) => {
      const summary = removeTransactionFromSummary(
        current.summary,
        transaction,
      );
      patchInboxBootstrapSummary(summary);
      return { ...current, summary };
    });
  }

  function applyMessages(messages: ChatMessage[], hasMoreMessages?: boolean) {
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
    dailySummaries,
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
