"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notifications";
import { NotificationListItem } from "@/components/notifications/notification-list-item";
import { NotificationsSummaryBar } from "@/components/notifications/notifications-summary-bar";
import {
  NOTIFICATIONS_EMPTY_STATE,
  NOTIFICATIONS_LOAD_MORE_SENTINEL,
  NOTIFICATIONS_PAGE_SCROLL_INNER,
} from "@/config/notifications-page";
import { useNotificationsFeed } from "@/hooks/use-notifications-feed";
import type { AppNotificationFeedPage, AppNotificationRecord } from "@/types/notification";

interface NotificationsFeedProps {
  initialFeed: AppNotificationFeedPage;
}

export function NotificationsFeed({ initialFeed }: NotificationsFeedProps) {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    items,
    counts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    setItems,
    setCounts,
  } = useNotificationsFeed(initialFeed);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  async function handleOpen(notification: AppNotificationRecord) {
    if (!notification.readAt) {
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      );
      setCounts((current) => ({
        ...current,
        unread: Math.max(0, current.unread - 1),
      }));
      await markNotificationReadAction(notification.id);
    }

    router.push(notification.href);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsReadAction();
    setItems((current) =>
      current.map((item) =>
        item.readAt ? item : { ...item, readAt: new Date().toISOString() },
      ),
    );
    setCounts((current) => ({ ...current, unread: 0 }));
  }

  if (isLoading) {
    return (
      <div className={NOTIFICATIONS_PAGE_SCROLL_INNER}>
        <NotificationsSummaryBar counts={{ total: 0, unread: 0 }} />
        <div className={NOTIFICATIONS_EMPTY_STATE}>
          <p className="text-sm text-muted-foreground">Memuat notifikasi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={NOTIFICATIONS_PAGE_SCROLL_INNER}>
        <NotificationsSummaryBar counts={counts} />
        <div className={NOTIFICATIONS_EMPTY_STATE}>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={NOTIFICATIONS_PAGE_SCROLL_INNER}>
      <NotificationsSummaryBar
        counts={counts}
        onMarkAllRead={() => void handleMarkAllRead()}
      />

      {items.length === 0 ? (
        <div className={NOTIFICATIONS_EMPTY_STATE}>
          <p className="text-sm font-medium text-foreground">
            Belum ada notifikasi
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Alert tagihan, ringkasan AI, dan pembaruan tabungan akan muncul di
            sini.
          </p>
        </div>
      ) : (
        <>
          {items.map((notification) => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              onOpen={(item) => void handleOpen(item)}
            />
          ))}
          {hasMore ? (
            <div
              ref={sentinelRef}
              aria-hidden
              className={NOTIFICATIONS_LOAD_MORE_SENTINEL}
            />
          ) : null}
          {isLoadingMore ? (
            <p className="py-2 text-center text-[12px] text-muted-foreground">
              Memuat notifikasi lama...
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
