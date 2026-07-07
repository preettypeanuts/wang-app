import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";
import type {
  AppNotificationCounts,
  AppNotificationFeedMeta,
  AppNotificationFeedPage,
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

export async function getAppNotificationCounts(
  userId: string,
): Promise<AppNotificationCounts> {
  const [row] = await prisma.$queryRaw<Array<{ total: number; unread: number }>>`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE "readAt" IS NULL)::int AS unread
    FROM "monmon_whethertie"."AppNotification"
    WHERE "userId" = ${userId}
  `;

  return row ?? { total: 0, unread: 0 };
}

const DEFAULT_FEED_PAGE_SIZE = 20;

export async function listAppNotificationFeedPage(
  userId: string,
  options: { cursor?: string; limit?: number } = {},
): Promise<AppNotificationFeedPage> {
  const limit = options.limit ?? DEFAULT_FEED_PAGE_SIZE;
  const cursorRow = options.cursor
    ? await prisma.appNotification.findFirst({
        where: scopedByUser(userId, { id: options.cursor }),
        select: { createdAt: true, id: true },
      })
    : null;

  const cursorFilter = cursorRow
    ? {
        OR: [
          { createdAt: { lt: cursorRow.createdAt } },
          {
            createdAt: cursorRow.createdAt,
            id: { lt: cursorRow.id },
          },
        ],
      }
    : {};

  const rows = await prisma.appNotification.findMany({
    where: scopedByUser(userId, cursorFilter),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore
    ? (pageRows[pageRows.length - 1]?.id ?? null)
    : null;

  if (options.cursor) {
    return {
      items: pageRows.map(toRecord),
      nextCursor,
    };
  }

  const counts = await getAppNotificationCounts(userId);

  return {
    items: pageRows.map(toRecord),
    nextCursor,
    counts,
  };
}

export async function getAppNotificationFeedMeta(
  userId: string,
): Promise<AppNotificationFeedMeta> {
  const [counts, latest] = await Promise.all([
    getAppNotificationCounts(userId),
    prisma.appNotification.findFirst({
      where: scopedByUser(userId, {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { id: true, createdAt: true },
    }),
  ]);

  return {
    counts,
    latestId: latest?.id ?? null,
    latestCreatedAt: latest?.createdAt.toISOString() ?? null,
  };
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
