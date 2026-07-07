"use client";

import { IosSwitch } from "@/components/shared/ios-switch";
import { SettingsIosRow } from "@/components/settings/settings-ios-row";
import { SettingsIosSection } from "@/components/settings/settings-ios-section";
import { SETTINGS_IOS_ICON_ACCENT } from "@/config/settings-ios";
import { usePushNotificationToggle } from "@/hooks/use-push-notification-toggle";
import { SparkleIcon } from "@/lib/icons";

const PUSH_FOOTER_DEFAULT =
  "Tagihan mendatang, ringkasan AI, dan alert penting.";

export function SettingsPushNotificationSection() {
  const { enabled, pending, error, toggle } = usePushNotificationToggle();

  const footer = error ?? PUSH_FOOTER_DEFAULT;

  return (
    <SettingsIosSection
      label="Notifikasi"
      footer={footer}
      className="shrink-0"
      footerClassName={error ? "text-destructive" : undefined}
    >
      <SettingsIosRow
        icon={<SparkleIcon aria-hidden />}
        iconClassName={SETTINGS_IOS_ICON_ACCENT}
        label="Notifikasi push"
        showChevron={false}
        control={
          <IosSwitch
            aria-label="Notifikasi push"
            checked={enabled}
            disabled={pending}
            onCheckedChange={(checked) => void toggle(checked)}
          />
        }
      />
    </SettingsIosSection>
  );
}
