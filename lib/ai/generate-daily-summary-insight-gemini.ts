import { Type } from "@google/genai";

import { getCategoryLabel } from "@/config/categories";
import { GEMINI_MONMON_APP_CONTEXT } from "@/config/gemini-locale";
import {
  GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS,
  GEMINI_MODEL,
} from "@/config/gemini";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { formatJournalDate } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import type { FinanceCondition } from "@/types/summary";

const CONDITION_LABELS = ["Aman", "Stabil", "Waspada", "Boros", "Kritis"] as const;

interface DailySummaryTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

const SYSTEM_INSTRUCTION = `${GEMINI_MONMON_APP_CONTEXT}

Kamu analis keuangan Monmon. Berikan refleksi singkat (2-3 kalimat) tentang aktivitas keuangan user kemarin berdasarkan data transaksi.
Bahasa Indonesia, nada ramah dan objektif, tanpa menghakimi.
Sebut apakah pola pengeluaran/pemasukan terlihat wajar, boros, atau hemat RELATIF terhadap data yang diberikan.
Berikan satu saran praktis spesifik jika relevan.
Jangan mengarang transaksi atau nominal di luar data.

Berikan juga penilaian kondisi keuangan (label + emoji cuaca/mood) yang mencerminkan kesehatan keuangan hari itu.
Label harus salah satu: Aman, Stabil, Waspada, Boros, atau Kritis.`;

function buildPrompt(
  date: Date,
  transactions: DailySummaryTransaction[],
): string {
  const summary = buildTodaySummary(transactions);
  const dateLabel = formatJournalDate(date);

  const lines = [
    `Tanggal: ${dateLabel}`,
    `Pemasukan: ${formatIdr(summary.totalIncome)}`,
    `Pengeluaran: ${formatIdr(summary.totalExpense)}`,
    `Saldo: ${formatIdr(summary.balance)}`,
    `Jumlah transaksi: ${transactions.length}`,
  ];

  if (summary.categories.length > 0) {
    lines.push("", "Pengeluaran per kategori:");

    for (const category of summary.categories) {
      lines.push(
        `- ${category.label}: ${formatIdr(category.total)} (${category.count}x)`,
      );
    }
  }

  if (transactions.length > 0) {
    lines.push("", "Detail transaksi:");

    for (const transaction of transactions.slice(0, 20)) {
      lines.push(
        `- [${transaction.type}] ${getCategoryLabel(transaction.category)} ${formatIdr(transaction.amount)} — ${transaction.description}`,
      );
    }

    if (transactions.length > 20) {
      lines.push(`... dan ${transactions.length - 20} transaksi lainnya`);
    }
  }

  return lines.join("\n");
}

export async function generateDailySummaryInsightWithGemini(
  date: Date,
  transactions: DailySummaryTransaction[],
): Promise<{ insight: string; condition: FinanceCondition }> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(date, transactions),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      maxOutputTokens: GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS,
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insight: { type: Type.STRING },
          label: { type: Type.STRING, enum: [...CONDITION_LABELS] },
          emoji: { type: Type.STRING },
        },
        required: ["insight", "label", "emoji"],
      },
    },
  });

  const raw = response.text?.trim();

  if (!raw) {
    throw new Error("Gemini tidak memberi respons insight.");
  }

  const payload = JSON.parse(raw) as {
    insight?: string;
    label?: string;
    emoji?: string;
  };
  const insight = payload.insight?.trim();
  const label = payload.label?.trim();
  const emoji = payload.emoji?.trim();

  if (!insight || !label || !emoji) {
    throw new Error("Gemini insight kosong.");
  }

  return {
    insight,
    condition: { label, emoji },
  };
}
