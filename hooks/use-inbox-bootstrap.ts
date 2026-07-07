"use client";

import { useEffect, useState } from "react";

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
}

function toBootstrapState(
  payload: InboxBootstrapPayload | null,
  ready: boolean,
): InboxBootstrapState {
  return {
    messages: payload?.messages ?? [],
    summary: payload?.summary ?? EMPTY_TODAY_SUMMARY,
    ready,
  };
}

interface InboxBootstrapOptions {
  initialBootstrap?: InboxBootstrapPayload | null;
}

function seedBootstrapCache(payload: InboxBootstrapPayload | null | undefined) {
  if (!payload) {
    return readInboxBootstrapCache();
  }

  const cached = readInboxBootstrapCache();

  if (cached && cached.messages.length >= payload.messages.length) {
    return cached;
  }

  writeInboxBootstrapCache(payload);
  return payload;
}

export function useInboxBootstrap(options: InboxBootstrapOptions = {}) {
  const [state, setState] = useState<InboxBootstrapState>(() => {
    const seeded = seedBootstrapCache(options.initialBootstrap ?? null);
    return toBootstrapState(seeded, Boolean(seeded));
  });
  const [dailySummary, setDailySummary] =
    useState<DailySummarySnapshot | null>(null);
  const [slash, setSlash] = useState(EMPTY_SLASH);
  const [slashRequested, setSlashRequested] = useState(false);

  useEffect(() => {
    const cached = readInboxBootstrapCache();
    const controller = new AbortController();

    function applyPayload(payload: InboxBootstrapPayload | null) {
      if (!payload || controller.signal.aborted) {
        return;
      }

      setState((current) => {
        const merged = mergeInboxBootstrapPayload(
          {
            messages: current.messages,
            summary: current.summary,
          },
          payload,
        );

        writeInboxBootstrapCache(merged);

        return toBootstrapState(merged, true);
      });
    }

    if (!cached) {
      triggerInboxMaintenance();
      void fetchInboxBootstrap().then(applyPayload).catch(() => {});
      return () => controller.abort();
    }

    const refreshId = window.setTimeout(() => {
      void fetchInboxBootstrap().then(applyPayload).catch(() => {});
    }, 4_000);

    return () => {
      controller.abort();
      window.clearTimeout(refreshId);
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

  return {
    ...state,
    dailySummary,
    slash,
    requestSlashContext,
    requestDailySummary,
    applyTransactionSummary,
  };
}
