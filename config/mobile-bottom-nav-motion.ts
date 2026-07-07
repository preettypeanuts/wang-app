/** Horizontal inset so the capsule floats inside each tab (not edge-to-edge). */
export const MOBILE_BOTTOM_NAV_INDICATOR_INSET_X = 1;

/** Extra right gap when Plans is active. */
export const MOBILE_BOTTOM_NAV_INDICATOR_PLANS_EXTRA_RIGHT = 2;

/** Extra right gap when PayPlan is active — rightmost tab in the pill. */
export const MOBILE_BOTTOM_NAV_INDICATOR_PAYPLAN_EXTRA_RIGHT = 1.5;

/** Sliding active tab capsule — inset vertically so it floats inside the pill. */
export const MOBILE_BOTTOM_NAV_INDICATOR_SURFACE =
  "absolute top-1 bottom-[3px] left-0 rounded-full bg-neutral-400/20 dark:bg-white/18";

/** Sliding active tab orb — iOS 26-style spring slide between items. */
export const MOBILE_BOTTOM_NAV_INDICATOR = [
  MOBILE_BOTTOM_NAV_INDICATOR_SURFACE,
  "mobile-bottom-nav-indicator pointer-events-none z-0",
  "transition-[transform,width] duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]",
  "will-change-[transform,width]",
].join(" ");

export const MOBILE_BOTTOM_NAV_GLYPH_TRANSITION =
  "relative z-[1] size-6 transition-[color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";

export const MOBILE_BOTTOM_NAV_LABEL_TRANSITION =
  "relative z-[1] max-w-full truncate px-0.5 transition-[color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";
