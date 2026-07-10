"use client";

import { TodaySummaryPanel } from "@/components/finance/today-summary-panel";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { UI_LABEL_TODAY_SUMMARY } from "@/config/ui-labels";
import {
  INBOX_SUMMARY_DRAWER_BODY,
  INBOX_SUMMARY_DRAWER_SURFACE,
} from "@/config/inbox-mobile";
import { useDrawerScrollLock } from "@/hooks/use-drawer-scroll-lock";
import type { DailySummarySnapshot, TodaySummary } from "@/types/summary";

interface InboxTodaySummaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: TodaySummary;
  dailySummary: DailySummarySnapshot | null;
}

export function InboxTodaySummaryDrawer({
  open,
  onOpenChange,
  summary,
  dailySummary,
}: InboxTodaySummaryDrawerProps) {
  useDrawerScrollLock(open);

  return (
    <Drawer onOpenChange={onOpenChange} open={open} showSwipeHandle swipeDirection="right">
      <DrawerContent className={INBOX_SUMMARY_DRAWER_SURFACE}>
        <DrawerTitle className="sr-only">{UI_LABEL_TODAY_SUMMARY}</DrawerTitle>
        <div className={INBOX_SUMMARY_DRAWER_BODY}>
          <TodaySummaryPanel
            dailySummary={dailySummary}
            embedded
            summary={summary}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
