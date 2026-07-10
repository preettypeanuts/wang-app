import {
  PLANS_CARD,
  PLANS_CARD_BODY,
  PLANS_CARD_DIVIDER,
  PLANS_CARD_FOOTER,
  PLANS_CARD_FOOTER_CONTENT,
  PLANS_CARD_LIST,
  PLANS_MOBILE_SOLID_CARD,
  PLANS_MOBILE_SOLID_DIVIDER,
  PLANS_WIDGET_GRID,
  PLANS_WIDGET_TILE,
  PLANS_WIDGET_TILE_LAYOUT,
} from "@/config/plans";
import { SOLID_WIDGET_TILE_STYLES } from "@/config/solid-widget-tiles";
import type { SavingsGoalStatus } from "@/types/savings-goal";

export const SAVINGS_CARD_LIST = PLANS_CARD_LIST;
export const SAVINGS_CARD = PLANS_CARD;
export const SAVINGS_CARD_BODY = PLANS_CARD_BODY;
export const SAVINGS_CARD_FOOTER = PLANS_CARD_FOOTER;
export const SAVINGS_CARD_DIVIDER = PLANS_CARD_DIVIDER;
export const SAVINGS_CARD_FOOTER_CONTENT = PLANS_CARD_FOOTER_CONTENT;
export const SAVINGS_MOBILE_SOLID_CARD = PLANS_MOBILE_SOLID_CARD;
export const SAVINGS_MOBILE_SOLID_DIVIDER = PLANS_MOBILE_SOLID_DIVIDER;
export const SAVINGS_WIDGET_GRID = PLANS_WIDGET_GRID;
export const SAVINGS_WIDGET_TILE = PLANS_WIDGET_TILE;
export const SAVINGS_WIDGET_TILE_LAYOUT = PLANS_WIDGET_TILE_LAYOUT;

export const SAVINGS_STATUS_LABEL: Record<SavingsGoalStatus, string> = {
  active: "Active",
  completed: "Completed",
  paused: "Paused",
};

export const SAVINGS_STATUS_ACCENT: Record<
  SavingsGoalStatus,
  { badge: string; valueColor: string }
> = {
  active: {
    badge: "bg-[#007AFF]/12 text-[#007AFF] dark:bg-[#007AFF]/20",
    valueColor: "text-[#007AFF]",
  },
  completed: {
    badge: "bg-[#34C759]/12 text-[#34C759] dark:bg-[#34C759]/20",
    valueColor: "text-[#34C759]",
  },
  paused: {
    badge: "bg-[#8E8E93]/12 text-[#8E8E93] dark:bg-[#8E8E93]/20",
    valueColor: "text-muted-foreground",
  },
};

export const SAVINGS_WIDGET_SURFACE = {
  active: SOLID_WIDGET_TILE_STYLES.primary,
  saved: SOLID_WIDGET_TILE_STYLES.balance,
  free: SOLID_WIDGET_TILE_STYLES.income,
} as const;

export type SavingsWidgetId = keyof typeof SAVINGS_WIDGET_SURFACE;
