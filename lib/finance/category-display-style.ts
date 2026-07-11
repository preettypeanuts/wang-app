import {
  getCategoryTileStyle,
  DEFAULT_CATEGORY_TILE,
  CATEGORY_TILE_STYLES,
} from "@/config/summary-tiles";
import type { CategoryIconId } from "@/config/category-icons";

export interface CategoryDisplayStyle {
  surface: string;
  icon: CategoryIconId;
  iconColor: string;
}

export function getCategoryDisplayStyle(
  categoryId: string,
  iconOverride?: CategoryIconId,
): CategoryDisplayStyle {
  const base = getCategoryTileStyle(categoryId);

  if (!iconOverride) {
    return base;
  }

  if (CATEGORY_TILE_STYLES[categoryId]) {
    return {
      ...base,
      icon: iconOverride,
    };
  }

  return {
    ...DEFAULT_CATEGORY_TILE,
    icon: iconOverride,
  };
}
