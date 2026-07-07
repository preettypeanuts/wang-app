import {
  NOTIFICATIONS_MARK_ALL_BUTTON,
  NOTIFICATIONS_SUMMARY_BAR,
  NOTIFICATIONS_SUMMARY_TOTAL,
  NOTIFICATIONS_SUMMARY_UNREAD,
} from "@/config/notifications-page";
import type { AppNotificationCounts } from "@/types/notification";

interface NotificationsSummaryBarProps {
  counts: AppNotificationCounts;
  onMarkAllRead?: () => void;
}

export function NotificationsSummaryBar({
  counts,
  onMarkAllRead,
}: NotificationsSummaryBarProps) {
  return (
    <div className={NOTIFICATIONS_SUMMARY_BAR}>
      <div className="min-w-0">
        <p className={NOTIFICATIONS_SUMMARY_TOTAL}>
          {counts.total} notifikasi
        </p>
        <p className={NOTIFICATIONS_SUMMARY_UNREAD}>
          {counts.unread > 0
            ? `${counts.unread} belum dibaca`
            : "Semua sudah dibaca"}
        </p>
      </div>
      {counts.unread > 0 && onMarkAllRead ? (
        <button
          type="button"
          className={NOTIFICATIONS_MARK_ALL_BUTTON}
          onClick={onMarkAllRead}
        >
          Tandai dibaca
        </button>
      ) : null}
    </div>
  );
}
