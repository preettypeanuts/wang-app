"use client";

import { useEffect, useState } from "react";

import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { SettingsIosRow } from "@/components/settings/settings-ios-row";
import { SETTINGS_IOS_ICON_ACCENT } from "@/config/settings-ios";
import { SparkleIcon } from "@/lib/icons";
import {
  getPushPermission,
  hasActivePushSubscription,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/push/subscribe-client";

export function SettingsPushNotificationRow() {
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

  return (
    <div className="space-y-2">
      <SettingsIosRow
        icon={<SparkleIcon aria-hidden />}
        iconClassName={SETTINGS_IOS_ICON_ACCENT}
        label="Notifikasi push"
        value={enabled ? "Aktif" : "Nonaktif"}
        showChevron={false}
        onClick={() => void handleToggle()}
      />
      {pending ? (
        <p className="px-4 text-[13px] text-muted-foreground">Memproses...</p>
      ) : null}
      {error ? (
        <div className="px-1">
          <AuthErrorAlert message={error} />
        </div>
      ) : null}
    </div>
  );
}
