/** PWA asset paths — no imports; safe to use from next.config.ts. */

export const PWA_LOGO_SOURCE_DARK = "/app-icon-dark.png";
export const PWA_LOGO_SOURCE_LIGHT = "/app-icon-light.png";

export const PWA_FAVICON_LIGHT = "/favicon-light.png";
export const PWA_FAVICON_DARK = "/favicon-dark.png";

export const PWA_ICON_LIGHT_192 = "/icon-light-192.png";
export const PWA_ICON_DARK_192 = "/icon-dark-192.png";

export const PWA_ICON_192 = "/icon-192.png";
export const PWA_ICON_512 = "/icon-512.png";
export const PWA_APPLE_TOUCH_ICON = "/apple-touch-icon.png";

/** All generated PWA / favicon assets (for Serwist precache). */
export const PWA_PRECACHED_ASSETS = [
  PWA_ICON_192,
  PWA_ICON_512,
  PWA_APPLE_TOUCH_ICON,
  PWA_LOGO_SOURCE_DARK,
  PWA_LOGO_SOURCE_LIGHT,
  PWA_FAVICON_DARK,
  PWA_FAVICON_LIGHT,
  PWA_ICON_DARK_192,
  PWA_ICON_LIGHT_192,
] as const;
