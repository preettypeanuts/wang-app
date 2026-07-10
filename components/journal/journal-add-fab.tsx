"use client";

import { MOBILE_ADD_FAB_ICON } from "@/config/mobile-nav";
import { JOURNAL_ADD_FAB } from "@/config/journal-mobile";
import { UI_LABEL_ADD_TRANSACTION } from "@/config/ui-labels";
import { PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface JournalAddFabProps {
  onClick: () => void;
  className?: string;
}

export function JournalAddFab({ onClick, className }: JournalAddFabProps) {
  return (
    <button
      type="button"
      aria-label={UI_LABEL_ADD_TRANSACTION}
      onClick={onClick}
      className={cn(JOURNAL_ADD_FAB, className)}
    >
      <PlusIcon aria-hidden className={MOBILE_ADD_FAB_ICON} />
    </button>
  );
}
