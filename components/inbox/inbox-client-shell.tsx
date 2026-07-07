"use client";

import { InboxMobileLayout } from "@/components/inbox/inbox-mobile-layout";
import { InboxChatSkeleton } from "@/components/inbox/inbox-chat-skeleton";
import { InboxView } from "@/components/chat/inbox-view";
import { TodaySummaryPanel } from "@/components/finance/today-summary-panel";
import {
  INBOX_CHAT_COLUMN,
  INBOX_PAGE_ROW,
  INBOX_SUMMARY_ASIDE,
} from "@/config/inbox-desktop";
import { useInboxBootstrap } from "@/hooks/use-inbox-bootstrap";

export function InboxClientShell() {
  const {
    messages,
    summary,
    ready,
    dailySummary,
    slash,
    requestSlashContext,
    requestDailySummary,
    applyTransactionSummary,
  } = useInboxBootstrap();

  return (
    <div className={INBOX_PAGE_ROW}>
      <section className={INBOX_CHAT_COLUMN}>
        <InboxMobileLayout
          dailySummary={dailySummary}
          onOpenSummary={requestDailySummary}
          summary={summary}
        >
          {!ready && messages.length === 0 ? (
            <InboxChatSkeleton />
          ) : (
            <InboxView
              activePlanItems={slash.activePlanItems}
              activeSavingsItems={slash.activeSavingsItems}
              fixedMobileTopBar
              initialMessages={messages}
              onSlashMenuOpenChange={(open) => {
                if (open) {
                  requestSlashContext();
                }
              }}
              onTransactionRecorded={applyTransactionSummary}
              unpaidPayPlanItems={slash.unpaidPayPlanItems}
            />
          )}
        </InboxMobileLayout>
      </section>
      <aside className={INBOX_SUMMARY_ASIDE}>
        <TodaySummaryPanel dailySummary={dailySummary} summary={summary} />
      </aside>
    </div>
  );
}
