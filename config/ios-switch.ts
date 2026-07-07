/** iOS Settings-style switch — track + thumb tokens. */

export const IOS_SWITCH_ROOT = [
  "relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full",
  "transition-[background-color,opacity] duration-200 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

export const IOS_SWITCH_TRACK_ON = "bg-[#34C759]";
export const IOS_SWITCH_TRACK_OFF = "bg-black/12 dark:bg-white/22";

export const IOS_SWITCH_THUMB = [
  "pointer-events-none block size-[27px] rounded-full bg-white",
  "shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.16)]",
  "transition-transform duration-200 ease-out",
].join(" ");

export const IOS_SWITCH_THUMB_ON = "translate-x-[22px]";
export const IOS_SWITCH_THUMB_OFF = "translate-x-0.5";
