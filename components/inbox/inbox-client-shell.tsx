"use client";

import { useCallback, useState } from "react";

import { InboxMobileLayout } from "@/components/inbox/inbox-mobile-layout";
import { InboxChatSkeleton } from "@/components/inbox/inbox-chat-skeleton";
import { InboxView } from "@/components/chat/inbox-view";
import { TodaySummaryPanel } from "@/components/finance/today-summary-panel";
import {
  INBOX_CHAT_COLUMN,
  INBOX_PAGE_ROW,
  INBOX_SUMMARY_ASIDE,
} from "@/config/inbox-desktop";
import type { InboxBootstrapPayload } from "@/lib/inbox/inbox-bootstrap-cache";
import { usePersistentTabActive } from "@/components/shared/persistent-tab-active-context";
import { useInboxBootstrap } from "@/hooks/use-inbox-bootstrap";

interface InboxClientShellProps {
  initialBootstrap?: InboxBootstrapPayload;
  defaultWalletId?: string | null;
  walletOptions?: Array<{ id: string; name: string; balance?: number }>;
}

export function InboxClientShell({
  initialBootstrap,
  defaultWalletId = null,
  walletOptions = [],
}: InboxClientShellProps) {
  const isActiveTab = usePersistentTabActive();
  const [focusMessageId, setFocusMessageId] = useState<string | null>(null);
  const {
    messages,
    summary,
    availableBalance,
    ready,
    dailySummaries,
    slash,
    requestSlashContext,
    requestDailySummary,
    refreshInbox,
    isRefreshing,
    hasMoreMessages,
    applyTransactionSummary,
    applyMessages,
  } = useInboxBootstrap({ initialBootstrap, enabled: isActiveTab });

  const handleFocusMessageHandled = useCallback(() => {
    setFocusMessageId(null);
  }, []);

  return (
    <div className={INBOX_PAGE_ROW}>
      <section className={INBOX_CHAT_COLUMN}>
        <InboxMobileLayout
          availableBalance={availableBalance}
          dailySummaries={dailySummaries}
          messages={messages}
          onFocusMessage={setFocusMessageId}
          onOpenSummary={requestDailySummary}
          onRefresh={() => void refreshInbox()}
          refreshing={isRefreshing}
          summary={summary}
        >
          {!ready && messages.length === 0 ? (
            <InboxChatSkeleton />
          ) : (
            <InboxView
              activePlanItems={slash.activePlanItems}
              activeSavingsItems={slash.activeSavingsItems}
              defaultWalletId={defaultWalletId}
              walletOptions={walletOptions}
              fixedMobileTopBar
              focusMessageId={focusMessageId}
              initialHasMoreMessages={hasMoreMessages}
              initialMessages={messages}
              onFocusMessageHandled={handleFocusMessageHandled}
              onMessagesChange={applyMessages}
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
        <TodaySummaryPanel
          availableBalance={availableBalance}
          summary={summary}
          todayReflection={dailySummaries.todayReflection}
          yesterdaySummary={dailySummaries.yesterdaySummary}
        />
      </aside>
    </div>
  );
}
