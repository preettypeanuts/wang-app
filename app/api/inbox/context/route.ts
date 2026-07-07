import { NextResponse } from "next/server";

import { getApiUserId } from "@/lib/auth/api-session";
import { getDailySummaryForDay } from "@/lib/db/daily-summary";
import { getYesterday } from "@/lib/finance/day-range";
import { getInboxSlashContext } from "@/lib/inbox/get-inbox-deferred-data";

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
    const dailySummary = await getDailySummaryForDay(userId, getYesterday());
    return NextResponse.json({ dailySummary });
  }

  return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
}
