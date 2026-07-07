"use client";

import { useEffect, useState } from "react";

import { SettingsIosRow } from "@/components/settings/settings-ios-row";
import { SettingsIosSection } from "@/components/settings/settings-ios-section";
import { SETTINGS_IOS_ICON_ACCENT } from "@/config/settings-ios";
import { SparkleIcon } from "@/lib/icons";
import {
  getPushPermission,
  hasActivePushSubscription,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/push/subscribe-client";
import { cn } from "@/lib/utils";

const PUSH_FOOTER_DEFAULT =
  "Tagihan mendatang, ringkasan AI, dan alert penting.";

export function SettingsPushNotificationSection() {
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void hasActivePushSubscription().then(setEnabled);
  }, []);

  async function handleToggle() {
    setError(null);
    setPending(true);

    try {
      if (enabled) {
        await unsubscribeFromPushNotifications();
        setEnabled(false);
        return;
      }

      const permission = await getPushPermission();

      if (permission === "unsupported") {
        setError("Browser ini belum mendukung push notification.");
        return;
      }

      const result = await subscribeToPushNotifications();

      if (!result.ok) {
        setError(result.error ?? "Gagal mengaktifkan notifikasi.");
        return;
      }

      setEnabled(true);
    } finally {
      setPending(false);
    }
  }

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
        value={pending ? "Memproses..." : enabled ? "Aktif" : "Nonaktif"}
        showChevron={false}
        onClick={() => void handleToggle()}
      />
    </SettingsIosSection>
  );
}
