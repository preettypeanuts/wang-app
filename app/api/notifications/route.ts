import { NextResponse } from "next/server";

import { getApiUserId } from "@/lib/auth/api-session";
import { listUnreadAppNotifications } from "@/lib/db/app-notifications";

export async function GET() {
  const userId = await getApiUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await listUnreadAppNotifications(userId);

  return NextResponse.json({ notifications });
}
