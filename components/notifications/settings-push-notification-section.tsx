"use client";

import { IosSwitch } from "@/components/shared/ios-switch";
import { SettingsIosRow } from "@/components/settings/settings-ios-row";
import { SettingsIosSection } from "@/components/settings/settings-ios-section";
import {
  SETTINGS_NOTIFICATIONS,
  SETTINGS_PUSH_FOOTER,
  SETTINGS_PUSH_NOTIFICATIONS,
} from "@/config/settings-labels";
import { SETTINGS_IOS_ICON_ACCENT } from "@/config/settings-ios";
import { usePushNotificationToggle } from "@/hooks/use-push-notification-toggle";
import { SparkleIcon } from "@/lib/icons";

export function SettingsPushNotificationSection() {
  const { enabled, pending, error, toggle } = usePushNotificationToggle();

  const footer = error ?? SETTINGS_PUSH_FOOTER;

  return (
    <SettingsIosSection
      label={SETTINGS_NOTIFICATIONS}
      footer={footer}
      className="shrink-0"
      footerClassName={error ? "text-destructive" : undefined}
    >
      <SettingsIosRow
        icon={<SparkleIcon aria-hidden />}
        iconClassName={SETTINGS_IOS_ICON_ACCENT}
        label={SETTINGS_PUSH_NOTIFICATIONS}
        showChevron={false}
        control={
          <IosSwitch
            aria-label={SETTINGS_PUSH_NOTIFICATIONS}
            checked={enabled}
            disabled={pending}
            onCheckedChange={(checked) => void toggle(checked)}
          />
        }
      />
    </SettingsIosSection>
  );
}
