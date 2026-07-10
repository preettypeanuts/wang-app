import { mobileOnly } from "@/config/mobile-layout";

/** Halo shadow — theme-aware fallback when wallpaper luminance fights foreground. */
export const OVERVIEW_MOBILE_PAGE_TITLE = mobileOnly(
  "[text-shadow:0_1px_2px_color-mix(in_srgb,var(--background)_85%,transparent),0_0_20px_color-mix(in_srgb,var(--background)_55%,transparent)]",
);

/** Desktop-only drawer trigger — mobile uses fixed top bar orb. */
export const OVERVIEW_DESKTOP_FILTER_TRIGGER =
  "hidden shrink-0 justify-end md:flex";
