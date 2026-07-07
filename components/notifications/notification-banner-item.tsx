"use client";

import { useEffect } from "react";

import { IosNotificationAlert } from "@/components/notifications/ios-notification-alert";
import { NOTIFICATION_IN_APP_AUTO_DISMISS_MS } from "@/config/notifications";
import type { AppNotificationRecord } from "@/types/notification";

interface NotificationBannerItemProps {
  notification: AppNotificationRecord;
  onDismiss: (notificationId: string) => void;
  onOpen: (notification: AppNotificationRecord) => void;
}

export function NotificationBannerItem({
  notification,
  onDismiss,
  onOpen,
}: NotificationBannerItemProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(notification.id);
    }, NOTIFICATION_IN_APP_AUTO_DISMISS_MS);

    return () => window.clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <IosNotificationAlert
      notification={notification}
      onDismiss={() => onDismiss(notification.id)}
      onOpen={() => onOpen(notification)}
    />
  );
}
