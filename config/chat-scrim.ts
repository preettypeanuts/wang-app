const CHAT_SCRIM_BASE =
  "pointer-events-none absolute inset-x-0 -z-10 h-28 backdrop-blur-[2px] dark:backdrop-blur-[3px]";

/** Light: dissolve into background. Dark: dimming overlay. */
export const CHAT_SCRIM_TOP = `${CHAT_SCRIM_BASE} top-0 bg-linear-to-b from-background/45 via-background/16 to-transparent dark:from-black/50 dark:via-black/18 dark:to-transparent [-webkit-mask-image:linear-gradient(to_bottom,black_10%,transparent)] mask-[linear-gradient(to_bottom,black_35%,transparent)]`;

/** Light: dissolve into background. Dark: dimming overlay. */
export const CHAT_SCRIM_BOTTOM = `${CHAT_SCRIM_BASE} bottom-0 bg-linear-to-t from-background/45 via-background/16 to-transparent dark:from-black/50 dark:via-black/18 dark:to-transparent [-webkit-mask-image:linear-gradient(to_top,black_10%,transparent)] mask-[linear-gradient(to_top,black_35%,transparent)]`;
