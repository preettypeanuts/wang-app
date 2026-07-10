"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PUSH_ERROR_ENABLE_FAILED,
  PUSH_ERROR_UNSUPPORTED,
} from "@/config/settings-labels";
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
        setError(PUSH_ERROR_UNSUPPORTED);
        return;
      }

      const result = await subscribeToPushNotifications();

      if (!result.ok) {
        setError(result.error ?? PUSH_ERROR_ENABLE_FAILED);
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
