/** iOS Settings — inset grouped list tokens. */

import { MOBILE_SAFE_HORIZONTAL_INSET } from "@/config/ios-safe-area";
import { MOBILE_BOTTOM_DRAWER_POPUP } from "@/config/mobile-layout";

export const SETTINGS_IOS_SURFACE = "bg-[#E9E9EC] dark:bg-black";

export const SETTINGS_IOS_SCROLL = [
  "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain",
  MOBILE_SAFE_HORIZONTAL_INSET,
  "pb-[calc(1rem+var(--mobile-safe-bottom))]",
].join(" ");

/** Scroll area below a sub-panel header (appearance, wallpaper, etc.). */
export const SETTINGS_IOS_SUB_SCROLL = [SETTINGS_IOS_SCROLL, "pt-4"].join(" ");

export const SETTINGS_IOS_LARGE_TITLE = [
  "px-1 pb-2 pt-1",
  "text-[2.125rem] font-bold leading-tight tracking-tight text-foreground",
].join(" ");

/** Large title inside mobile settings drawer — tighter below swipe handle. */
export const SETTINGS_IOS_DRAWER_LARGE_TITLE = [
  "px-1 pb-2 pt-0",
  "text-[2.125rem] font-bold leading-tight tracking-tight text-foreground",
].join(" ");

export const SETTINGS_IOS_SECTION_LABEL =
  "px-4 pb-1.5 text-[13px] leading-none text-muted-foreground";

export const SETTINGS_IOS_SECTION_FOOTER =
  "px-4 pt-1.5 text-[13px] leading-snug text-muted-foreground";

export const SETTINGS_IOS_GROUP =
  "overflow-hidden rounded-xl bg-card shadow-none";

export const SETTINGS_IOS_ROW = [
  "flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left bg-neutral-100 dark:bg-neutral-900",
  "transition-colors active:bg-foreground/5",
].join(" ");

export const SETTINGS_IOS_ROW_DIVIDER =
  "ml-[3.25rem] border-b border-black/8 dark:border-white/10";

export const SETTINGS_IOS_ROW_ICON = [
  "flex size-7 shrink-0 items-center justify-center rounded-[0.35rem] text-white",
  "[&_svg]:size-[1.05rem]",
].join(" ");

export const SETTINGS_IOS_ROW_LABEL =
  "min-w-0 flex-1 text-left text-[17px] leading-snug text-foreground";

export const SETTINGS_IOS_ROW_VALUE =
  "shrink-0 text-[17px] leading-snug text-muted-foreground";

export const SETTINGS_IOS_PROFILE_ROW = [
  SETTINGS_IOS_ROW,
  "min-h-[4.75rem] items-center py-3",
].join(" ");

export const SETTINGS_IOS_PROFILE_GROUP =
  "overflow-hidden rounded-xl bg-card shadow-none";

export const SETTINGS_IOS_PROFILE_NAME =
  "truncate text-[17px] font-normal leading-snug text-foreground";

export const SETTINGS_IOS_PROFILE_SUBTITLE =
  "truncate text-[13px] leading-snug text-muted-foreground";

export const SETTINGS_IOS_NAV_HEADER = [
  "flex shrink-0 items-center justify-between gap-2",
  "border-b border-black/8 px-3 pb-2",
  "pt-[var(--mobile-safe-top)]",
  "dark:border-white/10",
].join(" ");

export const SETTINGS_IOS_SUB_HEADER = [
  "relative flex shrink-0 items-center justify-center",
  "border-b border-black/8 px-3 py-2.5",
  "dark:border-white/10",
].join(" ");

export const SETTINGS_IOS_BACK_BUTTON = [
  "inline-flex items-center gap-0.5 text-[17px] font-normal text-primary",
  "transition-opacity active:opacity-70",
].join(" ");

export const SETTINGS_IOS_DONE_BUTTON =
  "h-9 px-1 text-[17px] font-normal text-primary active:opacity-70";

export const SETTINGS_IOS_SUB_TITLE =
  "text-center text-[17px] font-semibold leading-snug text-foreground";

export const SETTINGS_IOS_DRAWER_POPUP = MOBILE_BOTTOM_DRAWER_POPUP;

export const SETTINGS_IOS_DRAWER_SURFACE = [
  SETTINGS_IOS_DRAWER_POPUP,
  "mt-0! gap-0 overflow-hidden border-0",
  SETTINGS_IOS_SURFACE,
].join(" ");

export const SETTINGS_IOS_SHEET = [
  "flex h-full w-full max-w-[22rem] flex-col gap-0 border-0 p-0 shadow-2xl",
  SETTINGS_IOS_SURFACE,
].join(" ");

/** Icon tile colors — Apple Settings palette. */
export const SETTINGS_IOS_ICON_THEME = "bg-[#FF9500]";
export const SETTINGS_IOS_ICON_ACCENT = "bg-[#FF2D55]";
export const SETTINGS_IOS_ICON_GLASS = "bg-[#007AFF]";
export const SETTINGS_IOS_ICON_WALLPAPER = "bg-[#34C759]";
