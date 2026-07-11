import {
  GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS,
  GEMINI_MODEL,
} from "@/config/gemini";
import { GEMINI_WANG_APP_CONTEXT } from "@/config/gemini-locale";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import {
  computePlansProjectedBalance,
  resolvePlansInsightMeta,
} from "@/lib/finance/build-plans-overview";
import { formatIdr } from "@/lib/finance/format-currency";
import type { PlanBudgetImpact } from "@/types/plan";

interface PlansInsightInput {
  activeCount: number;
  estimatedCost: number;
  availableBalance: number;
  upcomingPayPlanTotal: number;
  upcomingIncomeTotal: number;
  remainingBudgetTotal: number;
  planNames: string[];
  riskyBudgetImpacts: PlanBudgetImpact[];
  wishNamesByCategory: Map<string, string[]>;
}

function formatRiskyBudgetLines(
  impacts: PlanBudgetImpact[],
  wishNamesByCategory: Map<string, string[]>,
): string[] {
  return impacts.map((impact) => {
    const wishNames = wishNamesByCategory.get(impact.category) ?? [];
    const wishPart =
      wishNames.length > 0 ? ` · wish: ${wishNames.join(", ")}` : "";
    const overAmount = impact.projectedSpent - impact.budgetLimit;

    if (impact.status === "over") {
      return `- ${impact.categoryLabel}: limit ${formatIdr(impact.budgetLimit)}, proyeksi terpakai ${formatIdr(impact.projectedSpent)} (over ${formatIdr(overAmount)})${wishPart}`;
    }

    const remaining = impact.budgetLimit - impact.projectedSpent;
    return `- ${impact.categoryLabel}: limit ${formatIdr(impact.budgetLimit)}, proyeksi terpakai ${formatIdr(impact.projectedSpent)} (sisa ${formatIdr(remaining)})${wishPart}`;
  });
}

export async function generatePlansInsightWithGemini(
  input: PlansInsightInput,
): Promise<string> {
  const ai = getGeminiClient();
  const projectedBalance = computePlansProjectedBalance(
    input.availableBalance,
    input.estimatedCost,
    input.upcomingPayPlanTotal,
    input.remainingBudgetTotal,
    input.upcomingIncomeTotal,
  );
  const insightMeta = resolvePlansInsightMeta(
    input.estimatedCost,
    input.availableBalance,
    input.upcomingPayPlanTotal,
    input.remainingBudgetTotal,
    input.upcomingIncomeTotal,
  );
  const names =
    input.planNames.length > 0
      ? input.planNames.slice(0, 8).join(", ")
      : "(kosong)";

  const payPlanLine =
    input.upcomingPayPlanTotal > 0
      ? `Tagihan PayPlan bulan ini: ${formatIdr(input.upcomingPayPlanTotal)}`
      : "Tagihan PayPlan bulan ini: (tidak ada)";

  const incomeLine =
    input.upcomingIncomeTotal > 0
      ? `Perkiraan pemasukan terjadwal bulan ini (belum diterima): ${formatIdr(input.upcomingIncomeTotal)}`
      : "Pemasukan terjadwal bulan ini: (tidak ada)";

  const budgetLine =
    input.remainingBudgetTotal > 0
      ? `Sisa budget PayPlan bulan ini (belum terpakai): ${formatIdr(input.remainingBudgetTotal)}`
      : "Sisa budget PayPlan bulan ini: (tidak ada)";

  const budgetLines = formatRiskyBudgetLines(
    input.riskyBudgetImpacts,
    input.wishNamesByCategory,
  );

  const prompt = [
    `Wish aktif: ${input.activeCount}`,
    `Wishlist: ${names}`,
    `Estimasi wish: ${formatIdr(input.estimatedCost)}`,
    payPlanLine,
    incomeLine,
    budgetLine,
    `Saldo tersedia: ${formatIdr(input.availableBalance)}`,
    `Proyeksi sisa setelah wish, PayPlan, pemasukan terjadwal, dan sisa budget bulan ini: ${formatIdr(projectedBalance)}`,
    `Status keamanan: ${insightMeta.label}`,
    budgetLines.length > 0
      ? ["Dampak wish ke budget kategori (waspada/over):", ...budgetLines].join(
          "\n",
        )
      : "Dampak wish ke budget kategori: (tidak ada yang waspada/over)",
    "",
    "Tulis 1-2 kalimat Bahasa Indonesia: apakah oke spend estimasi wish ini dengan saldo tersedia setelah memperhitungkan tagihan PayPlan dan sisa budget bulan ini, plus saran singkat.",
    input.upcomingPayPlanTotal > 0
      ? 'Sebut tagihan PayPlan bulan ini di insight jika relevan, misalnya: "Selain wish ini, ada tagihan PayPlan Rp1.900.000 bulan ini — proyeksi saldo akhir bulan kamu jadi Rp2.100.000."'
      : "",
    input.remainingBudgetTotal > 0
      ? 'Sebut sisa budget PayPlan bulan ini di insight jika relevan, misalnya: "Masih ada sisa budget makan Rp1.300.000 yang perlu dipakai — proyeksi sisa saldo setelah wish dan tagihan cuma Rp600.000."'
      : "",
    input.upcomingIncomeTotal > 0
      ? 'Sebut perkiraan pemasukan terjadwal bulan ini jika relevan, misalnya: "Masih ada perkiraan gaji Rp5.000.000 masuk bulan ini, jadi proyeksi saldo akhir bulan lebih lega."'
      : "",
    input.riskyBudgetImpacts.length > 0
      ? 'Sebut dampak budget kategori yang waspada/over jika relevan, misalnya: "Wish Sepatu (Belanja & Fashion) bakal bikin budget kategori itu kebobol Rp150.000 kalau jadi dibeli."'
      : "",
    insightMeta.tone === "tight" || insightMeta.tone === "unsafe"
      ? "Tekankan bahwa proyeksi sisa tipis atau berisiko — hati-hati tambah wish, tagihan, atau pengeluaran besar."
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: [
        GEMINI_WANG_APP_CONTEXT,
        "Kamu asisten keuangan Wang untuk halaman Wish (wishlist belanja).",
        "Jawab singkat, ramah, objektif, tanpa mengarang angka di luar data.",
        "Perhitungkan tagihan PayPlan bulan ini, perkiraan pemasukan terjadwal bulan ini, sisa budget PayPlan bulan ini, dan dampak wish ke budget kategori saat menilai apakah wish aman dibeli.",
        "Jangan gunakan emoji.",
      ].join("\n"),
      maxOutputTokens: GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS,
      temperature: 0.3,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Empty plans insight");
  }

  return text;
}
