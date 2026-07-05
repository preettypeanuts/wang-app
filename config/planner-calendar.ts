/** Apple Calendar–style event colors for planner cells. */
export const PLANNER_EVENT_CATEGORY_COLORS: Record<string, string> = {
  food: "#30D158",
  groceries: "#30D158",
  transport: "#BF5AF2",
  shopping: "#FF2D55",
  housing: "#FF9F0A",
  utilities: "#FF9F0A",
  subscription: "#0A84FF",
  entertainment: "#FF2D55",
  health: "#FF3B30",
  education: "#0A84FF",
  personal: "#FF2D55",
  family: "#BF5AF2",
  travel: "#0A84FF",
  pets: "#FF9F0A",
  gifts: "#FF2D55",
  business: "#8E8E93",
  insurance: "#FFD60A",
  fees: "#8E8E93",
  investment: "#30D158",
  salary: "#30D158",
  side_income: "#30D158",
  other: "#8E8E93",
};

export const PLANNER_INCOME_EVENT_COLOR = "#30D158";
export const PLANNER_DEFAULT_EVENT_COLOR = "#0A84FF";
export const PLANNER_TODAY_CIRCLE_COLOR = "#FF3B30";

export const PLANNER_MAX_CELL_EVENTS = 2;

export function getPlannerEventColor(
  category: string,
  type: "income" | "expense",
): string {
  if (type === "income") {
    return PLANNER_INCOME_EVENT_COLOR;
  }

  return (
    PLANNER_EVENT_CATEGORY_COLORS[category] ?? PLANNER_DEFAULT_EVENT_COLOR
  );
}

export const PLANNER_CALENDAR_FRAME =
  "shrink-0 overflow-hidden rounded-xl border border-black/8 bg-black/3 dark:border-white/10 dark:bg-black/20";

export const PLANNER_CALENDAR_GRID =
  "grid auto-rows-auto grid-cols-7";

export const PLANNER_CALENDAR_WEEKDAY_HEADER =
  "flex h-10 w-full items-center justify-end pr-2 border-r border-black/8 last:border-r-0 dark:border-white/10";

export const PLANNER_CALENDAR_WEEKDAY =
  "text-[10px] font-medium leading-none text-muted-foreground sm:text-[11px]";

export const PLANNER_CALENDAR_CELL =
  "group relative flex aspect-square w-full min-w-0 flex-col overflow-hidden border-r border-b border-black/8 p-1.5 text-left transition-colors last:border-r-0 dark:border-white/10";

export const PLANNER_CALENDAR_CELL_SELECTED =
  "bg-primary/6 ring-1 ring-primary/15 ring-inset";

export const PLANNER_CALENDAR_CELL_HOVER =
  "hover:bg-white/25 dark:hover:bg-white/5";

export const PLANNER_CALENDAR_DAY_NUMBER =
  "text-[13px] font-medium tabular-nums leading-none";

export const PLANNER_CALENDAR_DAY_TODAY =
  "inline-flex size-6 items-center justify-center rounded-full text-[11px] font-semibold text-white sm:size-7 sm:text-xs";

export const PLANNER_CALENDAR_NAV_GROUP =
  "inline-flex h-7 shrink-0 items-center overflow-hidden rounded-md border border-black/10 bg-black/5 dark:border-white/12 dark:bg-white/6";

export const PLANNER_CALENDAR_NAV_BUTTON =
  "flex h-7 items-center justify-center text-foreground/75 transition-colors hover:bg-white/40 dark:hover:bg-white/10";

export const PLANNER_CALENDAR_EVENT_BAR =
  "flex min-h-[18px] min-w-0 items-center gap-1 rounded-[4px] bg-black/4 px-1 py-0.5 text-[9px] leading-none sm:min-h-[20px] sm:text-[10px] dark:bg-white/6";

export const PLANNER_CALENDAR_EVENT_BAR_INCOME =
  "bg-[#30D158]/12 dark:bg-[#30D158]/18";

export const PLANNER_UPCOMING_PANEL = "shrink-0 space-y-2";

export const PLANNER_CALENDAR_UPCOMING_FRAME =
  "shrink-0 overflow-hidden rounded-xl border border-black/8 bg-black/3 dark:border-white/10 dark:bg-black/20";

export const PLANNER_CALENDAR_UPCOMING_HEADER =
  "flex items-start justify-between gap-3 border-b border-black/8 px-3.5 py-3 dark:border-white/10 sm:px-4";

export const PLANNER_CALENDAR_UPCOMING_LIST =
  "flex max-h-64 flex-col gap-2 overflow-y-auto p-3 sm:p-3.5";

export const PLANNER_CALENDAR_UPCOMING_ITEM =
  "rounded-xl border border-black/8 bg-white/35 px-3 py-2.5 dark:border-white/10 dark:bg-white/5";

export const PLANNER_CALENDAR_UPCOMING_EMPTY =
  "flex flex-col items-center justify-center px-4 py-8 text-center";

export const PLANNER_CALENDAR_UPCOMING_PAID =
  "text-[#34C759]";

export const PLANNER_CALENDAR_UPCOMING_PENDING =
  "text-[#FF9500]";

export const PLANNER_CALENDAR_SUMMARY_TILE =
  "flex min-h-[5.5rem] flex-col justify-between rounded-2xl p-3.5 sm:p-4";

export const PLANNER_CALENDAR_SUMMARY_ICON = "size-7 sm:size-8";

export const PLANNER_CALENDAR_SUMMARY_LABEL =
  "text-xs font-semibold leading-tight sm:text-sm";

export const PLANNER_CALENDAR_SUMMARY_SUBTITLE =
  "mt-0.5 text-[11px] leading-tight sm:text-xs";

export const PLANNER_CALENDAR_SUMMARY_AMOUNT =
  "shrink-0 text-right text-lg font-bold tabular-nums leading-none tracking-tight sm:text-xl";

export const PLANNER_CALENDAR_DAY_DIALOG_ITEM =
  "rounded-xl border border-black/8 bg-black/3 p-3 dark:border-white/10 dark:bg-white/4";

export const PLANNER_CALENDAR_DAY_DIALOG_PAID =
  "text-xs font-medium text-[#34C759]";

export const PLANNER_CALENDAR_DAY_DIALOG_PENDING =
  "text-xs font-medium text-[#FF9500]";
