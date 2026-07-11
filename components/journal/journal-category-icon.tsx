"use client";

import { useOptionalUserCategoryCatalog } from "@/components/providers/user-category-catalog-provider";
import { CATEGORY_ICON_COMPONENTS } from "@/components/shared/category-icon-map";
import {
  CATEGORY_ICON_BADGE,
  CATEGORY_ICON_BADGE_SIZE,
  CATEGORY_ICON_GLYPH,
  categoryIconAccentStyle,
  getCategoryIconAccent,
} from "@/config/category-icon-style";
import type { CategoryIconId } from "@/config/category-icons";
import type { CategoryIconAccent } from "@/config/category-icon-style";
import { getCategoryDisplayStyle } from "@/lib/finance/category-display-style";
import { cn } from "@/lib/utils";

interface JournalCategoryIconProps {
  category: string;
  type: "income" | "expense";
  className?: string;
  iconOverride?: CategoryIconId;
  accentOverride?: CategoryIconAccent;
}

export function JournalCategoryIcon({
  category,
  type: _type,
  className,
  iconOverride,
  accentOverride,
}: JournalCategoryIconProps) {
  const catalog = useOptionalUserCategoryCatalog();
  const entry = catalog?.getEntry(category);
  const resolvedIcon = iconOverride ?? entry?.icon;
  const style = getCategoryDisplayStyle(category, resolvedIcon);
  const accent =
    accentOverride ?? entry?.accent ?? getCategoryIconAccent(category);
  const IconComponent = CATEGORY_ICON_COMPONENTS[style.icon];

  return (
    <div
      className={cn(CATEGORY_ICON_BADGE, CATEGORY_ICON_BADGE_SIZE, className)}
      style={categoryIconAccentStyle(accent)}
    >
      <IconComponent className={cn("size-[0.95rem]", CATEGORY_ICON_GLYPH)} />
    </div>
  );
}
