import type {
  AccentColorId,
  AppearanceSettings,
  ThemeMode,
} from "@/types/appearance";

export function resolveDarkMode(themeMode: ThemeMode): boolean {
  if (themeMode === "dark") {
    return true;
  }

  if (themeMode === "light") {
    return false;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyAppearance({
  themeMode,
  accentId,
}: AppearanceSettings): void {
  const root = document.documentElement;
  root.dataset.accent = accentId;
  root.classList.toggle("dark", resolveDarkMode(themeMode));
}
