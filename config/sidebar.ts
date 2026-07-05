import { GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_SHELL, SEPARATED_CONTROL } from "@/config/shape";
import { APP_GUTTER } from "@/config/spacing";

/** Separated UI shape tokens — colors stay from theme. */
export const SEPARATED_SIDEBAR_CLASS = "app-sidebar";

/** Collapsed (icon) rail width — overrides shadcn default 3rem via SidebarProvider. */
export const SEPARATED_SIDEBAR_ICON_WIDTH = "3.5rem";

/** Viewport inset for floating sidebar container — sync with globals.css. */
export const SEPARATED_SIDEBAR_GUTTER = APP_GUTTER;

/** Outer radius — sync with globals.css and SEPARATED_SHELL. */
export const SEPARATED_SIDEBAR_RADIUS = SEPARATED_SHELL;

export const SEPARATED_MENU_ITEM = SEPARATED_CONTROL;

/** Applied to `[data-slot="sidebar-inner"]` via globals.css — keep in sync with GLASS_SURFACE. */
export const SEPARATED_SIDEBAR_GLASS = GLASS_SURFACE;
