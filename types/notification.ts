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
