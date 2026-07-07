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

export function useInboxBootstrap() {
  const [state, setState] = useState<InboxBootstrapState>(() => {
    const cached = readInboxBootstrapCache();
    return toBootstrapState(cached, Boolean(cached));
  });
  const [dailySummary, setDailySummary] =
    useState<DailySummarySnapshot | null>(null);
  const [slash, setSlash] = useState(EMPTY_SLASH);
  const [slashRequested, setSlashRequested] = useState(false);

  useEffect(() => {
    triggerInboxMaintenance();

    const controller = new AbortController();

    void fetchInboxBootstrap()
      .then((payload) => {
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
      })
      .catch(() => {});

    return () => controller.abort();
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
