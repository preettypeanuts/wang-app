import Image from "next/image";

import {
  NOTIFICATION_KIND_LABELS,
  NOTIFICATIONS_LIST_ITEM,
  NOTIFICATIONS_LIST_ITEM_BODY,
  NOTIFICATIONS_LIST_ITEM_ICON,
  NOTIFICATIONS_LIST_ITEM_INNER,
  NOTIFICATIONS_LIST_ITEM_KIND,
  NOTIFICATIONS_LIST_ITEM_TIME,
  NOTIFICATIONS_LIST_ITEM_TITLE,
  NOTIFICATIONS_LIST_ITEM_UNREAD,
} from "@/config/notifications-page";
import { NOTIFICATION_PUSH_ICON } from "@/config/notifications";
import { formatNotificationTime } from "@/lib/notifications/format-notification-time";
import { cn } from "@/lib/utils";
import type { AppNotificationRecord } from "@/types/notification";

interface NotificationListItemProps {
  notification: AppNotificationRecord;
  onOpen: (notification: AppNotificationRecord) => void;
}

export function NotificationListItem({
  notification,
  onOpen,
}: NotificationListItemProps) {
  const isUnread = !notification.readAt;

  return (
    <button
      type="button"
      className={cn(
        NOTIFICATIONS_LIST_ITEM,
        isUnread && NOTIFICATIONS_LIST_ITEM_UNREAD,
      )}
      onClick={() => onOpen(notification)}
    >
      <div className={NOTIFICATIONS_LIST_ITEM_INNER}>
        <Image
          alt=""
          className={NOTIFICATIONS_LIST_ITEM_ICON}
          height={40}
          src={NOTIFICATION_PUSH_ICON}
          width={40}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={NOTIFICATIONS_LIST_ITEM_KIND}>
              {NOTIFICATION_KIND_LABELS[notification.kind]}
            </p>
            <time
              className={NOTIFICATIONS_LIST_ITEM_TIME}
              dateTime={notification.createdAt}
            >
              {formatNotificationTime(notification.createdAt)}
            </time>
          </div>
          <p className={NOTIFICATIONS_LIST_ITEM_TITLE}>{notification.title}</p>
          <p className={NOTIFICATIONS_LIST_ITEM_BODY}>{notification.body}</p>
        </div>
      </div>
    </button>
  );
}
