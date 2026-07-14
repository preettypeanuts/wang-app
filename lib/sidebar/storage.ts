import { writeClientSidebarCookie } from "@/lib/sidebar/cookies";

const SIDEBAR_STORAGE_KEY = "wang:sidebar-open";

const SIDEBAR_COOKIE_PATTERN = /(?:^|;\s*)sidebar_state=([^;]*)/;

export function readStoredSidebarOpen(fallback = true): boolean {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);

  if (stored === "true") {
    return true;
  }

  if (stored === "false") {
    return false;
  }

  const cookieMatch = document.cookie.match(SIDEBAR_COOKIE_PATTERN);

  if (cookieMatch?.[1] === "true") {
    return true;
  }

  if (cookieMatch?.[1] === "false") {
    return false;
  }

  return fallback;
}

export function writeStoredSidebarOpen(open: boolean): void {
  window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
  writeClientSidebarCookie(open);
}
