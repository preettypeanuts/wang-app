"use client";

import { MobileTopBarDrawerButton } from "@/components/shared/mobile-top-bar-drawer-button";
import {
  INBOX_MOBILE_TOP_BAR_ORB,
  INBOX_MOBILE_TOP_BAR_ROOT,
  INBOX_MOBILE_TOP_BAR_ROW,
  INBOX_MOBILE_TOP_BAR_TITLE,
} from "@/config/inbox-mobile";
import { ChartBarIcon } from "@/lib/icons";

interface InboxMobileTopBarProps {
  onOpenSummary: () => void;
}

export function InboxMobileTopBar({ onOpenSummary }: InboxMobileTopBarProps) {
  return (
    <header className={INBOX_MOBILE_TOP_BAR_ROOT}>
      <div className={INBOX_MOBILE_TOP_BAR_ROW}>
        <MobileTopBarDrawerButton />

        <p className={INBOX_MOBILE_TOP_BAR_TITLE}>Inbox</p>

        <button
          type="button"
          aria-label="Ringkasan hari ini"
          className={INBOX_MOBILE_TOP_BAR_ORB}
          onClick={onOpenSummary}
        >
          <ChartBarIcon aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
