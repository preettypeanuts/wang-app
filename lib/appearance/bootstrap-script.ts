import {
  ACCENT_COOKIE_KEY,
  RESOLVED_DARK_COOKIE_KEY,
  THEME_COOKIE_KEY,
} from "@/lib/appearance/cookies";
import { PWA_STANDALONE_BOOTSTRAP_SCRIPT } from "@/lib/pwa/standalone-viewport";

const THEME_STORAGE_KEY = "wang:theme";
const ACCENT_STORAGE_KEY = "wang:accent";

/** Inline script — applies theme/accent + PWA standalone height before first paint. */
export function createRootAppearanceBootstrapScript(): string {
  return `
(function () {
  ${PWA_STANDALONE_BOOTSTRAP_SCRIPT}

  function readCookie(name) {
    var match = document.cookie.match(
      new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\\]\\\\/+^])/g, "\\\\$1") + "=([^;]*)"),
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  var theme =
    readCookie("${THEME_COOKIE_KEY}") || readStorage("${THEME_STORAGE_KEY}") || "system";
  if (theme !== "light" && theme !== "dark" && theme !== "system") {
    theme = "system";
  }

  var accent =
    readCookie("${ACCENT_COOKIE_KEY}") || readStorage("${ACCENT_STORAGE_KEY}") || "blue";

  var dark = false;
  if (theme === "dark") {
    dark = true;
  } else if (theme === "light") {
    dark = false;
  } else {
    var resolvedDark = readCookie("${RESOLVED_DARK_COOKIE_KEY}");
    if (resolvedDark === "true") {
      dark = true;
    } else if (resolvedDark === "false") {
      dark = false;
    } else {
      dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  }

  var root = document.documentElement;
  root.dataset.accent = accent;
  root.classList.toggle("dark", dark);
})();
`.trim();
}
