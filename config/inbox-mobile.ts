import {
  INBOX_MESSAGE_BOTTOM_INSET,
  CHAT_INPUT_DOCK_INSET_X,
  INBOX_MOBILE_CHAT_INPUT_DOCK_PB,
} from "@/config/chat-input-mobile";
import { INBOX_DESKTOP_INPUT_DOCK_PB } from "@/config/inbox-desktop";
import { MOBILE_SAFE_HORIZONTAL_INSET } from "@/config/ios-safe-area";
import {
  MOBILE_TOP_BAR_ORB_BUTTON,
  MOBILE_TOP_BAR_ROOT,
} from "@/config/mobile-chrome";

/** Page root wrapper for inbox mobile chrome. */
export const INBOX_MOBILE_PAGE = "inbox-mobile-page";

export const INBOX_MOBILE_TOP_BAR_ROOT = MOBILE_TOP_BAR_ROOT;

/** Linear fade above chat input — sync with `.inbox-mobile-bottom-blur` in globals.css */
export const INBOX_MOBILE_BOTTOM_BLUR = [
  "pointer-events-none fixed inset-x-0 bottom-0 z-[19]",
  "inbox-mobile-bottom-blur",
  "md:hidden",
].join(" ");

export const INBOX_MOBILE_TOP_BAR_ROW = [
  "relative flex w-full items-center justify-between gap-2",
  MOBILE_SAFE_HORIZONTAL_INSET,
  "pt-[var(--mobile-safe-top)]",
  "h-[calc(var(--mobile-safe-top)+var(--mobile-top-bar-height))]",
].join(" ");

/** Top bar orb — shared with other mobile pages. */
export const INBOX_MOBILE_TOP_BAR_ORB = MOBILE_TOP_BAR_ORB_BUTTON;

export const INBOX_MOBILE_TOP_BAR_TITLE = [
  "pointer-events-none absolute inset-x-0 text-center",
  "text-[1.0625rem] font-semibold leading-tight tracking-tight text-foreground",
].join(" ");

export const INBOX_MOBILE_TOP_BAR_ACTIONS =
  "pointer-events-auto flex shrink-0 items-center gap-2";

/** Right drawer popup — sync with `.inbox-summary-drawer-popup` in globals.css */
export const INBOX_SUMMARY_DRAWER_POPUP = "inbox-summary-drawer-popup";

/** Drawer body — fills safe-area-bounded panel. */
export const INBOX_SUMMARY_DRAWER_BODY = "flex h-full min-h-0 flex-col";

/** Visual only — keep transform defaults for slide animation. */
export const INBOX_SUMMARY_DRAWER_SURFACE = [
  INBOX_SUMMARY_DRAWER_POPUP,
  "gap-0 overflow-hidden rounded-none rounded-[1.75rem]",
  "border-0 border-l border-black/10 bg-background/20 backdrop-blur-2xl shadow-xl",
  "dark:border-white/10",
  "max-md:!top-[var(--mobile-safe-top)]",
  "max-md:!bottom-[var(--mobile-safe-bottom)]",
  "max-md:!right-[var(--mobile-safe-right)]",
  "max-md:!h-auto",
].join(" ");

/** Message thread inset when fixed top bar is used (no scrolling large title). */
export { INBOX_MESSAGE_BOTTOM_INSET };

/** Gap between fixed top bar and first chat bubble on mobile. */
export const INBOX_MOBILE_MESSAGE_TOP_GAP = "1rem";

export const INBOX_MESSAGE_CONTENT_INSET = [
  "px-3",
  "max-md:pt-[calc(var(--mobile-top-bar-offset)+1rem)]",
  INBOX_MESSAGE_BOTTOM_INSET,
].join(" ");

/** Chat input — mobile: fixed above bottom nav; desktop: absolute in chat column. */
export const INBOX_CHAT_INPUT_DOCK = [
  "pointer-events-auto z-20",
  "max-md:fixed max-md:inset-x-0 max-md:bottom-[var(--mobile-bottom-nav-offset)]",
  "md:absolute md:inset-x-0 md:bottom-0",
  CHAT_INPUT_DOCK_INSET_X,
  "md:px-3",
  INBOX_MOBILE_CHAT_INPUT_DOCK_PB,
  INBOX_DESKTOP_INPUT_DOCK_PB,
  "max-md:pt-1.5 md:pt-1",
].join(" ");
