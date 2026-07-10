import { Type } from "@google/genai";

import { getCategoryLabel } from "@/config/categories";
import {
  GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS,
  GEMINI_MODEL,
} from "@/config/gemini";
import { GEMINI_WANG_APP_CONTEXT } from "@/config/gemini-locale";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { formatIdr } from "@/lib/finance/format-currency";
import {
  type DailySummaryReflectionContext,
  formatDailySummaryReflectionContextForPrompt,
} from "@/lib/finance/format-daily-summary-reflection-context";
import { formatJournalDate } from "@/lib/finance/format-datetime";
import type { FinanceCondition } from "@/types/summary";

const CONDITION_LABELS = [
  "Aman",
  "Stabil",
  "Waspada",
  "Boros",
  "Kritis",
] as const;

interface DailySummaryTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

const SYSTEM_INSTRUCTION = `${GEMINI_WANG_APP_CONTEXT}

Kamu analis keuangan Wang. Berikan refleksi harian yang JELAS dan mudah dipahami (3-4 kalimat) tentang kondisi keuangan user kemarin.

Struktur refleksi:
1. Ringkas kondisi hari itu — pemasukan vs pengeluaran, saldo hari, dan apakah arus kas hari itu sehat atau tidak.
2. Jika ada data budget kategori (terutama budget harian seperti makan/minum): jelaskan secara eksplisit apakah pengeluaran hari itu masih oke, mendekati limit, atau sudah melebihi budget — sertakan angka konkret.
3. Sorot kategori pengeluaran terbesar atau pola yang menonjol jika relevan.
4. Satu saran praktis spesifik berdasarkan data (bukan saran umum).

Bahasa Indonesia, nada ramah dan objektif, tanpa menghakimi.
Gunakan data budget dan saldo kumulatif yang disediakan untuk menilai kondisi — jangan mengarang transaksi, nominal, atau budget di luar data.
Jangan gunakan emoji dalam teks insight.

Berikan juga penilaian kondisi keuangan (label saja) yang mencerminkan kesehatan keuangan hari itu.
Pertimbangkan: rasio pengeluaran vs pemasukan, pelanggaran budget harian, dan saldo kumulatif.
Label harus salah satu: Aman, Stabil, Waspada, Boros, atau Kritis.`;

function buildPrompt(
  date: Date,
  transactions: DailySummaryTransaction[],
  context: DailySummaryReflectionContext,
): string {
  const summary = buildTodaySummary(transactions);
  const dateLabel = formatJournalDate(date);

  const lines = [
    `Tanggal: ${dateLabel}`,
    `Pemasukan: ${formatIdr(summary.totalIncome)}`,
    `Pengeluaran: ${formatIdr(summary.totalExpense)}`,
    `Saldo hari ini: ${formatIdr(summary.balance)}`,
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

  lines.push("", formatDailySummaryReflectionContextForPrompt(context));

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
  context: DailySummaryReflectionContext,
): Promise<{ insight: string; condition: FinanceCondition }> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(date, transactions, context),
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
        },
        required: ["insight", "label"],
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
  };
  const insight = payload.insight?.trim();
  const label = payload.label?.trim();

  if (!insight || !label) {
    throw new Error("Gemini insight kosong.");
  }

  return {
    insight,
    condition: { label },
  };
}
