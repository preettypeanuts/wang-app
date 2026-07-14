import {
  DEFAULT_ACCENT_ID,
  normalizeAccentId,
} from "@/config/accent-colors";
import { DEFAULT_THEME_MODE, THEME_MODE_IDS } from "@/config/theme-modes";
import type { AccentColorId, ThemeMode } from "@/types/appearance";

export const THEME_COOKIE_KEY = "wang-theme";
export const ACCENT_COOKIE_KEY = "wang-accent";
export const RESOLVED_DARK_COOKIE_KEY = "wang-theme-dark";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export interface ServerAppearance {
  themeMode: ThemeMode;
  accentId: AccentColorId;
  resolvedDark: boolean;
}

interface CookieStore {
  get(name: string): { value: string } | undefined;
}

function isThemeMode(value: string): value is ThemeMode {
  return THEME_MODE_IDS.has(value as ThemeMode);
}

export function resolveServerDarkClass(themeMode: ThemeMode): boolean {
  if (themeMode === "dark") {
    return true;
  }

  if (themeMode === "light") {
    return false;
  }

  return false;
}

export function readServerAppearance(cookieStore: CookieStore): ServerAppearance {
  const themeRaw = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const accentRaw = cookieStore.get(ACCENT_COOKIE_KEY)?.value;

  const themeMode =
    themeRaw && isThemeMode(themeRaw) ? themeRaw : DEFAULT_THEME_MODE;
  const accentId = accentRaw ? normalizeAccentId(accentRaw) : DEFAULT_ACCENT_ID;

  let resolvedDark = resolveServerDarkClass(themeMode);

  if (themeMode === "system") {
    const darkRaw = cookieStore.get(RESOLVED_DARK_COOKIE_KEY)?.value;

    if (darkRaw === "true") {
      resolvedDark = true;
    } else if (darkRaw === "false") {
      resolvedDark = false;
    }
  }

  return {
    themeMode,
    accentId,
    resolvedDark,
  };
}

export function writeClientThemeCookie(mode: ThemeMode): void {
  document.cookie = `${THEME_COOKIE_KEY}=${encodeURIComponent(mode)};path=/;max-age=${COOKIE_MAX_AGE_SECONDS};samesite=lax`;
}

export function writeClientAccentCookie(id: AccentColorId): void {
  document.cookie = `${ACCENT_COOKIE_KEY}=${encodeURIComponent(id)};path=/;max-age=${COOKIE_MAX_AGE_SECONDS};samesite=lax`;
}

export function writeClientResolvedDarkCookie(isDark: boolean): void {
  document.cookie = `${RESOLVED_DARK_COOKIE_KEY}=${isDark};path=/;max-age=${COOKIE_MAX_AGE_SECONDS};samesite=lax`;
}
