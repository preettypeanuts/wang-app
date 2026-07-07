"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { markNotificationReadAction } from "@/app/actions/notifications";
import { IosNotificationAlert } from "@/components/notifications/ios-notification-alert";
import { FixedViewportPortal } from "@/components/shared/fixed-viewport-portal";
import {
  IOS_NOTIFICATION_STACK_ROOT,
  NOTIFICATION_MAX_IN_APP_STACK,
} from "@/config/notifications";
import type { AppNotificationRecord } from "@/types/notification";

export function NotificationBannerStack() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotificationRecord[]>(
    [],
  );

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        notifications: AppNotificationRecord[];
      };

      setNotifications(data.notifications.slice(0, NOTIFICATION_MAX_IN_APP_STACK));
    } catch {
      // Ignore fetch errors silently in banner.
    }
  }, []);

  useEffect(() => {
    void loadNotifications();

    const onFocus = () => {
      void loadNotifications();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadNotifications]);

  async function dismissNotification(notificationId: string) {
    setNotifications((current) =>
      current.filter((item) => item.id !== notificationId),
    );
    await markNotificationReadAction(notificationId);
  }

  function openNotification(notification: AppNotificationRecord) {
    void dismissNotification(notification.id);
    router.push(notification.href);
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <FixedViewportPortal>
      <div className={IOS_NOTIFICATION_STACK_ROOT}>
        {notifications.map((notification) => (
          <IosNotificationAlert
            key={notification.id}
            notification={notification}
            onDismiss={() => void dismissNotification(notification.id)}
            onOpen={() => openNotification(notification)}
          />
        ))}
      </div>
    </FixedViewportPortal>
  );
}
