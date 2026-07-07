export type AppNotificationKind =
  | "bill_reminder"
  | "daily_summary"
  | "ai_brief"
  | "alert"
  | "savings";

export interface AppNotificationRecord {
  id: string;
  kind: AppNotificationKind;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationDraft {
  kind: AppNotificationKind;
  title: string;
  body: string;
  href: string;
  dedupeKey: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface AppNotificationCounts {
  total: number;
  unread: number;
}

export interface AppNotificationFeedPage {
  items: AppNotificationRecord[];
  nextCursor: string | null;
  /** Omitted on cursor pages — client keeps existing counts. */
  counts?: AppNotificationCounts;
}

/** Lightweight head for cache revalidation — skip full feed fetch when unchanged. */
export interface AppNotificationFeedMeta {
  counts: AppNotificationCounts;
  latestId: string | null;
  latestCreatedAt: string | null;
}
