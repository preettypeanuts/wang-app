"use client";

import {
  CATEGORY_ICON_BADGE,
  CATEGORY_ICON_BADGE_SIZE,
  CATEGORY_ICON_GLYPH,
  categoryIconAccentStyle,
} from "@/config/category-icon-style";
import { WrenchIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Neutral gray — adjustments are visually distinct from income/expense. */
const ADJUSTMENT_ICON_ACCENT = { light: "#8E8E93", dark: "#98989D" };

interface JournalAdjustmentIconProps {
  className?: string;
}

export function JournalAdjustmentIcon({ className }: JournalAdjustmentIconProps) {
  return (
    <div
      className={cn(CATEGORY_ICON_BADGE, CATEGORY_ICON_BADGE_SIZE, className)}
      style={categoryIconAccentStyle(ADJUSTMENT_ICON_ACCENT)}
    >
      <WrenchIcon className={cn("size-[0.95rem]", CATEGORY_ICON_GLYPH)} />
    </div>
  );
}
