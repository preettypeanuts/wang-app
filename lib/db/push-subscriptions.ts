import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";
import type { PushSubscriptionPayload } from "@/types/notification";

export async function upsertPushSubscription(
  userId: string,
  subscription: PushSubscriptionPayload,
) {
  return prisma.pushSubscription.upsert({
    where: {
      endpoint: subscription.endpoint,
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function deletePushSubscription(
  userId: string,
  endpoint: string,
) {
  return prisma.pushSubscription.deleteMany({
    where: scopedByUser(userId, { endpoint }),
  });
}

export async function listPushSubscriptionsForUser(userId: string) {
  return prisma.pushSubscription.findMany({
    where: scopedByUser(userId),
    orderBy: { createdAt: "desc" },
  });
}

export async function listUsersWithPushSubscriptions() {
  const rows = await prisma.pushSubscription.findMany({
    select: { userId: true },
    distinct: ["userId"],
  });

  return rows.map((row) => row.userId);
}
