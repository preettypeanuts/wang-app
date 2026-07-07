import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";
import type {
  AppNotificationRecord,
  NotificationDraft,
} from "@/types/notification";

function toRecord(row: {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string;
  readAt: Date | null;
  createdAt: Date;
}): AppNotificationRecord {
  return {
    id: row.id,
    kind: row.kind as AppNotificationRecord["kind"],
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function upsertAppNotification(
  userId: string,
  draft: NotificationDraft,
) {
  return prisma.appNotification.upsert({
    where: {
      userId_dedupeKey: {
        userId,
        dedupeKey: draft.dedupeKey,
      },
    },
    create: {
      userId,
      kind: draft.kind,
      title: draft.title,
      body: draft.body,
      href: draft.href,
      dedupeKey: draft.dedupeKey,
    },
    update: {
      title: draft.title,
      body: draft.body,
      href: draft.href,
      kind: draft.kind,
    },
  });
}

export async function listUnreadAppNotifications(
  userId: string,
  limit = 10,
): Promise<AppNotificationRecord[]> {
  const rows = await prisma.appNotification.findMany({
    where: scopedByUser(userId, { readAt: null }),
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map(toRecord);
}

export async function markAppNotificationRead(
  userId: string,
  notificationId: string,
) {
  return prisma.appNotification.updateMany({
    where: scopedByUser(userId, { id: notificationId }),
    data: { readAt: new Date() },
  });
}

export async function markAllAppNotificationsRead(userId: string) {
  return prisma.appNotification.updateMany({
    where: scopedByUser(userId, { readAt: null }),
    data: { readAt: new Date() },
  });
}

export async function markAppNotificationPushed(
  userId: string,
  dedupeKey: string,
) {
  return prisma.appNotification.updateMany({
    where: scopedByUser(userId, { dedupeKey, pushedAt: null }),
    data: { pushedAt: new Date() },
  });
}
