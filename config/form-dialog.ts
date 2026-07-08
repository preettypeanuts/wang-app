import { GLASS_FILL } from "@/config/glass";
import { SEPARATED_CONTROL, SEPARATED_SURFACE } from "@/config/shape";

const FORM_DIALOG_MOBILE_VIEWPORT = [
  "max-md:top-[calc(var(--mobile-safe-top)+0.75rem)]",
  "max-md:translate-y-0",
  "max-md:max-h-[calc(100dvh-var(--mobile-safe-top)-var(--mobile-safe-bottom)-1.5rem)]",
].join(" ");

/** Shared glass surface for all app modals — keep Pay Plan, Budget, Calendar, Wish aligned. */
export const FORM_DIALOG_SURFACE = `overflow-hidden border-black/10 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 dark:border-white/12 ${GLASS_FILL}`;

export const FORM_DIALOG_CONTENT = `flex max-h-[min(calc(100dvh-var(--mobile-safe-top)-var(--mobile-safe-bottom)-2rem),56rem)] flex-col gap-0 p-0 ${FORM_DIALOG_SURFACE} sm:max-w-md ${FORM_DIALOG_MOBILE_VIEWPORT}`;

/** Wider modal for multi-field forms (Pay Plan, Budget, Wish, etc.). */
export const FORM_DIALOG_CONTENT_WIDE = `flex max-h-[min(calc(100dvh-var(--mobile-safe-top)-var(--mobile-safe-bottom)-2rem),56rem)] flex-col gap-0 p-0 ${FORM_DIALOG_SURFACE} sm:max-w-[34rem] ${FORM_DIALOG_MOBILE_VIEWPORT}`;

export const FORM_DIALOG_HEADER =
  "shrink-0 border-b border-black/8 pl-6 pr-14 pt-5 pb-3.5 dark:border-white/10";

export const FORM_DIALOG_BODY =
  "flex max-h-[min(75vh,36rem)] flex-col gap-4 overflow-y-auto px-5 pb-5";

/** Scrollable body — keeps modal within viewport. */
export const FORM_DIALOG_BODY_SCROLL =
  "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-6 py-4";

export const FORM_DIALOG_FOOTER =
  "flex shrink-0 gap-2 border-t border-black/8 bg-black/2 px-6 py-4 max-md:pb-[calc(1rem+var(--mobile-safe-bottom))] dark:border-white/10 dark:bg-white/3";

export const FORM_PREVIEW_SHELL = `${SEPARATED_SURFACE} border border-black/8 bg-linear-to-b from-white/80 to-black/3 px-4 py-4 text-center dark:border-white/10 dark:from-white/8 dark:to-black/20`;

export const FORM_PREVIEW_COMPACT =
  "flex items-center justify-between gap-4 rounded-xl border border-black/8 bg-black/3 px-4 py-2.5 dark:border-white/10 dark:bg-white/5";

export const FORM_PREVIEW_AMOUNT =
  "text-2xl font-semibold tabular-nums tracking-tight text-foreground";

export const FORM_PREVIEW_COMPACT_AMOUNT =
  "text-lg font-semibold tabular-nums tracking-tight text-foreground";

export const FORM_SEGMENTED =
  "flex gap-1 rounded-xl bg-black/6 p-1 dark:bg-white/8";

export const FORM_SEGMENT =
  "flex flex-1 items-center justify-center rounded-lg px-2 py-2 text-center text-xs font-semibold leading-none transition-colors duration-150";

export const FORM_SEGMENT_ACTIVE =
  "bg-white text-foreground shadow-sm dark:bg-white/18";

export const FORM_SEGMENT_INACTIVE =
  "text-muted-foreground hover:text-foreground/80";

export const FORM_GROUP =
  "rounded-2xl border border-black/8 bg-black/3 dark:border-white/10 dark:bg-white/5";

export const FORM_ROW =
  "flex min-h-11 items-center gap-3 border-b border-black/6 px-3.5 py-2.5 last:border-b-0 dark:border-white/8";

/** Stacked label + control — clearer on narrow modals. */
export const FORM_FIELD =
  "flex min-h-[4.25rem] shrink-0 flex-col justify-center gap-1.5 border-b border-black/6 px-4 py-3 last:border-b-0 dark:border-white/8";

/** Full-width row inside a 2-column form grid. */
export const FORM_FIELD_GRID_ROW =
  "grid grid-cols-1 border-b border-black/6 sm:grid-cols-2 dark:border-white/8";

export const FORM_FIELD_GRID_ITEM =
  "flex min-h-[4.25rem] flex-col justify-center gap-1.5 px-4 py-3 sm:[&:nth-child(2)]:border-l sm:[&:nth-child(2)]:border-black/6 dark:sm:[&:nth-child(2)]:border-white/8";

export const FORM_FIELD_IN_GRID = "flex flex-col justify-center gap-1.5";

/** Edge-to-edge divider inside form groups. */
export const FORM_GROUP_DIVIDER = "border-t border-black/6 dark:border-white/8";

export const FORM_FIELD_LABEL = "text-xs font-medium text-muted-foreground";

export const FORM_FIELD_CONTROL = "min-w-0";

export const FORM_LABEL = "w-28 shrink-0 text-sm text-muted-foreground";

export const FORM_CONTROL =
  "min-w-0 flex-1 text-right text-sm font-medium text-foreground";

export const FORM_INPUT = `${SEPARATED_CONTROL} h-9 min-w-0 flex-1 border-0 bg-transparent px-0 text-right text-sm font-medium shadow-none focus-visible:ring-0`;

export const FORM_FIELD_INPUT = `${SEPARATED_CONTROL} box-border block h-10 w-full min-w-0 border border-black/8 bg-white/70 px-3 text-sm font-medium shadow-none outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 dark:border-white/12 dark:bg-white/8`;

/** Select trigger inside form fields — must stay flex so chevron stays inline. */
export const FORM_FIELD_SELECT = `${SEPARATED_CONTROL} box-border flex h-10 w-full min-w-0 items-center justify-between gap-2 border border-black/8 bg-white/70 px-3 text-sm font-medium shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 dark:border-white/12 dark:bg-white/8 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1`;

/** Date picker trigger — same footprint as other form controls. */
export const FORM_FIELD_DATE = `${SEPARATED_CONTROL} box-border flex h-10 w-full min-w-0 items-center justify-between gap-2 border border-black/8 bg-white/70 px-3 text-left text-sm font-medium shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 dark:border-white/12 dark:bg-white/8`;

export const FORM_INPUT_LEFT = `${SEPARATED_CONTROL} h-9 border-0 bg-transparent px-0 text-left text-sm font-medium shadow-none focus-visible:ring-0`;

export const FORM_NOTE = `${SEPARATED_CONTROL} box-border min-h-16 w-full resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none focus-visible:ring-0`;
