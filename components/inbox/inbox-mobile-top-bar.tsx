"use client";

import { InboxMobileTopBarRefreshButton } from "@/components/inbox/inbox-mobile-top-bar-refresh-button";
import { MobileTopBarDrawerButton } from "@/components/shared/mobile-top-bar-drawer-button";
import {
  INBOX_MOBILE_TOP_BAR_ACTIONS,
  INBOX_MOBILE_TOP_BAR_ORB,
  INBOX_MOBILE_TOP_BAR_ROOT,
  INBOX_MOBILE_TOP_BAR_ROW,
  INBOX_MOBILE_TOP_BAR_TITLE,
} from "@/config/inbox-mobile";
import { UI_LABEL_TODAY_SUMMARY } from "@/config/ui-labels";
import { ChartBarIcon } from "@/lib/icons";

interface InboxMobileTopBarProps {
  onOpenSummary: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

export function InboxMobileTopBar({
  onOpenSummary,
  onRefresh,
  refreshing = false,
}: InboxMobileTopBarProps) {
  return (
    <header className={INBOX_MOBILE_TOP_BAR_ROOT}>
      <div className={INBOX_MOBILE_TOP_BAR_ROW}>
        <MobileTopBarDrawerButton />

        <p className={INBOX_MOBILE_TOP_BAR_TITLE}>Inbox</p>

        <div className={INBOX_MOBILE_TOP_BAR_ACTIONS}>
          <InboxMobileTopBarRefreshButton
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
          <button
            type="button"
            aria-label={UI_LABEL_TODAY_SUMMARY}
            className={INBOX_MOBILE_TOP_BAR_ORB}
            onClick={onOpenSummary}
          >
            <ChartBarIcon aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
