/**
 * Demo account seed — run: npm run db:seed-demo
 *
 * Login: demo@wang.com / demo123
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { generateRandomString, hashPassword } from "better-auth/crypto";

import { PrismaClient } from "../generated/prisma/client";

export const DEMO_EMAIL = "demo@wang.com";
export const DEMO_PASSWORD = "demo123";
export const DEMO_NAME = "Demo Wang";

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function atTime(day: Date, hours: number, minutes = 0): Date {
  const next = new Date(day);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function monthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function buildDailyInsight(insight: string, label: string): string {
  return JSON.stringify({
    v: 1,
    insight,
    condition: { label },
  });
}

function buildDailySummaryContent(
  date: Date,
  income: number,
  expense: number,
  count: number,
): string {
  const label = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (count === 0) {
    return `Ringkasan harian — ${label}\n\nTidak ada transaksi tercatat hari ini.`;
  }

  const format = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  return [
    `Ringkasan harian — ${label}`,
    "",
    `Pemasukan ${format(income)} · Pengeluaran ${format(expense)}`,
    `${count} transaksi tercatat.`,
  ].join("\n");
}

interface SeedTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  rawInput: string;
  occurredAt: Date;
  reply: string;
}

function buildTransactions(now: Date): SeedTransaction[] {
  const today = startOfDay(now);
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return [
    {
      type: "income",
      amount: 12_500_000,
      category: "salary",
      description: "Gaji bulanan",
      rawInput: "Gaji bulanan 12.5jt",
      occurredAt: atTime(monthStart, 9, 0),
      reply:
        'Mantap! Pemasukan Rp12.500.000 (Gaji) dari "Gaji bulanan" sudah masuk.',
    },
    {
      type: "expense",
      amount: 2_500_000,
      category: "housing",
      description: "Apartemen",
      rawInput: "Bayar apartemen 2.5jt",
      occurredAt: atTime(addDays(monthStart, 2), 10, 0),
      reply:
        "Siap, sudah aku catat! Rp2.500.000 untuk apartemen masuk kategori Perumahan.",
    },
    {
      type: "expense",
      amount: 45_000,
      category: "food",
      description: "Kopi Kenangan",
      rawInput: "Kopi kenangan 45rb",
      occurredAt: atTime(twoDaysAgo, 8, 15),
      reply:
        "Oke noted~ Rp45.000 untuk Kopi Kenangan masuk kategori Makanan & Minuman.",
    },
    {
      type: "expense",
      amount: 68_000,
      category: "food",
      description: "Makan siang",
      rawInput: "Makan siang warteg 68rb",
      occurredAt: atTime(twoDaysAgo, 12, 30),
      reply:
        "Catat! Rp68.000 untuk makan siang masuk kategori Makanan & Minuman.",
    },
    {
      type: "expense",
      amount: 25_000,
      category: "transport",
      description: "Grab ke kantor",
      rawInput: "Grab 25rb",
      occurredAt: atTime(twoDaysAgo, 18, 45),
      reply:
        "Siap, sudah aku catat! Rp25.000 untuk Grab masuk kategori Transport.",
    },
    {
      type: "expense",
      amount: 52_000,
      category: "food",
      description: "Kopi sore",
      rawInput: "Kopi 52rb",
      occurredAt: atTime(yesterday, 9, 5),
      reply:
        "Oke noted~ Rp52.000 untuk kopi sore masuk kategori Makanan & Minuman.",
    },
    {
      type: "expense",
      amount: 185_000,
      category: "food",
      description: "Makan malam",
      rawInput: "Makan malam 185rb",
      occurredAt: atTime(yesterday, 19, 20),
      reply:
        "Catat! Rp185.000 untuk makan malam masuk kategori Makanan & Minuman.",
    },
    {
      type: "expense",
      amount: 35_000,
      category: "transport",
      description: "GoCar",
      rawInput: "Gocar 35rb",
      occurredAt: atTime(yesterday, 21, 10),
      reply:
        "Siap, sudah aku catat! Rp35.000 untuk GoCar masuk kategori Transport.",
    },
    {
      type: "expense",
      amount: 38_000,
      category: "food",
      description: "Sarapan",
      rawInput: "Sarapan roti 38rb",
      occurredAt: atTime(today, 7, 40),
      reply:
        "Oke noted~ Rp38.000 untuk sarapan masuk kategori Makanan & Minuman.",
    },
    {
      type: "expense",
      amount: 120_000,
      category: "shopping",
      description: "Uniqlo",
      rawInput: "Belanja uniqlo 120rb",
      occurredAt: atTime(today, 13, 15),
      reply:
        "Siap, sudah aku catat! Rp120.000 untuk Uniqlo masuk kategori Belanja.",
    },
    {
      type: "expense",
      amount: 69_000,
      category: "subscription",
      description: "Netflix",
      rawInput: "Netflix 69rb",
      occurredAt: atTime(today, 15, 0),
      reply: "Catat! Rp69.000 untuk Netflix masuk kategori Langganan.",
    },
  ];
}

function summarizeDay(transactions: SeedTransaction[], day: Date) {
  const start = startOfDay(day);
  const end = endOfDay(day);
  const rows = transactions.filter(
    (row) => row.occurredAt >= start && row.occurredAt <= end,
  );

  let income = 0;
  let expense = 0;

  for (const row of rows) {
    if (row.type === "income") {
      income += row.amount;
    } else {
      expense += row.amount;
    }
  }

  return { income, expense, count: rows.length };
}

async function createDemoUser(prisma: PrismaClient) {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  });

  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
    console.log("Removed existing demo user");
  }

  const userId = generateRandomString(32);
  const password = await hashPassword(DEMO_PASSWORD);

  await prisma.user.create({
    data: {
      id: userId,
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      emailVerified: true,
    },
  });

  await prisma.account.create({
    data: {
      id: generateRandomString(32),
      accountId: userId,
      providerId: "credential",
      userId,
      password,
    },
  });

  return userId;
}

async function seedDemoData(prisma: PrismaClient, userId: string) {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = addDays(today, -1);
  const periodMonth = monthKey(now);
  const year = now.getFullYear();
  const transactions = buildTransactions(now);

  for (const row of transactions) {
    const userAt = new Date(row.occurredAt.getTime() - 1_000);
    const assistantAt = row.occurredAt;

    await prisma.inboxMessage.create({
      data: {
        userId,
        role: "user",
        kind: "chat",
        content: row.rawInput,
        createdAt: userAt,
      },
    });

    const assistant = await prisma.inboxMessage.create({
      data: {
        userId,
        role: "assistant",
        kind: "chat",
        content: row.reply,
        createdAt: assistantAt,
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: row.type,
        amount: row.amount,
        category: row.category,
        description: row.description,
        rawInput: row.rawInput,
        occurredAt: row.occurredAt,
        createdAt: row.occurredAt,
        inboxMessageId: assistant.id,
      },
    });
  }

  await prisma.inboxMessage.create({
    data: {
      userId,
      role: "user",
      kind: "chat",
      content: "Gimana budget makan bulan ini?",
      createdAt: atTime(today, 16, 0),
    },
  });

  await prisma.inboxMessage.create({
    data: {
      userId,
      role: "assistant",
      kind: "chat",
      content:
        "Budget Makanan & Minuman masih aman — sisa sekitar Rp420.000 (62%). Pelan-pelan ya~",
      createdAt: new Date(atTime(today, 16, 0).getTime() + 1_000),
    },
  });

  for (const day of [yesterday, addDays(today, -2)]) {
    const summary = summarizeDay(transactions, day);
    const content = buildDailySummaryContent(
      day,
      summary.income,
      summary.expense,
      summary.count,
    );

    await prisma.inboxMessage.create({
      data: {
        userId,
        role: "assistant",
        kind: "daily_summary",
        content,
        insight: buildDailyInsight(
          summary.expense > 200_000
            ? "Pengeluaran kemarin agak tinggi, terutama dari makan."
            : "Pengeluaran kemarin masih terkendali.",
          summary.expense > 200_000 ? "Waspada" : "Aman",
        ),
        summaryDate: startOfDay(day),
        createdAt: endOfDay(day),
      },
    });
  }

  await prisma.plannedItem.createMany({
    data: [
      {
        userId,
        name: "Apartemen",
        kind: "bill",
        repeat: "monthly",
        amount: 2_500_000,
        flowType: "expense",
        category: "housing",
        startAt: new Date(year, now.getMonth(), 25),
      },
      {
        userId,
        name: "Netflix",
        kind: "subscription",
        repeat: "monthly",
        amount: 69_000,
        flowType: "expense",
        category: "subscription",
        startAt: new Date(year, now.getMonth(), 8),
      },
      {
        userId,
        name: "Spotify",
        kind: "subscription",
        repeat: "monthly",
        amount: 54_990,
        flowType: "expense",
        category: "subscription",
        startAt: new Date(year, now.getMonth(), 12),
      },
      {
        userId,
        name: "MacBook",
        kind: "installment",
        repeat: "monthly",
        amount: 1_250_000,
        flowType: "expense",
        category: "shopping",
        startAt: new Date(year, now.getMonth() - 3, 1),
        installmentCount: 12,
        paidInstallmentCount: 3,
      },
      {
        userId,
        name: "Gaji freelance",
        kind: "income",
        repeat: "monthly",
        amount: 3_500_000,
        flowType: "income",
        category: "salary",
        startAt: new Date(year, now.getMonth(), 28),
      },
    ],
  });

  await prisma.plan.createMany({
    data: [
      {
        userId,
        name: "iPhone 17 Pro",
        amount: 18_999_000,
        category: "shopping",
        status: "active",
        note: "Target akhir tahun",
      },
      {
        userId,
        name: "Sepatu running",
        amount: 2_499_000,
        category: "shopping",
        status: "active",
      },
      {
        userId,
        name: "Headphone Sony",
        amount: 3_200_000,
        category: "shopping",
        status: "done",
        note: "Sudah dibeli bulan lalu",
      },
    ],
  });

  const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();

  await prisma.categoryBudget.createMany({
    data: [
      {
        userId,
        category: "food",
        periodMonth,
        limitMode: "daily",
        dailyAmount: 80_000,
        dayCount: daysInMonth,
        note: "Makan & kopi harian",
        repeatNextMonth: true,
      },
      {
        userId,
        category: "transport",
        periodMonth,
        limitMode: "fixed",
        fixedLimit: 800_000,
        note: "Grab + bensin",
        repeatNextMonth: true,
      },
      {
        userId,
        category: "shopping",
        periodMonth,
        limitMode: "fixed",
        fixedLimit: 1_500_000,
        repeatNextMonth: false,
      },
      {
        userId,
        category: "entertainment",
        periodMonth,
        limitMode: "fixed",
        fixedLimit: 500_000,
      },
    ],
  });
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const userId = await createDemoUser(prisma);
  await seedDemoData(prisma, userId);

  await prisma.$disconnect();

  console.log("\nDemo account ready:");
  console.log(`  Email   : ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
