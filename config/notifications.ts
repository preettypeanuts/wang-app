import { MOBILE_LIQUID_GLASS_SURFACE } from "@/config/mobile-nav";
import { OVERVIEW_ROUTE, PAYPLAN_ROUTE } from "@/config/navigation";
import { PWA_NOTIFICATION_ICON } from "@/config/pwa";

export const NOTIFICATION_CRON_PATH = "/api/cron/notifications";

/** Morning digest push — 05:00 WIB (22:00 UTC). */
export const DAILY_DIGEST_HOUR_WIB = 5;

/** Vercel cron expression for {@link DAILY_DIGEST_HOUR_WIB}. */
export const NOTIFICATION_CRON_SCHEDULE_UTC = "0 22 * * *";

export const NOTIFICATION_ROUTES = {
  overview: OVERVIEW_ROUTE,
  payplan: PAYPLAN_ROUTE,
  inbox: "/",
  journal: "/journal",
  plans: "/plans",
} as const;

/** iOS-style in-app notification banner — wraps shadcn Alert. */
export const IOS_NOTIFICATION_ALERT = [
  "pointer-events-auto overflow-hidden rounded-[1.35rem] border-0 p-0 shadow-[0_12px_40px_rgba(0,0,0,0.22)]",
  MOBILE_LIQUID_GLASS_SURFACE,
  "backdrop-blur-3xl",
].join(" ");

export const IOS_NOTIFICATION_ALERT_INNER =
  "flex items-start gap-3 px-3.5 py-3";

export const IOS_NOTIFICATION_ALERT_ICON =
  "mt-0.5 size-10 shrink-0 rounded-[0.85rem] object-cover shadow-sm";

export const IOS_NOTIFICATION_ALERT_TITLE =
  "text-[15px] font-semibold leading-snug tracking-tight text-foreground";

export const IOS_NOTIFICATION_ALERT_BODY =
  "mt-0.5 line-clamp-3 text-[13px] leading-snug text-muted-foreground";

export const IOS_NOTIFICATION_STACK_ROOT = [
  "pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col gap-2 px-3",
  "pt-[calc(var(--mobile-safe-top)+0.35rem)] md:hidden",
].join(" ");

export const NOTIFICATION_MAX_IN_APP_STACK = 3;

/** In-app banner auto-dismiss — matches common iOS toast duration (~5s). */
export const NOTIFICATION_IN_APP_AUTO_DISMISS_MS = 5000;

export const NOTIFICATION_PUSH_ICON = PWA_NOTIFICATION_ICON;
