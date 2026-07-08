/**
 * Manual weekly-summary smoke test (no HTTP / CRON_SECRET needed).
 *
 * Usage:
 *   npx tsx scripts/test-weekly-summary.ts
 *   npx tsx scripts/test-weekly-summary.ts 2026-07-06
 *   npx tsx scripts/test-weekly-summary.ts 2026-07-06 <userId>
 */
import { prisma } from "@/lib/db/prisma";
import {
  ensurePendingWeeklySummary,
  getWeekRange,
  isMondayInAppTimezone,
} from "@/lib/db/weekly-summary";
import { addDays, parseDayKey, toDayKey } from "@/lib/finance/day-range";

async function main() {
  const dateArg = process.argv[2];
  const userIdArg = process.argv[3];

  const referenceDate = dateArg
    ? parseDayKey(dateArg)
    : parseDayKey("2026-07-06");

  if (Number.isNaN(referenceDate.getTime())) {
    throw new Error(`Tanggal tidak valid: ${dateArg}`);
  }

  console.log("referenceDate:", toDayKey(referenceDate));
  console.log("isMonday:", isMondayInAppTimezone(referenceDate));

  if (!isMondayInAppTimezone(referenceDate)) {
    console.log(
      "Bukan Senin — pastikan pakai tanggal Senin, contoh: 2026-07-06",
    );
    process.exit(1);
  }

  const user =
    userIdArg != null
      ? await prisma.user.findUnique({ where: { id: userIdArg } })
      : await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

  if (!user) {
    throw new Error("User tidak ditemukan.");
  }

  console.log("user:", user.email, `(${user.id})`);

  const previousWeek = getWeekRange(addDays(getWeekRange(referenceDate).weekStartDay, -7));
  console.log(
    "will summarize week:",
    toDayKey(previousWeek.weekStartDay),
    "→",
    toDayKey(previousWeek.end),
  );

  const result = await ensurePendingWeeklySummary(user.id, referenceDate);

  console.log("created:", result.created);
  if (result.content) {
    console.log("--- content ---");
    console.log(result.content);
    console.log("---------------");
  } else if (!result.created) {
    const existing = await prisma.inboxMessage.findFirst({
      where: {
        userId: user.id,
        kind: "weekly_summary",
        summaryDate: previousWeek.weekStartDay,
      },
      select: { content: true, id: true, createdAt: true },
    });
    console.log("already existed:", existing?.id ?? null);
    if (existing?.content) {
      console.log("--- content ---");
      console.log(existing.content);
      console.log("---------------");
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
