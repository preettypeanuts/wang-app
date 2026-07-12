import { NextResponse } from "next/server";

import { getApiUserId } from "@/lib/auth/api-session";
import { getInboxSlashContext } from "@/lib/inbox/get-inbox-deferred-data";
import { getInboxDailySummaries } from "@/lib/inbox/get-inbox-daily-summaries";

export async function GET(request: Request) {
  const userId = await getApiUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = new URL(request.url).searchParams.get("scope");

  if (scope === "slash") {
    return NextResponse.json(await getInboxSlashContext(userId));
  }

  if (scope === "daily-summary") {
    return NextResponse.json(await getInboxDailySummaries(userId));
  }

  return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
}
