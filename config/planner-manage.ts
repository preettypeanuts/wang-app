import { GLASS_BACKDROP, GLASS_BORDER, GLASS_HIGHLIGHT } from "@/config/glass";
import { GRID_GAP } from "@/config/spacing";
import { SEPARATED_SURFACE } from "@/config/shape";
import type { PlannedItemKind } from "@/types/planner";

export const PLANNER_MANAGE_LIST = `grid min-h-0 max-h-full flex-1 auto-rows-fr grid-cols-1 overflow-y-auto pb-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${GRID_GAP}`;

/** Inner hairline — matches planner-calendar & journal-table borders. */
export const PLANNER_MANAGE_HAIRLINE =
  "border-black/8 dark:border-white/10";

/** Soft fill aligned to GLASS_BORDER tone at the edges. */
export const PLANNER_MANAGE_CARD_SHADE =
  "bg-[linear-gradient(180deg,rgba(255,255,255,0.58)_0%,rgba(255,255,255,0.52)_42%,rgba(255,255,255,0.46)_78%,rgba(0,0,0,0.08)_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_42%,rgba(255,255,255,0.02)_78%,rgba(0,0,0,0.50)_100%)]";

export const PLANNER_MANAGE_CARD = `${SEPARATED_SURFACE} ${GLASS_BACKDROP} ${GLASS_BORDER} ${PLANNER_MANAGE_CARD_SHADE} ${GLASS_HIGHLIGHT} flex max-h-60 min-h-56 flex-col overflow-hidden`;

export const PLANNER_MANAGE_CARD_BODY =
  "flex min-h-0 flex-1 flex-col gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5";

export const PLANNER_MANAGE_CARD_FOOTER = "mt-auto shrink-0";

export const PLANNER_MANAGE_CARD_DIVIDER = "h-px w-full shrink-0";

export const PLANNER_MANAGE_CARD_DIVIDER_LINE =
  `h-px w-full border-t ${PLANNER_MANAGE_HAIRLINE}`;

export const PLANNER_MANAGE_CARD_FOOTER_CONTENT =
  "px-3.5 py-2.5 sm:px-4";

export const PLANNER_MANAGE_INSTALLMENT_COUNT =
  "text-sm font-semibold tabular-nums text-muted-foreground";

export const PLANNER_MANAGE_META =
  "text-[10px] text-muted-foreground";

export const PLANNER_MANAGE_STATUS =
  "text-xs font-semibold sm:text-sm";

export const PLANNER_MANAGE_META_BETWEEN =
  "flex items-center justify-between gap-2";

export const PLANNER_MANAGE_REPEAT =
  "text-[11px] font-medium text-muted-foreground";

export const PLANNER_MANAGE_AMOUNT =
  "text-lg font-bold tabular-nums tracking-tight sm:text-xl";

export const PLANNER_SELECT_TRIGGER =
  "h-9 w-full capitalize";

export const PLANNER_SELECT_CONTENT = "capitalize";

export const PLANNER_SELECT_ITEM = "capitalize";

export const PLANNER_MANAGE_PROGRESS_TRACK =
  `h-full w-full overflow-hidden rounded-none bg-black/8 dark:bg-white/10`;

export const PLANNER_MANAGE_PROGRESS_FILL =
  "h-full rounded-none bg-[#007AFF] transition-[width] duration-300 dark:bg-[#0A84FF]";

export const PLANNER_MANAGE_EMPTY =
  "flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-6 py-16 text-center dark:border-white/12";

export const PLANNER_KIND_STYLES: Record<
  PlannedItemKind,
  { surface: string; color: string; badge: string }
> = {
  bill: {
    surface: "bg-[#FF9500]/15 dark:bg-[#FF9500]/20",
    color: "text-[#FF9500]",
    badge:
      "bg-[#FF9500]/14 text-[#FF9500] ring-1 ring-[#FF9500]/25 dark:bg-[#FF9500]/18 dark:ring-[#FF9500]/30",
  },
  subscription: {
    surface: "bg-[#AF52DE]/15 dark:bg-[#AF52DE]/20",
    color: "text-[#AF52DE]",
    badge:
      "bg-[#AF52DE]/14 text-[#AF52DE] ring-1 ring-[#AF52DE]/25 dark:bg-[#AF52DE]/18 dark:ring-[#AF52DE]/30",
  },
  installment: {
    surface: "bg-[#007AFF]/15 dark:bg-[#007AFF]/20",
    color: "text-[#007AFF]",
    badge:
      "bg-[#007AFF]/14 text-[#007AFF] ring-1 ring-[#007AFF]/25 dark:bg-[#007AFF]/18 dark:ring-[#007AFF]/30",
  },
  income: {
    surface: "bg-[#34C759]/15 dark:bg-[#34C759]/20",
    color: "text-[#34C759]",
    badge:
      "bg-[#34C759]/14 text-[#34C759] ring-1 ring-[#34C759]/25 dark:bg-[#34C759]/18 dark:ring-[#34C759]/30",
  },
};

export function getPlannedKindBadgeClass(kind: PlannedItemKind): string {
  return PLANNER_KIND_STYLES[kind].badge;
}
