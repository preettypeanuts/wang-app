"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import {
  markAllAppNotificationsRead,
  markAppNotificationRead,
} from "@/lib/db/app-notifications";

export async function markNotificationReadAction(notificationId: string) {
  const userId = await requireUserId();
  await markAppNotificationRead(userId, notificationId);
  revalidatePath("/");
}

export async function markAllNotificationsReadAction() {
  const userId = await requireUserId();
  await markAllAppNotificationsRead(userId);
  revalidatePath("/");
}
