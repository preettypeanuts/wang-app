"use client";

import { type ReactNode, useState } from "react";

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
}

export function InboxMobileLayout({
  children,
  summary,
  dailySummary,
  onOpenSummary,
}: InboxMobileLayoutProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);

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
          <InboxMobileEdgeBlur />
          <InboxMobileTopBar onOpenSummary={handleOpenSummary} />
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
    </div>
  );
}
