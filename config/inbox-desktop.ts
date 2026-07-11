import { APP_GAP, APP_GUTTER } from "@/config/spacing";

/**
 * Inbox outer shell (desktop) — no vertical padding; right gutter on SidebarInset.
 * Mobile: full-bleed via InboxMobileLayout.
 */
export const INBOX_PAGE_OUTER = [
  "flex h-full min-h-0 flex-1 flex-col overflow-hidden",
  "md:py-0",
].join(" ");

/** Row: chat column + summary aside. */
export const INBOX_PAGE_ROW = [
  "flex h-full min-h-0 flex-1 min-w-0 overflow-hidden",
  APP_GAP,
].join(" ");

/** Chat column — full height; vertical inset lives in thread + input dock. */
export const INBOX_CHAT_COLUMN = [
  "relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
].join(" ");

/** InboxView root — fills chat column. */
export const INBOX_CHAT_VIEW_ROOT = [
  "relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden",
].join(" ");

/** Desktop — top gap for bubble thread (sync with shell py-3 elsewhere). */
export const INBOX_DESKTOP_MESSAGE_PT = "md:pt-3";

/**
 * Desktop — bottom clearance for bubble thread above floating input.
 * Sync: md:pt-1 + md:min-h-9 + INBOX_DESKTOP_INPUT_DOCK_PB.
 */
export const INBOX_DESKTOP_MESSAGE_PB = "md:pb-14";

/** Desktop — bottom gap for input dock (sync with shell py-3 elsewhere). */
export const INBOX_DESKTOP_INPUT_DOCK_PB = "md:pb-3";

/**
 * Desktop scroll padding bottom — mirrors INBOX_DESKTOP_MESSAGE_PB for scrollIntoView.
 */
export const INBOX_DESKTOP_MESSAGE_SCROLL_PADDING = "md:scroll-pb-14";

/**
 * Summary aside — nested gutter for glass panel (keeps its own py/pr).
 */
export const INBOX_SUMMARY_ASIDE = [
  "hidden h-full min-h-0 w-96 shrink-0 lg:block",
  APP_GUTTER,
].join(" ");
