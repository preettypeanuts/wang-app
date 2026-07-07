"use client";

import { useEffect, useState } from "react";

import { InboxMobileLayout } from "@/components/inbox/inbox-mobile-layout";
import { InboxView } from "@/components/chat/inbox-view";
import { TodaySummaryPanel } from "@/components/finance/today-summary-panel";
import {
  INBOX_CHAT_COLUMN,
  INBOX_PAGE_ROW,
  INBOX_SUMMARY_ASIDE,
} from "@/config/inbox-desktop";
import type {
  ActivePlanChatItem,
  ActiveSavingsChatItem,
  ChatMessage,
  UnpaidPayPlanChatItem,
} from "@/types/chat";
import type { DailySummarySnapshot, TodaySummary } from "@/types/summary";

interface InboxClientShellProps {
  initialMessages: ChatMessage[];
  summary: TodaySummary;
}

const EMPTY_SLASH = {
  unpaidPayPlanItems: [] as UnpaidPayPlanChatItem[],
  activePlanItems: [] as ActivePlanChatItem[],
  activeSavingsItems: [] as ActiveSavingsChatItem[],
};

export function InboxClientShell({
  initialMessages,
  summary,
}: InboxClientShellProps) {
  const [dailySummary, setDailySummary] = useState<DailySummarySnapshot | null>(
    null,
  );
  const [slash, setSlash] = useState(EMPTY_SLASH);

  useEffect(() => {
    void fetch("/api/inbox/deferred", { method: "POST" }).catch(() => {});

    const controller = new AbortController();

    void fetch("/api/inbox/deferred", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          return null;
        }

        return response.json() as Promise<{
          dailySummary: DailySummarySnapshot | null;
          slash: typeof EMPTY_SLASH;
        }>;
      })
      .then((data) => {
        if (!data) {
          return;
        }

        setDailySummary(data.dailySummary);
        setSlash(data.slash);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <div className={INBOX_PAGE_ROW}>
      <section className={INBOX_CHAT_COLUMN}>
        <InboxMobileLayout dailySummary={dailySummary} summary={summary}>
          <InboxView
            activePlanItems={slash.activePlanItems}
            activeSavingsItems={slash.activeSavingsItems}
            fixedMobileTopBar
            initialMessages={initialMessages}
            unpaidPayPlanItems={slash.unpaidPayPlanItems}
          />
        </InboxMobileLayout>
      </section>
      <aside className={INBOX_SUMMARY_ASIDE}>
        <TodaySummaryPanel dailySummary={dailySummary} summary={summary} />
      </aside>
    </div>
  );
}
