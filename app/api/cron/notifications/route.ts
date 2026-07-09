import { NextResponse } from "next/server";

import { parseDayKey, toDayKey } from "@/lib/finance/day-range";
import { runNotificationCron } from "@/lib/notifications/run-notification-cron";

/** Vercel Pro — cron should finish in seconds; Hobby caps at 10s regardless. */
export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const headerSecret = request.headers.get("x-cron-secret");

  return bearer === secret || headerSecret === secret;
}

/** Vercel cron (see vercel.json) — 05:00 WIB / 22:00 UTC. Optional `?date=YYYY-MM-DD` for manual tests. */
function resolveReferenceDate(request: Request): Date {
  const raw = new URL(request.url).searchParams.get("date")?.trim();
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date();
  }

  const parsed = parseDayKey(raw);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const referenceDate = resolveReferenceDate(request);
  const result = await runNotificationCron(referenceDate);

  return NextResponse.json({
    ok: true,
    referenceDate: toDayKey(referenceDate),
    ...result,
  });
}
