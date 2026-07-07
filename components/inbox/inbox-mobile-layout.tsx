"use client";

import { type ReactNode, useState } from "react";

import { InboxMobileChromeProvider } from "@/components/inbox/inbox-mobile-chrome-context";
import { InboxMobileEdgeBlur } from "@/components/inbox/inbox-mobile-edge-blur";
import { InboxMobileTopBar } from "@/components/inbox/inbox-mobile-top-bar";
import { InboxTodaySummaryDrawer } from "@/components/inbox/inbox-today-summary-drawer";
import { FixedViewportPortal } from "@/components/shared/fixed-viewport-portal";
import { INBOX_MOBILE_PAGE } from "@/config/inbox-mobile";
import { cn } from "@/lib/utils";
import type { DailySummarySnapshot, TodaySummary } from "@/types/summary";

interface InboxMobileLayoutProps {
  children: ReactNode;
  summary: TodaySummary;
  dailySummary: DailySummarySnapshot | null;
  onOpenSummary?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function InboxMobileLayout({
  children,
  summary,
  dailySummary,
  onOpenSummary,
  onRefresh,
  refreshing = false,
}: InboxMobileLayoutProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [showTopBlur, setShowTopBlur] = useState(false);

  function handleOpenSummary() {
    onOpenSummary?.();
    setSummaryOpen(true);
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        INBOX_MOBILE_PAGE,
      )}
    >
      <FixedViewportPortal>
        <div className="md:hidden">
          <InboxMobileEdgeBlur showTopBlur={showTopBlur} />
          <InboxMobileTopBar
            onOpenSummary={handleOpenSummary}
            onRefresh={() => onRefresh?.()}
            refreshing={refreshing}
          />
        </div>
      </FixedViewportPortal>

      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <InboxMobileChromeProvider onTopBlurChange={setShowTopBlur}>
          {children}
        </InboxMobileChromeProvider>
      </div>

      <InboxTodaySummaryDrawer
        dailySummary={dailySummary}
        onOpenChange={setSummaryOpen}
        open={summaryOpen}
        summary={summary}
      />
    </div>
  );
}
