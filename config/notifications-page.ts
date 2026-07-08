import { GLASS_BORDER, GLASS_FILL, GLASS_TILE_BASE } from "@/config/glass";
import { SEPARATED_SURFACE } from "@/config/shape";
import { STACK_GAP } from "@/config/spacing";

export const NOTIFICATIONS_FEED_PAGE_SIZE = 20;

/** Mobile page root — wallpaper bleeds through (no solid bg). */
export const NOTIFICATIONS_PAGE_ROOT = [
  "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden",
  "max-md:pr-3",
].join(" ");

export const NOTIFICATIONS_PAGE_SCROLL = [
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
  "max-md:-mr-3 max-md:pr-3 max-md:pl-3",
].join(" ");

export const NOTIFICATIONS_PAGE_SCROLL_INNER = ["flex flex-col", STACK_GAP, "pb-3"].join(
  " ",
);

/** iOS Notification Center — summary pill over wallpaper. */
export const NOTIFICATIONS_SUMMARY_BAR = [
  SEPARATED_SURFACE,
  GLASS_TILE_BASE,
  GLASS_BORDER,
  GLASS_FILL,
  "flex items-center justify-between gap-3 px-4 py-3",
].join(" ");

export const NOTIFICATIONS_SUMMARY_TOTAL =
  "text-sm font-semibold tracking-tight text-foreground";

export const NOTIFICATIONS_SUMMARY_UNREAD =
  "text-[12px] font-medium text-muted-foreground";

export const NOTIFICATIONS_MARK_ALL_BUTTON = [
  "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold",
  "text-primary transition-colors",
  "hover:bg-primary/10 active:bg-primary/15",
].join(" ");

/** Single notification card — one glass layer (avoid stacked blurs). */
export const NOTIFICATIONS_LIST_ITEM = [
  SEPARATED_SURFACE,
  GLASS_TILE_BASE,
  GLASS_BORDER,
  GLASS_FILL,
  "w-full text-left transition-opacity",
  "hover:opacity-95 active:opacity-90",
].join(" ");

export const NOTIFICATIONS_LIST_ITEM_UNREAD =
  "ring-1 ring-primary/25 dark:ring-primary/35";

export const NOTIFICATIONS_LIST_ITEM_INNER =
  "flex items-start gap-3 px-3.5 py-3";

export const NOTIFICATIONS_LIST_ITEM_ICON =
  "mt-0.5 size-10 shrink-0 rounded-[0.85rem] object-cover shadow-sm bg-background/70! dark:bg-background/70!";

export const NOTIFICATIONS_LIST_ITEM_TITLE =
  "text-[15px] font-semibold leading-snug tracking-tight text-foreground";

export const NOTIFICATIONS_LIST_ITEM_BODY =
  "mt-0.5 line-clamp-3 text-[13px] leading-snug text-muted-foreground";

export const NOTIFICATIONS_LIST_ITEM_TIME =
  "shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground";

export const NOTIFICATIONS_LIST_ITEM_KIND =
  "text-[11px] font-medium text-muted-foreground";

export const NOTIFICATIONS_EMPTY_STATE = [
  SEPARATED_SURFACE,
  GLASS_TILE_BASE,
  GLASS_BORDER,
  GLASS_FILL,
  "px-4 py-10 text-center",
].join(" ");

export const NOTIFICATIONS_LOAD_MORE_SENTINEL = "h-8 w-full shrink-0";

export const NOTIFICATION_KIND_LABELS = {
  bill_reminder: "Tagihan",
  daily_summary: "Ringkasan",
  weekly_summary: "Rekap minggu",
  ai_brief: "AI Brief",
  alert: "Peringatan",
  savings: "Tabungan",
} as const;
