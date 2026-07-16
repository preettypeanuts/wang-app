import { GLASS_SURFACE } from "@/config/glass";
import { GRID_GAP } from "@/config/spacing";
import { SEPARATED_CONTROL, SEPARATED_SURFACE } from "@/config/shape";

export const OVERVIEW_BENTO_GRID = `grid grid-cols-1 ${GRID_GAP} md:grid-cols-2 xl:grid-cols-3`;

/** Mobile page shell — desktop right gutter stays on SidebarInset. */
export const OVERVIEW_PAGE_ROOT = [
  "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden",
  "max-md:pr-3",
].join(" ");

export const OVERVIEW_PAGE_SCROLL = [
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
  "max-md:-mr-3 max-md:pr-3 max-md:pl-3",
].join(" ");

export const OVERVIEW_PAGE_SCROLL_INNER = "pb-3";

export const OVERVIEW_CARD = `${SEPARATED_SURFACE} ${GLASS_SURFACE} overflow-hidden`;

export const OVERVIEW_CARD_PADDING = "p-4";

export const OVERVIEW_SECTION_LABEL =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

export const OVERVIEW_SECTION_TITLE =
  "text-sm font-semibold tracking-tight text-foreground/92";

export const OVERVIEW_SPAN_FULL = "md:col-span-2 xl:col-span-3";

export const OVERVIEW_SPAN_HERO = "md:col-span-1 xl:col-span-2";

export const OVERVIEW_SPAN_WIDE = "md:col-span-2 xl:col-span-2";

/** Greeting + AI Brief side-by-side row. */
export const OVERVIEW_TOP_PAIR = `grid grid-cols-1 ${GRID_GAP} md:grid-cols-2 ${OVERVIEW_SPAN_FULL}`;

/** Tabungan + Monthly Snapshot side-by-side on desktop. */
export const OVERVIEW_SAVINGS_SNAPSHOT_PAIR = `grid grid-cols-1 ${GRID_GAP} md:grid-cols-2 ${OVERVIEW_SPAN_FULL}`;

export const OVERVIEW_BALANCE_METRICS = `mt-4 grid grid-cols-1 ${GRID_GAP} sm:grid-cols-3`;

export const OVERVIEW_BALANCE_METRIC = [
  "flex min-h-[7.5rem] flex-col rounded-xl bg-[#F2F2F78F] p-3 ring-1 ring-black/10",
  "dark:bg-[#3A3A3C8F] dark:ring-white/12",
].join(" ");

export const OVERVIEW_BALANCE_DELTA =
  "mt-1 text-[10px] font-medium tabular-nums";

/** @deprecated Use OVERVIEW_BALANCE_METRIC */
export const OVERVIEW_BALANCE_IN_OUT = OVERVIEW_BALANCE_METRIC;

/** Apple-style icon shell — soft top-to-bottom gradient + inset highlight. */
export const OVERVIEW_ICON_SHELL_BASE = [
  "flex shrink-0 items-center justify-center rounded-[0.65rem] bg-linear-to-b",
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_1px_2px_rgba(0,0,0,0.12)]",
  "ring-1 ring-black/10 dark:ring-white/12",
  "[&_svg]:text-white [&_svg]:drop-shadow-sm",
].join(" ");

export const OVERVIEW_ICON_SHELL_MD = "size-8 [&_svg]:size-3.5 [&_img]:max-h-full [&_img]:max-w-full";

export const OVERVIEW_ICON_SHELL_LG = "size-9 [&_svg]:size-4 [&_img]:max-h-full [&_img]:max-w-full";

export const OVERVIEW_ICON_VARIANTS = {
  green: "from-[#8AE6A8] via-[#34C759] to-[#248A3D]",
  purple: "from-[#D694FF] via-[#AF52DE] to-[#8944AB]",
  orange: "from-[#FFBE5C] via-[#FF9500] to-[#C93400]",
  blue: "from-[#64B5FF] via-[#007AFF] to-[#0055CC]",
  pink: "from-[#FF8FAB] via-[#FF2D55] to-[#D91A45]",
  indigo: "from-[#A09FF0] via-[#5856D6] to-[#3634A3]",
  neutral: "from-[#D1D1D6] via-[#8E8E93] to-[#636366]",
} as const;

export type OverviewIconVariant = keyof typeof OVERVIEW_ICON_VARIANTS;

/** Status badge with solid icon bg for legibility. */
export const OVERVIEW_STATUS_BADGE =
  "inline-flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[10px] font-semibold text-foreground/85 border-1 border-black/10 dark:bg-[#3A3A3C] dark:border-white/14";

export const OVERVIEW_STATUS_BADGE_ICON = [
  "flex size-4 shrink-0 items-center justify-center rounded-md bg-linear-to-b",
  "from-[#D1D1D6] via-[#8E8E93] to-[#636366]",
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_1px_1px_rgba(0,0,0,0.1)]",
  "ring-1 ring-black/10 dark:ring-white/12",
  "[&_svg]:text-white [&_svg]:drop-shadow-sm",
].join(" ");

/** Pill button — solid fill for touch targets. */
export const OVERVIEW_ACTION_LINK = [
  SEPARATED_CONTROL,
  "inline-flex items-center justify-center px-2.5 py-1.5",
  "text-[11px] font-semibold",
  "bg-[#E0EEFF] text-[#007AFF] ring-1 ring-[#007AFF]/30",
  "transition-colors hover:bg-[#CCE0FF] dark:bg-[#1A314F] dark:text-[#0A84FF] dark:ring-[#007AFF]/40 dark:hover:bg-[#243D5C]",
].join(" ");

export const OVERVIEW_AMOUNT_PILL =
  "shrink-0 rounded-lg bg-[#F2F2F7] px-2 py-1 text-sm font-semibold tabular-nums ring-1 ring-black/10 dark:bg-[#3A3A3C] dark:ring-white/12";

export const OVERVIEW_ALERT_TONE_STYLES = {
  warning: "bg-[#FF9500]/12 text-[#FF9500] ring-1 ring-[#FF9500]/20",
  danger: "bg-[#FF3B30]/12 text-[#FF3B30] ring-1 ring-[#FF3B30]/20",
  info: "bg-[#007AFF]/12 text-[#007AFF] ring-1 ring-[#007AFF]/20",
} as const;

export const OVERVIEW_STAT_TILE =
  "rounded-xl bg-black/6 px-3 py-2.5 ring-1 ring-black/8 dark:bg-white/8 dark:ring-white/10";
