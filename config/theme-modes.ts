import type { ThemeMode } from "@/types/appearance";

export const DEFAULT_THEME_MODE: ThemeMode = "system";

export const THEME_MODES: { id: ThemeMode; label: string }[] = [
  { id: "light", label: "Terang" },
  { id: "dark", label: "Gelap" },
  { id: "system", label: "Sistem" },
];

export const THEME_MODE_IDS = new Set<ThemeMode>(
  THEME_MODES.map((mode) => mode.id),
);
