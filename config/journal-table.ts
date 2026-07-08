import { GLASS_BACKDROP, GLASS_FILL } from "@/config/glass";
import { SEPARATED_SURFACE } from "@/config/shape";

export const JOURNAL_LIST_CONTAINER =
  "flex min-h-0 flex-1 flex-col overflow-hidden";

export const JOURNAL_LIST_FRAME = `${SEPARATED_SURFACE} flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl`;

export const JOURNAL_LIST_SCROLL =
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain max-md:overflow-visible max-md:flex-none";

export const JOURNAL_LIST_SECTION = "pb-1.5 last:pb-0";

export const JOURNAL_LIST_AMOUNT_INCOME =
  "text-[#2FAE52] dark:text-[#34C759]";

export const JOURNAL_LIST_AMOUNT_EXPENSE = "text-foreground/88";

export const JOURNAL_LIST_SECTION_HEADER = [
  "sticky top-0 z-10 flex items-center justify-between gap-2 px-3 py-1",
].join(" ");

export const JOURNAL_LIST_SECTION_LABEL = [
  "min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/90",
].join(" ");

export const JOURNAL_LIST_SECTION_TOTALS =
  "flex shrink-0 items-center gap-2 text-[10px] font-semibold tabular-nums tracking-tight";

export const JOURNAL_LIST_SECTION_TOTAL_INCOME = JOURNAL_LIST_AMOUNT_INCOME;

export const JOURNAL_LIST_SECTION_TOTAL_EXPENSE =
  "text-[#E85555] dark:text-[#FF6B6B]";

export const JOURNAL_LIST_GROUP = `${SEPARATED_SURFACE} ${GLASS_FILL} overflow-hidden border-1 border-black/6 dark:border-white/8`;

export const JOURNAL_LIST_ICON =
  "flex size-8 shrink-0 items-center justify-center rounded-[0.55rem]";

export const JOURNAL_LIST_ROW =
  "flex items-center gap-2.5 px-3 py-2.5";

export const JOURNAL_LIST_ROW_CONTENT = "min-w-0 flex-1 self-center";

export const JOURNAL_LIST_ROW_TITLE =
  "truncate text-[13px] font-semibold leading-tight text-foreground/92";

export const JOURNAL_LIST_ROW_META =
  "mt-0.5 truncate text-[11px] leading-tight text-muted-foreground";

export const JOURNAL_LIST_ROW_AMOUNT =
  "shrink-0 text-[13px] font-semibold tabular-nums tracking-tight";

export const JOURNAL_LIST_DIVIDER =
  "ml-[calc(2rem+0.625rem)] h-px bg-black/8 dark:bg-white/10";

export const JOURNAL_EMPTY_STATE =
  "flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-black/10 px-6 py-16 text-center dark:border-white/12";

/** @deprecated Use JOURNAL_LIST_* constants — kept for imports during migration. */
export const JOURNAL_TABLE_CONTAINER = JOURNAL_LIST_CONTAINER;
export const JOURNAL_TABLE_SCROLL = JOURNAL_LIST_SCROLL;
