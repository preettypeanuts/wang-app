import { Type } from "@google/genai";

import { getCategoryLabel } from "@/config/categories";
import {
  GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS,
  GEMINI_MODEL,
} from "@/config/gemini";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { formatJournalDate } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import type { JournalCondition } from "@/types/journal";

const CONDITION_LABELS = ["Aman", "Stabil", "Waspada", "Boros", "Kritis"] as const;

interface JournalSummaryTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

const SYSTEM_INSTRUCTION = `Kamu analis keuangan Monmon. Beri penilaian singkat kondisi keuangan user untuk hari tersebut.
Bahasa Indonesia. Jawab label kondisi (1 kata) dan emoji yang cocok.
Label harus salah satu nuansa: Aman, Stabil, Waspada, Boros, atau Kritis — sesuai data, jangan mengarang.`;

function buildPrompt(
  date: Date,
  transactions: JournalSummaryTransaction[],
  cumulativeBalance: number,
): string {
  const summary = buildTodaySummary(transactions);
  const dateLabel = formatJournalDate(date);

  const lines = [
    `Tanggal: ${dateLabel}`,
    `Pemasukan hari ini: ${formatIdr(summary.totalIncome)}`,
    `Pengeluaran hari ini: ${formatIdr(summary.totalExpense)}`,
    `Saldo kumulatif sampai hari ini: ${formatIdr(cumulativeBalance)}`,
    `Jumlah transaksi hari ini: ${transactions.length}`,
  ];

  if (summary.categories.length > 0) {
    lines.push("", "Pengeluaran per kategori hari ini:");

    for (const category of summary.categories.slice(0, 5)) {
      lines.push(
        `- ${category.label}: ${formatIdr(category.total)} (${category.count}x)`,
      );
    }
  }

  if (transactions.length > 0) {
    lines.push("", "Transaksi hari ini:");

    for (const transaction of transactions.slice(0, 15)) {
      lines.push(
        `- [${transaction.type}] ${getCategoryLabel(transaction.category)} ${formatIdr(transaction.amount)} — ${transaction.description}`,
      );
    }
  }

  return lines.join("\n");
}

export async function generateJournalConditionWithGemini(
  date: Date,
  transactions: JournalSummaryTransaction[],
  cumulativeBalance: number,
): Promise<JournalCondition> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(date, transactions, cumulativeBalance),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      maxOutputTokens: GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS,
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, enum: [...CONDITION_LABELS] },
          emoji: { type: Type.STRING },
        },
        required: ["label", "emoji"],
      },
    },
  });

  const raw = response.text?.trim();

  if (!raw) {
    throw new Error("Gemini tidak memberi respons kondisi.");
  }

  const payload = JSON.parse(raw) as { label?: string; emoji?: string };
  const label = payload.label?.trim();
  const emoji = payload.emoji?.trim();

  if (!label || !emoji) {
    throw new Error("Gemini kondisi kosong.");
  }

  return { label, emoji };
}
