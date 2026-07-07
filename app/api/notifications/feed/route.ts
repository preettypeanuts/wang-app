import { NextResponse } from "next/server";

import { getApiUserId } from "@/lib/auth/api-session";
import { listAppNotificationFeedPage } from "@/lib/db/app-notifications";

export async function GET(request: Request) {
  const userId = await getApiUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  const feed = await listAppNotificationFeedPage(userId, { cursor, limit });

  return NextResponse.json(feed);
}
