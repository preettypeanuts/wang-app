import { SEPARATED_SURFACE } from "@/config/shape";
import { SOLID_WIDGET_TILE_SHADOW } from "@/config/solid-widget-tiles";
import type { FinanceCondition } from "@/types/summary";

export const FINANCE_REFLECTION_SHELL = `relative isolate overflow-hidden ${SEPARATED_SURFACE}`;

export const FINANCE_REFLECTION_CONTENT = "relative flex flex-col p-3";

export interface FinanceConditionWeatherStyle {
  surface: string;
  glowOrb: string;
  secondaryOrb: string;
  badgeSurface: string;
  iconSurface: string;
  labelColor: string;
  textColor: string;
  subtitleColor: string;
}

export const FINANCE_CONDITION_WEATHER_STYLES: Record<
  string,
  FinanceConditionWeatherStyle
> = {
  aman: {
    surface: `bg-linear-to-br from-[#FFE98A] via-[#FFD60A] to-[#F5A623] dark:from-[#D4B84A] dark:via-[#B89400] dark:to-[#8B6914] ${SOLID_WIDGET_TILE_SHADOW}`,
    glowOrb: "bg-[#FFFBE6]/70",
    secondaryOrb: "bg-[#FFB020]/35",
    badgeSurface: "bg-white/28 ring-1 ring-white/35 backdrop-blur-sm",
    iconSurface: "bg-white/22 ring-1 ring-white/30 backdrop-blur-sm",
    labelColor: "text-[#5C4A00]/80 dark:text-white/70",
    textColor: "text-[#2E2500]/95 dark:text-white/95",
    subtitleColor: "text-[#5C4A00]/90 dark:text-white/90",
  },
  stabil: {
    surface: `bg-linear-to-br from-[#A8DCFF] via-[#5AC8FA] to-[#007AFF] dark:from-[#3D8FD1] dark:via-[#2488CC] dark:to-[#0A5FAD] ${SOLID_WIDGET_TILE_SHADOW}`,
    glowOrb: "bg-[#E8F6FF]/65",
    secondaryOrb: "bg-[#007AFF]/30",
    badgeSurface: "bg-white/24 ring-1 ring-white/30 backdrop-blur-sm",
    iconSurface: "bg-white/18 ring-1 ring-white/25 backdrop-blur-sm",
    labelColor: "text-[#003D66]/75 dark:text-white/70",
    textColor: "text-[#001A33]/95 dark:text-white/95",
    subtitleColor: "text-[#003D66]/90 dark:text-white/90",
  },
  waspada: {
    surface: `bg-linear-to-br from-[#DDE3EA] via-[#AEB7C2] to-[#7B8794] dark:from-[#5C6570] dark:via-[#454C56] dark:to-[#2E343B] ${SOLID_WIDGET_TILE_SHADOW}`,
    glowOrb: "bg-white/45",
    secondaryOrb: "bg-[#6B7280]/25",
    badgeSurface: "bg-white/22 ring-1 ring-white/25 backdrop-blur-sm",
    iconSurface: "bg-white/16 ring-1 ring-white/20 backdrop-blur-sm",
    labelColor: "text-[#2C3340]/75 dark:text-white/70",
    textColor: "text-[#1A2028]/95 dark:text-white/95",
    subtitleColor: "text-[#2C3340]/90 dark:text-white/90",
  },
  boros: {
    surface: `bg-linear-to-br from-[#FFC4A8] via-[#FF8A65] to-[#E64A19] dark:from-[#C85A3A] dark:via-[#A84328] dark:to-[#7A2E18] ${SOLID_WIDGET_TILE_SHADOW}`,
    glowOrb: "bg-[#FFE8DE]/55",
    secondaryOrb: "bg-[#FF5722]/28",
    badgeSurface: "bg-white/24 ring-1 ring-white/28 backdrop-blur-sm",
    iconSurface: "bg-white/18 ring-1 ring-white/22 backdrop-blur-sm",
    labelColor: "text-[#5C1F00]/75 dark:text-white/70",
    textColor: "text-[#2A0E00]/95 dark:text-white/95",
    subtitleColor: "text-[#5C1F00]/90 dark:text-white/90",
  },
  kritis: {
    surface: `bg-linear-to-br from-[#D4B5FF] via-[#9B59B6] to-[#5B2C6F] dark:from-[#7D3C98] dark:via-[#5E3370] dark:to-[#3D1F4A] ${SOLID_WIDGET_TILE_SHADOW}`,
    glowOrb: "bg-[#F0E5FF]/40",
    secondaryOrb: "bg-[#4A235A]/35",
    badgeSurface: "bg-white/16 ring-1 ring-white/20 backdrop-blur-sm",
    iconSurface: "bg-white/12 ring-1 ring-white/18 backdrop-blur-sm",
    labelColor: "text-white/70",
    textColor: "text-white/95",
    subtitleColor: "text-white/90",
  },
};

export const FINANCE_CONDITION_WEATHER_DEFAULT: FinanceConditionWeatherStyle = {
  surface: `bg-linear-to-br from-[#E5E5EA] via-[#C7C7CC] to-[#8E8E93] dark:from-[#48484A] dark:via-[#3A3A3C] dark:to-[#2C2C2E] ${SOLID_WIDGET_TILE_SHADOW}`,
  glowOrb: "bg-white/40",
  secondaryOrb: "bg-black/10 dark:bg-white/8",
  badgeSurface: "bg-white/20 ring-1 ring-white/22 backdrop-blur-sm",
  iconSurface: "bg-white/14 ring-1 ring-white/18 backdrop-blur-sm",
  labelColor: "text-[#1C1C1E]/75 dark:text-white/70",
  textColor: "text-[#1C1C1E]/95 dark:text-white/95",
  subtitleColor: "text-[#1C1C1E]/90 dark:text-white/90",
};

export function getFinanceConditionWeatherStyle(
  condition: FinanceCondition,
): FinanceConditionWeatherStyle {
  const key = condition.label.trim().toLowerCase();
  return FINANCE_CONDITION_WEATHER_STYLES[key] ?? FINANCE_CONDITION_WEATHER_DEFAULT;
}
