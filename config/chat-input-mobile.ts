/** Inbox chat input — mobile sizing & no iOS focus zoom (16px min). */

import { mobileOnly } from "@/config/mobile-layout";

/**
 * Mobile inbox input glass — sync with `.inbox-chat-input-glass` in globals.css.
 * Pseudo-element backdrop avoids iOS losing blur when `overflow-hidden` clips the shell.
 */
export const INBOX_CHAT_INPUT_GLASS = mobileOnly("inbox-chat-input-glass");

/** Neutralize GLASS_SURFACE on mobile when INBOX_CHAT_INPUT_GLASS owns the shell. */
export const INBOX_CHAT_INPUT_GLASS_RESET = [
  mobileOnly("!bg-transparent"),
  mobileOnly("border-0"),
  mobileOnly("shadow-none"),
  mobileOnly("[backdrop-filter:none]"),
  mobileOnly("[-webkit-backdrop-filter:none]"),
].join(" ");

/** Keep ghost Button fills from overriding glass on mobile. */
export const INBOX_CHAT_INPUT_MENU_BUTTON_GLASS = [
  INBOX_CHAT_INPUT_GLASS,
  INBOX_CHAT_INPUT_GLASS_RESET,
  mobileOnly("hover:!bg-transparent"),
  mobileOnly("active:!bg-transparent"),
  mobileOnly("aria-expanded:!bg-transparent"),
  mobileOnly("dark:hover:!bg-transparent"),
].join(" ");

export const CHAT_INPUT_DOCK_INSET_X = [
  "max-md:pl-[calc(var(--mobile-chrome-gutter)+var(--mobile-safe-left))]",
  "max-md:pr-[calc(var(--mobile-chrome-gutter)+var(--mobile-safe-right))]",
].join(" ");

export const CHAT_INPUT_CONTROL_MIN_HEIGHT = "max-md:min-h-10 md:min-h-9";

export const CHAT_INPUT_MENU_BUTTON =
  "max-md:size-10 max-md:[&_svg]:size-[1.05rem] md:size-9";

export const CHAT_INPUT_SEND_BUTTON =
  "max-md:size-8 max-md:[&_svg]:size-3.5 md:size-7";

/** 16px on mobile prevents Safari auto-zoom on focus. */
export const CHAT_INPUT_TEXTAREA =
  "max-md:text-base max-md:leading-10 md:text-sm md:leading-9";

export const CHAT_INPUT_FIELD =
  "max-md:pl-4 max-md:pr-1.5 md:pl-3 md:pr-1";

export const CHAT_INPUT_HINT_BADGE = [
  "flex size-7 shrink-0 items-center justify-center rounded-full",
  "bg-black/6 text-[11px] font-semibold text-muted-foreground",
  "transition-colors hover:bg-black/10 active:scale-95",
  "disabled:pointer-events-none disabled:opacity-40",
  "dark:bg-white/10 dark:hover:bg-white/14",
  "max-md:size-8 max-md:text-xs",
].join(" ");

/** Extra clearance when input dock sits above bottom nav on mobile. */
export const INBOX_MESSAGE_BOTTOM_INSET =
  "max-md:pb-[calc(6rem+var(--mobile-bottom-nav-offset))]";

/** Inbox input → bottom nav gap (mobile only). */
export const INBOX_MOBILE_CHAT_INPUT_DOCK_PB = "max-md:pb-3";
