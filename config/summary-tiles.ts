import { GLASS_TILE_BASE } from "@/config/glass";

export type SummaryTileIcon =
  | "arrow-down"
  | "arrow-up"
  | "wallet"
  | "fork-knife"
  | "car"
  | "shopping-bag"
  | "receipt"
  | "dots-three"
  | "coins";

export interface SummaryTileStyle {
  surface: string;
  icon: SummaryTileIcon;
  iconColor: string;
}

export const TOTAL_TILE_STYLES = {
  income: {
    surface: `${GLASS_TILE_BASE} border border-[#34C759]/16 bg-[#34C759]/10 dark:border-[#34C759]/22 dark:bg-[#34C759]/14`,
    icon: "arrow-down",
    iconColor: "text-[#34C759]",
  },
  expense: {
    surface: `${GLASS_TILE_BASE} border border-[#FF6B6B]/16 bg-[#FF6B6B]/10 dark:border-[#FF6B6B]/22 dark:bg-[#FF6B6B]/14`,
    icon: "arrow-up",
    iconColor: "text-[#FF6B6B]",
  },
  balance: {
    surface: `${GLASS_TILE_BASE} border border-[#8E5AF7]/16 bg-[#8E5AF7]/10 dark:border-[#8E5AF7]/22 dark:bg-[#8E5AF7]/14`,
    icon: "wallet",
    iconColor: "text-[#8E5AF7]",
  },
} as const satisfies Record<string, SummaryTileStyle>;

export const CATEGORY_TILE_STYLES: Record<string, SummaryTileStyle> = {
  food: {
    surface: `${GLASS_TILE_BASE} border border-[#34C759]/16 bg-[#34C759]/10 dark:border-[#34C759]/22 dark:bg-[#34C759]/14`,
    icon: "fork-knife",
    iconColor: "text-[#34C759]",
  },
  groceries: {
    surface: `${GLASS_TILE_BASE} border border-[#30D158]/16 bg-[#30D158]/10 dark:border-[#30D158]/22 dark:bg-[#30D158]/14`,
    icon: "fork-knife",
    iconColor: "text-[#30D158]",
  },
  transport: {
    surface: `${GLASS_TILE_BASE} border border-[#8E5AF7]/16 bg-[#8E5AF7]/10 dark:border-[#8E5AF7]/22 dark:bg-[#8E5AF7]/14`,
    icon: "car",
    iconColor: "text-[#8E5AF7]",
  },
  shopping: {
    surface: `${GLASS_TILE_BASE} border border-[#FF70C1]/16 bg-[#FF70C1]/10 dark:border-[#FF70C1]/22 dark:bg-[#FF70C1]/14`,
    icon: "shopping-bag",
    iconColor: "text-[#FF70C1]",
  },
  housing: {
    surface: `${GLASS_TILE_BASE} border border-[#A89478]/18 bg-[#A89478]/10 dark:border-[#A89478]/22 dark:bg-[#A89478]/14`,
    icon: "wallet",
    iconColor: "text-[#A89478] dark:text-[#C4B095]",
  },
  utilities: {
    surface: `${GLASS_TILE_BASE} border border-[#FFD60A]/20 bg-[#FFD60A]/12 dark:border-[#FFD60A]/24 dark:bg-[#FFD60A]/16`,
    icon: "receipt",
    iconColor: "text-[#C9A800] dark:text-[#FFD60A]",
  },
  bills: {
    surface: `${GLASS_TILE_BASE} border border-[#FFD60A]/20 bg-[#FFD60A]/12 dark:border-[#FFD60A]/24 dark:bg-[#FFD60A]/16`,
    icon: "receipt",
    iconColor: "text-[#C9A800] dark:text-[#FFD60A]",
  },
  subscription: {
    surface: `${GLASS_TILE_BASE} border border-[#BF5AF2]/16 bg-[#BF5AF2]/10 dark:border-[#BF5AF2]/22 dark:bg-[#BF5AF2]/14`,
    icon: "receipt",
    iconColor: "text-[#BF5AF2]",
  },
  entertainment: {
    surface: `${GLASS_TILE_BASE} border border-[#FF375F]/16 bg-[#FF375F]/10 dark:border-[#FF375F]/22 dark:bg-[#FF375F]/14`,
    icon: "dots-three",
    iconColor: "text-[#FF375F]",
  },
  health: {
    surface: `${GLASS_TILE_BASE} border border-[#5AC8FA]/16 bg-[#5AC8FA]/10 dark:border-[#5AC8FA]/22 dark:bg-[#5AC8FA]/14`,
    icon: "receipt",
    iconColor: "text-[#5AC8FA]",
  },
  education: {
    surface: `${GLASS_TILE_BASE} border border-[#64D2FF]/16 bg-[#64D2FF]/10 dark:border-[#64D2FF]/22 dark:bg-[#64D2FF]/14`,
    icon: "coins",
    iconColor: "text-[#64D2FF]",
  },
  personal: {
    surface: `${GLASS_TILE_BASE} border border-[#FF9F0A]/16 bg-[#FF9F0A]/10 dark:border-[#FF9F0A]/22 dark:bg-[#FF9F0A]/14`,
    icon: "shopping-bag",
    iconColor: "text-[#FF9F0A]",
  },
  family: {
    surface: `${GLASS_TILE_BASE} border border-[#FF6482]/16 bg-[#FF6482]/10 dark:border-[#FF6482]/22 dark:bg-[#FF6482]/14`,
    icon: "coins",
    iconColor: "text-[#FF6482]",
  },
  travel: {
    surface: `${GLASS_TILE_BASE} border border-[#0A84FF]/16 bg-[#0A84FF]/10 dark:border-[#0A84FF]/22 dark:bg-[#0A84FF]/14`,
    icon: "car",
    iconColor: "text-[#0A84FF]",
  },
  pets: {
    surface: `${GLASS_TILE_BASE} border border-[#AC8E68]/18 bg-[#AC8E68]/10 dark:border-[#AC8E68]/22 dark:bg-[#AC8E68]/14`,
    icon: "dots-three",
    iconColor: "text-[#AC8E68]",
  },
  gifts: {
    surface: `${GLASS_TILE_BASE} border border-[#FF2D55]/16 bg-[#FF2D55]/10 dark:border-[#FF2D55]/22 dark:bg-[#FF2D55]/14`,
    icon: "coins",
    iconColor: "text-[#FF2D55]",
  },
  business: {
    surface: `${GLASS_TILE_BASE} border border-[#5856D6]/16 bg-[#5856D6]/10 dark:border-[#5856D6]/22 dark:bg-[#5856D6]/14`,
    icon: "wallet",
    iconColor: "text-[#5856D6]",
  },
  insurance: {
    surface: `${GLASS_TILE_BASE} border border-[#32ADE6]/16 bg-[#32ADE6]/10 dark:border-[#32ADE6]/22 dark:bg-[#32ADE6]/14`,
    icon: "receipt",
    iconColor: "text-[#32ADE6]",
  },
  fees: {
    surface: `${GLASS_TILE_BASE} border border-[#8E8E93]/16 bg-[#8E8E93]/10 dark:border-[#8E8E93]/22 dark:bg-[#8E8E93]/14`,
    icon: "receipt",
    iconColor: "text-[#8E8E93]",
  },
  investment: {
    surface: `${GLASS_TILE_BASE} border border-[#007AFF]/16 bg-[#007AFF]/10 dark:border-[#007AFF]/22 dark:bg-[#007AFF]/14`,
    icon: "wallet",
    iconColor: "text-[#007AFF]",
  },
  salary: {
    surface: `${GLASS_TILE_BASE} border border-[#34C759]/16 bg-[#34C759]/10 dark:border-[#34C759]/22 dark:bg-[#34C759]/14`,
    icon: "coins",
    iconColor: "text-[#34C759]",
  },
  side_income: {
    surface: `${GLASS_TILE_BASE} border border-[#30D158]/16 bg-[#30D158]/10 dark:border-[#30D158]/22 dark:bg-[#30D158]/14`,
    icon: "arrow-down",
    iconColor: "text-[#30D158]",
  },
  other: {
    surface: `${GLASS_TILE_BASE} border border-[#C4B095]/18 bg-[#C4B095]/10 dark:border-[#C4B095]/22 dark:bg-[#C4B095]/14`,
    icon: "dots-three",
    iconColor: "text-[#A89478] dark:text-[#C4B095]",
  },
};

export const DEFAULT_CATEGORY_TILE: SummaryTileStyle = {
  surface: `${GLASS_TILE_BASE} border border-[#C4B095]/18 bg-[#C4B095]/10 dark:border-[#C4B095]/22 dark:bg-[#C4B095]/14`,
  icon: "coins",
  iconColor: "text-[#A89478] dark:text-[#C4B095]",
};

export function getCategoryTileStyle(category: string): SummaryTileStyle {
  const normalized = category === "bills" ? "utilities" : category;
  return CATEGORY_TILE_STYLES[normalized] ?? DEFAULT_CATEGORY_TILE;
}
