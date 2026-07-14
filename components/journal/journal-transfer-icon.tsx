"use client";

import {
  CATEGORY_ICON_BADGE,
  CATEGORY_ICON_BADGE_SIZE,
  CATEGORY_ICON_GLYPH,
  categoryIconAccentStyle,
} from "@/config/category-icon-style";
import { ArrowsLeftRightIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Neutral gray — transfers are visually distinct from income/expense categories. */
const TRANSFER_ICON_ACCENT = { light: "#8E8E93", dark: "#98989D" };

interface JournalTransferIconProps {
  className?: string;
}

export function JournalTransferIcon({ className }: JournalTransferIconProps) {
  return (
    <div
      className={cn(CATEGORY_ICON_BADGE, CATEGORY_ICON_BADGE_SIZE, className)}
      style={categoryIconAccentStyle(TRANSFER_ICON_ACCENT)}
    >
      <ArrowsLeftRightIcon className={cn("size-[0.95rem]", CATEGORY_ICON_GLYPH)} />
    </div>
  );
}
