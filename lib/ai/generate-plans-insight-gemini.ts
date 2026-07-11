import {
  GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS,
  GEMINI_MODEL,
} from "@/config/gemini";
import { GEMINI_WANG_APP_CONTEXT } from "@/config/gemini-locale";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import {
  computePlansSpendableBalance,
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
  nextMonthPayPlanTotal: number;
  remainingBudgetNextMonth: number;
  salaryCycleProjection: number | null;
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
  const spendableBalance = computePlansSpendableBalance(
    input.availableBalance,
    input.estimatedCost,
    input.upcomingPayPlanTotal,
    input.remainingBudgetTotal,
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
      ? `Gaji/pemasukan terjadwal bulan ini (belum diterima, untuk tagihan bulan depan): ${formatIdr(input.upcomingIncomeTotal)}`
      : "Pemasukan terjadwal bulan ini: (tidak ada)";

  const nextMonthPayPlanLine =
    input.nextMonthPayPlanTotal > 0
      ? `Tagihan PayPlan bulan depan: ${formatIdr(input.nextMonthPayPlanTotal)}`
      : "Tagihan PayPlan bulan depan: (tidak ada)";

  const budgetLine =
    input.remainingBudgetTotal > 0
      ? `Sisa budget PayPlan bulan ini (belum terpakai): ${formatIdr(input.remainingBudgetTotal)}`
      : "Sisa budget PayPlan bulan ini: (tidak ada)";

  const nextMonthBudgetLine =
    input.remainingBudgetNextMonth > 0
      ? `Sisa budget PayPlan bulan depan (belum terpakai): ${formatIdr(input.remainingBudgetNextMonth)}`
      : "Sisa budget PayPlan bulan depan: (tidak ada)";

  const budgetLines = formatRiskyBudgetLines(
    input.riskyBudgetImpacts,
    input.wishNamesByCategory,
  );

  const salaryCycleLine =
    input.salaryCycleProjection !== null
      ? `Proyeksi setelah gaji masuk dan sisihkan tagihan/budget bulan depan: ${formatIdr(input.salaryCycleProjection)}`
      : "";

  const prompt = [
    `Wish aktif: ${input.activeCount}`,
    `Wishlist: ${names}`,
    `Estimasi wish: ${formatIdr(input.estimatedCost)}`,
    payPlanLine,
    incomeLine,
    nextMonthPayPlanLine,
    budgetLine,
    nextMonthBudgetLine,
    `Saldo tersedia (cash sekarang): ${formatIdr(input.availableBalance)}`,
    `Sisa setelah wish, PayPlan, dan sisa budget bulan ini (tanpa gaji belum diterima): ${formatIdr(spendableBalance)}`,
    salaryCycleLine,
    `Status keamanan belanja wish sekarang: ${insightMeta.label}`,
    budgetLines.length > 0
      ? ["Dampak wish ke budget kategori (waspada/over):", ...budgetLines].join(
          "\n",
        )
      : "Dampak wish ke budget kategori: (tidak ada yang waspada/over)",
    "",
    'Tulis MAKSIMAL 1 kalimat pendek (maks 20 kata), fokus HANYA ke kesimpulan dan 1 saran aksi konkret. JANGAN sebutkan ulang angka estimasi wish, tagihan PayPlan, sisa budget, atau proyeksi satu-satu — angka detail itu sudah ditampilkan terpisah di UI. Contoh gaya: "Belum aman, kurang Rp114.763 — tunda salah satu wish dulu." atau "Aman, masih ada ruang Rp2.100.000."',
    input.upcomingIncomeTotal > 0
      ? "Kalau ada gaji terjadwal belum diterima, cukup tegaskan belum bisa dipakai sekarang — tanpa sebut nominal gaji."
      : "",
    insightMeta.tone === "tight" || insightMeta.tone === "unsafe"
      ? "Tekankan risiko atau sisa tipis — jangan bilang aman hanya karena gaji belum diterima."
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
        "Tulis maksimal 1 kalimat pendek: kesimpulan + 1 saran aksi. Jangan ulangi breakdown angka — UI sudah menampilkannya.",
        "Nilai keamanan wish berdasarkan saldo cash sekarang. Gaji belum diterima tidak membuat wish aman dibeli sekarang.",
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
