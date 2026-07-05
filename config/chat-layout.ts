/** Horizontal inset for chat message thread. */
export const CHAT_MESSAGE_INSET_X = "px-3";

/** Top inset — extra room on mobile for floating back button. */
export const CHAT_MESSAGE_INSET_TOP = "pt-3 max-md:pt-12 md:pt-0";

/** Bottom inset — clears floating input overlay. */
export const CHAT_MESSAGE_INSET_BOTTOM = "pb-24";

/** Floating input dock — transparent shell, controls keep glass styling. */
export const CHAT_INPUT_DOCK =
  "absolute inset-x-0 bottom-0 z-10 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1";

/** Slash command menu above chat input. */
export const CHAT_SLASH_MENU =
  "absolute inset-x-0 bottom-full z-20 mb-2 max-h-56 overflow-y-auto rounded-2xl border border-black/8 bg-popover/95 p-1 shadow-2xl ring-1 ring-foreground/5 backdrop-blur-md dark:border-white/10 dark:ring-foreground/10";

export const CHAT_SLASH_MENU_ITEM =
  "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none";

export const CHAT_SLASH_MENU_ITEM_ACTIVE = "bg-accent";

/** Mobile back button overlay — does not consume layout height. */
export const CHAT_MOBILE_HEADER =
  "pointer-events-none absolute inset-x-0 top-0 z-10 md:hidden";

export const CHAT_MOBILE_HEADER_INSET =
  "pointer-events-auto px-3 pt-[max(0.75rem,env(safe-area-inset-top))]";
