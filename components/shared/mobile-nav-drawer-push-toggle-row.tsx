"use client";

import { IosSwitch } from "@/components/shared/ios-switch";
import {
  MOBILE_DRAWER_ROW,
  MOBILE_DRAWER_TILE,
} from "@/config/mobile-nav";
import { SIDEBAR_APP_ICON_GRADIENTS } from "@/config/sidebar";
import { usePushNotificationToggle } from "@/hooks/use-push-notification-toggle";
import { BellIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function MobileNavDrawerPushToggleRow() {
  const { enabled, pending, error, toggle } = usePushNotificationToggle();

  return (
    <div className="space-y-1">
      <div className={cn(MOBILE_DRAWER_ROW, "active:bg-muted")}>
        <span
          className={cn(
            MOBILE_DRAWER_TILE,
            SIDEBAR_APP_ICON_GRADIENTS.notifications,
          )}
        >
          <BellIcon aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">Notifikasi push</span>
        <IosSwitch
          aria-label="Notifikasi push"
          checked={enabled}
          disabled={pending}
          onCheckedChange={(checked) => void toggle(checked)}
        />
      </div>
      {error ? (
        <p className="px-1 text-[12px] leading-snug text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
