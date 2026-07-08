/**
 * Mobile-only layout gate — pair with `.cursor/rules/mobile-layout-only.mdc`.
 *
 * Tulis `mobileEdit=true` di prompt Cursor saat fokus perbaikan mobile view.
 * Desktop (`md`+) tidak boleh berubah.
 */

/** Activation phrase for Cursor agent (mobile-layout-only rule). */
export const MOBILE_EDIT_FLAG = "mobileEdit=true";

/** Tailwind breakpoint: mobile = below md (768px). */
export const MOBILE_ONLY_PREFIX = "max-md" as const;

/** Desktop breakpoint prefix — do not modify existing md+ classes during mobile edits. */
export const DESKTOP_PREFIX = "md" as const;

/**
 * Prefix each utility with `max-md:` for mobile-only overrides.
 *
 * @example mobileOnly("px-3 gap-2") → "max-md:px-3 max-md:gap-2"
 */
export function mobileOnly(classes: string): string {
  return classes
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `${MOBILE_ONLY_PREFIX}:${token}`)
    .join(" ");
}

/**
 * Shared mobile bottom sheet layout (settings-style floating squircle).
 * Sync with `.mobile-bottom-drawer-popup` in globals.css.
 */
export const MOBILE_BOTTOM_DRAWER_POPUP = "mobile-bottom-drawer-popup";

/** Taller max-height for multi-field form drawers. */
export const MOBILE_BOTTOM_DRAWER_POPUP_TALL =
  "mobile-bottom-drawer-popup--tall";
