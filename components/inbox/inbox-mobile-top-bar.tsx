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
import { ChartBarIcon, MagnifyingGlassIcon } from "@/lib/icons";

interface InboxMobileTopBarProps {
  onOpenSummary: () => void;
  onOpenSearch: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

export function InboxMobileTopBar({
  onOpenSummary,
  onOpenSearch,
  onRefresh,
  refreshing = false,
}: InboxMobileTopBarProps) {
  return (
    <header className={INBOX_MOBILE_TOP_BAR_ROOT}>
      <div className={INBOX_MOBILE_TOP_BAR_ROW}>
        <MobileTopBarDrawerButton />

        <p className={INBOX_MOBILE_TOP_BAR_TITLE}>Inbox</p>

        <div className={INBOX_MOBILE_TOP_BAR_ACTIONS}>
          <button
            type="button"
            aria-label="Cari pesan"
            className={INBOX_MOBILE_TOP_BAR_ORB}
            onClick={onOpenSearch}
          >
            <MagnifyingGlassIcon aria-hidden="true" />
          </button>
          <InboxMobileTopBarRefreshButton
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
          <button
            type="button"
            aria-label="Ringkasan hari ini"
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
