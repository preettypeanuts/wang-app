"use client";

import { type ReactNode, useCallback, useMemo, useState } from "react";

import { InboxSearchDrawer } from "@/components/chat/inbox-search-drawer";
import { InboxMobileEdgeBlur } from "@/components/inbox/inbox-mobile-edge-blur";
import { InboxMobileTopBar } from "@/components/inbox/inbox-mobile-top-bar";
import { InboxSearchProvider } from "@/components/inbox/inbox-search-context";
import { InboxTodaySummaryDrawer } from "@/components/inbox/inbox-today-summary-drawer";
import { FixedViewportPortal } from "@/components/shared/fixed-viewport-portal";
import { MobileTabRefreshBar } from "@/components/shared/mobile-tab-refresh-bar";
import { INBOX_MOBILE_PAGE } from "@/config/inbox-mobile";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import type { DailySummarySnapshot, TodaySummary } from "@/types/summary";

interface InboxMobileLayoutProps {
  children: ReactNode;
  summary: TodaySummary;
  dailySummary: DailySummarySnapshot | null;
  messages?: ChatMessage[];
  onOpenSummary?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onFocusMessage?: (messageId: string) => void;
}

export function InboxMobileLayout({
  children,
  summary,
  dailySummary,
  messages = [],
  onOpenSummary,
  onRefresh,
  refreshing = false,
  onFocusMessage,
}: InboxMobileLayoutProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const loadedMessageIds = useMemo(
    () => new Set(messages.map((message) => message.id)),
    [messages],
  );

  const openSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  function handleOpenSummary() {
    onOpenSummary?.();
    setSummaryOpen(true);
  }

  return (
    <InboxSearchProvider onOpen={openSearch}>
      <div
        className={cn(
          "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          INBOX_MOBILE_PAGE,
        )}
      >
        <FixedViewportPortal>
          <div className="md:hidden">
            <MobileTabRefreshBar active={refreshing} />
            <InboxMobileEdgeBlur />
            <InboxMobileTopBar
              onOpenSummary={handleOpenSummary}
              onRefresh={() => onRefresh?.()}
              refreshing={refreshing}
            />
          </div>
        </FixedViewportPortal>

        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>

        <InboxTodaySummaryDrawer
          dailySummary={dailySummary}
          onOpenChange={setSummaryOpen}
          open={summaryOpen}
          summary={summary}
        />

        <InboxSearchDrawer
          loadedMessageIds={loadedMessageIds}
          onOpenChange={setSearchOpen}
          onScrollToMessage={(messageId) => onFocusMessage?.(messageId)}
          open={searchOpen}
        />
      </div>
    </InboxSearchProvider>
  );
}
