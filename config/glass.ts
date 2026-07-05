/** Backdrop filters — light lifts slightly; dark dims wallpaper for contrast. */
export const GLASS_BACKDROP =
  "backdrop-blur-md backdrop-brightness-105 backdrop-saturate-125 dark:backdrop-brightness-[0.88] dark:backdrop-saturate-120";

/** Frosted fill — light: white frost; dark: black frost. */
export const GLASS_FILL = "bg-white/60 dark:bg-black/50";

export const GLASS_BORDER =
  "border border-black/12 dark:border-white/12";

export const GLASS_HIGHLIGHT =
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_1px_3px_rgba(0,0,0,0.4)]";

export const GLASS_SURFACE = `${GLASS_BACKDROP} ${GLASS_BORDER} ${GLASS_FILL} ${GLASS_HIGHLIGHT}`;

/** Hover/active overlay on glass controls. */
export const GLASS_HOVER =
  "hover:bg-white/75 dark:hover:bg-white/10 dark:active:bg-white/14";

export const GLASS_TILE_HIGHLIGHT =
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.3)]";

export const GLASS_TILE_BASE = `${GLASS_BACKDROP} ${GLASS_TILE_HIGHLIGHT}`;

/** Padding around glass controls so box-shadow is not clipped by overflow containers. */
export const GLASS_SHADOW_INSET = "px-3 py-3";

/** iOS-style hairline outline for large glass shells (sidebar). */
export const GLASS_SHELL_OUTLINE = `${GLASS_BACKDROP} ${GLASS_BORDER} ${GLASS_HIGHLIGHT}`;
