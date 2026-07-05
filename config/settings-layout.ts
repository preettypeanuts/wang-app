import { GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_CONTROL, SEPARATED_SURFACE } from "@/config/shape";

export const SETTINGS_SCROLL =
  "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4";

export const SETTINGS_SECTION_LABEL =
  "px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground";

export const SETTINGS_SECTION_FOOTER =
  "px-1 text-[11px] leading-relaxed text-muted-foreground";

export const SETTINGS_GROUP = `${SEPARATED_SURFACE} ${GLASS_SURFACE} overflow-hidden`;

export const SETTINGS_ROW =
  "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors active:bg-foreground/5";

export const SETTINGS_ROW_DIVIDER =
  "border-b border-black/6 dark:border-white/8";

export const SETTINGS_INSET_BLOCK = "p-3";

export const SETTINGS_SEGMENTED_TRACK = `${SEPARATED_CONTROL} flex bg-black/5 p-1 dark:bg-white/8`;

export const SETTINGS_SEGMENTED_ITEM =
  "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-all";

export const SETTINGS_SEGMENTED_ITEM_ACTIVE = `${GLASS_SURFACE} text-foreground shadow-sm`;

export const SETTINGS_HEADER =
  "flex shrink-0 items-center justify-between border-b border-black/6 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] dark:border-white/8";

export const SETTINGS_SHEET =
  `${SEPARATED_SURFACE} ${GLASS_SURFACE} w-full gap-0 border-0 p-0 shadow-2xl sm:max-w-[22rem]`;
