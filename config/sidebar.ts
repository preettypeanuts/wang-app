import { GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_SHELL, SEPARATED_CONTROL } from "@/config/shape";

/** Separated UI shape tokens — colors stay from theme. */
export const SEPARATED_SIDEBAR_CLASS = "app-sidebar";

/** Collapsed (icon) rail width — overrides shadcn default 3rem via SidebarProvider. */
export const SEPARATED_SIDEBAR_ICON_WIDTH = "3.75rem";

/** Viewport inset for floating sidebar — synced with globals.css `.app-sidebar` padding. */
export const SEPARATED_SIDEBAR_GUTTER = "";

/** Outer radius — sync with globals.css and SEPARATED_SHELL. */
export const SEPARATED_SIDEBAR_RADIUS = SEPARATED_SHELL;

export const SEPARATED_MENU_ITEM = SEPARATED_CONTROL;

/** Applied to `[data-slot="sidebar-inner"]` via globals.css — keep in sync with GLASS_SURFACE. */
export const SEPARATED_SIDEBAR_GLASS = GLASS_SURFACE;

/** Uniform inset inside the glass shell (top/right/bottom/left). */
export const SIDEBAR_INNER_PADDING = "0.5rem";

/** Spacing between icon rows when collapsed. */
export const SIDEBAR_COLLAPSED_ITEM_GAP = "0.375rem";

/** Apple-style app icon shell (collapsed sidebar). */
export const SIDEBAR_APP_ICON_SHELL =
  "flex size-9 shrink-0 items-center justify-center rounded-[0.7rem] bg-linear-to-b shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.14)]";

/** Wang logo tile — theme-aware container bg applied in SidebarAppLogo. */
export const SIDEBAR_APP_LOGO_SHELL =
  "flex shrink-0 items-center justify-center overflow-hidden rounded-[0.7rem] shadow-[0_1px_2px_rgba(0,0,0,0.14)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]";

/** Synced with `html.dark` — do not drive from JS `resolvedDark` (hydration/cookie drift). */
export const SIDEBAR_APP_LOGO_BG = "bg-white! dark:bg-black!";

/** Collapsed dock / icon rail — match visual weight of SIDEBAR_APP_ICON_GLYPH in size-9 shell. */
export const SIDEBAR_APP_LOGO_DOCK_SHELL = "size-9";
export const SIDEBAR_APP_LOGO_DOCK_INSET = "p-1";
export const SIDEBAR_APP_LOGO_DOCK_IMAGE_SIZE = 24;

export const SIDEBAR_APP_ICON_GLYPH = "size-4 text-white drop-shadow-sm";

/** Soft gradients for collapsed app icons. */
export const SIDEBAR_APP_ICON_GRADIENTS = {
  brand: "from-[#7C8CFF] via-[#5B6CFF] to-[#3B4FE0]",
  overview: "from-[#5AC8FA] via-[#32ADE6] to-[#007AFF]",
  inbox: "from-[#46F765] via-[#40E05C] to-[#1FBE3A]",
  journal: "from-[#FFD60A] via-[#FF9F0A] to-[#F5A623]",
  payplan: "from-[#BF5AF2] via-[#AF52DE] to-[#8E5AF7]",
  plans: "from-[#FF70C1] via-[#FF2D55] to-[#D91A45]",
  notifications: "from-[#FF9F5A] via-[#FF9500] to-[#C93400]",
  wallets: "from-[#34C759] via-[#30B350] to-[#248A3D]",
  settings: "from-[#C7C7CC] via-[#8E8E93] to-[#636366]",
  collapse: "from-[#E5E5EA] via-[#AEAEB2] to-[#8E8E93]",
} as const;

export type SidebarAppIconGradient =
  (typeof SIDEBAR_APP_ICON_GRADIENTS)[keyof typeof SIDEBAR_APP_ICON_GRADIENTS];

/** Apple Dock magnification — peak scale at cursor. */
export const SIDEBAR_DOCK_MAX_SCALE = 1.75;

/** Distance (px) from cursor where magnification falls to 1. */
export const SIDEBAR_DOCK_INFLUENCE = 70;

/** Base icon size in px (size-9 = 36). */
export const SIDEBAR_DOCK_ICON_SIZE = 36;
