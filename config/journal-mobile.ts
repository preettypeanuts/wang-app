import { mobileOnly } from "@/config/mobile-layout";
import { MOBILE_ADD_FAB } from "@/config/mobile-nav";

/** Solid muted surface on mobile — sync with `.journal-mobile-solid-surface` in globals.css */
export const JOURNAL_MOBILE_SOLID_SURFACE = "journal-mobile-solid-surface";

/** Flat list shell on mobile — no nested glass frame. */
export const JOURNAL_LIST_FRAME_MOBILE = [
  mobileOnly("rounded-none"),
  mobileOnly("overflow-visible"),
  mobileOnly("flex-none"),
].join(" ");

export const JOURNAL_LIST_CONTAINER_MOBILE = [
  mobileOnly("flex-none"),
  mobileOnly("overflow-visible"),
].join(" ");

/** Hide row hairlines inside solid day groups on mobile. */
export const JOURNAL_MOBILE_SOLID_DIVIDER = mobileOnly("hidden");

/** Filters bar — flat solid panel on mobile (desktop only). */
export const JOURNAL_FILTERS_BAR_MOBILE = [
  JOURNAL_MOBILE_SOLID_SURFACE,
  mobileOnly("!shadow-none"),
  mobileOnly("[backdrop-filter:none!important]"),
  mobileOnly("[-webkit-backdrop-filter:none!important]"),
].join(" ");

/** Mobile — search row without container shell. */
export const JOURNAL_FILTERS_MOBILE_ROW = "flex items-center gap-2 md:hidden";

export const JOURNAL_FILTER_SEARCH_INPUT = [
  "h-10 min-w-0 flex-1",
  "border-0 bg-muted/60 shadow-none",
  "focus-visible:ring-2 focus-visible:ring-ring/30",
].join(" ");

export const JOURNAL_FILTER_TRIGGER = [
  "size-10 shrink-0",
  "bg-muted/60 text-foreground/85 shadow-none",
  "hover:bg-muted/80",
].join(" ");

export const JOURNAL_FILTER_TRIGGER_ACTIVE =
  "ring-2 ring-primary/40 ring-offset-2 ring-offset-background";

export const JOURNAL_DATE_RANGE_TRIGGER = JOURNAL_FILTER_TRIGGER;

export const JOURNAL_EMPTY_STATE_MOBILE = [
  JOURNAL_MOBILE_SOLID_SURFACE,
  mobileOnly("!border-0"),
  mobileOnly("py-12"),
].join(" ");

export const JOURNAL_PAGINATION_MOBILE = [
  mobileOnly("mt-2"),
  mobileOnly("border-0"),
  mobileOnly("pt-0"),
  mobileOnly("gap-2.5"),
].join(" ");

export const JOURNAL_PAGINATION_COUNT_MOBILE =
  "max-md:text-center max-md:text-[11px]";

export const JOURNAL_PAGINATION_NAV_MOBILE = "flex w-full gap-2";

export const JOURNAL_PAGINATION_BUTTON_MOBILE = "max-md:h-10 max-md:flex-1";

export const JOURNAL_PAGINATION_PAGE_MOBILE =
  "max-md:min-w-0 max-md:w-full max-md:text-center max-md:text-[11px]";

export const JOURNAL_CATEGORY_BREAKDOWN_SHELL = [
  JOURNAL_MOBILE_SOLID_SURFACE,
  "rounded-2xl p-4",
  mobileOnly("!border-0"),
  mobileOnly("shadow-none"),
  "md:border md:border-border/60 md:bg-card/50",
].join(" ");

export const JOURNAL_CATEGORY_BREAKDOWN_TRACK =
  "h-2 overflow-hidden rounded-full bg-black/8 dark:bg-white/10";

/** Floating add button — mobile Journal page. */
export const JOURNAL_ADD_FAB = MOBILE_ADD_FAB;

