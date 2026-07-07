import { prisma } from "@/lib/db/prisma";
import {
  markAppNotificationPushed,
  upsertAppNotification,
} from "@/lib/db/app-notifications";
import {
  listPushSubscriptionsForUser,
  listUsersWithPushSubscriptions,
} from "@/lib/db/push-subscriptions";
import { buildUserNotificationDrafts } from "@/lib/notifications/build-user-notifications";
import {
  isWebPushConfigured,
  sendWebPush,
} from "@/lib/notifications/send-web-push";

export interface NotificationCronResult {
  usersProcessed: number;
  notificationsCreated: number;
  pushSent: number;
  pushFailed: number;
  errors: string[];
}

async function listAllUserIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  return users.map((user) => user.id);
}

async function processUserNotifications(
  userId: string,
  referenceDate: Date,
): Promise<{ created: number; pushSent: number; pushFailed: number }> {
  const drafts = await buildUserNotificationDrafts(userId, referenceDate);
  let created = 0;
  let pushSent = 0;
  let pushFailed = 0;

  const subscriptions = isWebPushConfigured()
    ? await listPushSubscriptionsForUser(userId)
    : [];

  for (const draft of drafts) {
    const notification = await upsertAppNotification(userId, draft);
    created += 1;

    if (subscriptions.length === 0 || notification.pushedAt) {
      continue;
    }

    let delivered = false;

    for (const subscription of subscriptions) {
      try {
        await sendWebPush(subscription, {
          title: draft.title,
          body: draft.body,
          href: draft.href,
          tag: draft.dedupeKey,
        });
        delivered = true;
        pushSent += 1;
      } catch {
        pushFailed += 1;
      }
    }

    if (delivered) {
      await markAppNotificationPushed(userId, draft.dedupeKey);
    }
  }

  return { created, pushSent, pushFailed };
}

export async function runNotificationCron(
  referenceDate: Date = new Date(),
): Promise<NotificationCronResult> {
  const pushUserIds = await listUsersWithPushSubscriptions();
  const allUserIds = await listAllUserIds();
  const userIds = [...new Set([...allUserIds, ...pushUserIds])];

  const result: NotificationCronResult = {
    usersProcessed: 0,
    notificationsCreated: 0,
    pushSent: 0,
    pushFailed: 0,
    errors: [],
  };

  for (const userId of userIds) {
    try {
      const summary = await processUserNotifications(userId, referenceDate);
      result.usersProcessed += 1;
      result.notificationsCreated += summary.created;
      result.pushSent += summary.pushSent;
      result.pushFailed += summary.pushFailed;
    } catch (error) {
      result.errors.push(
        `${userId}: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  return result;
}
