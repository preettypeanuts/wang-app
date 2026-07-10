import type { ThemeMode } from "@/types/appearance";

export const DEFAULT_THEME_MODE: ThemeMode = "system";

export const THEME_MODES: { id: ThemeMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

export const THEME_MODE_IDS = new Set<ThemeMode>(
  THEME_MODES.map((mode) => mode.id),
);
