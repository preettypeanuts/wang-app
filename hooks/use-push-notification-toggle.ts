"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getPushPermission,
  hasActivePushSubscription,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/push/subscribe-client";

export function usePushNotificationToggle() {
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void hasActivePushSubscription().then(setEnabled);
  }, []);

  const toggle = useCallback(async (next?: boolean) => {
    const turnOn = next ?? !enabled;

    setError(null);
    setPending(true);

    try {
      if (!turnOn) {
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
  }, [enabled]);

  return {
    enabled,
    pending,
    error,
    toggle,
  };
}
