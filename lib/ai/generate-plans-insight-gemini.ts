import {
  GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS,
  GEMINI_MODEL,
} from "@/config/gemini";
import { GEMINI_WANG_APP_CONTEXT } from "@/config/gemini-locale";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import { formatIdr } from "@/lib/finance/format-currency";
import type { PlanBudgetImpact } from "@/types/plan";

interface PlansInsightInput {
  activeCount: number;
  estimatedCost: number;
  availableBalance: number;
  upcomingPayPlanTotal: number;
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
  const projectedBalance =
    input.availableBalance - input.estimatedCost - input.upcomingPayPlanTotal;
  const names =
    input.planNames.length > 0
      ? input.planNames.slice(0, 8).join(", ")
      : "(kosong)";

  const payPlanLine =
    input.upcomingPayPlanTotal > 0
      ? `Tagihan PayPlan bulan ini: ${formatIdr(input.upcomingPayPlanTotal)}`
      : "Tagihan PayPlan bulan ini: (tidak ada)";

  const budgetLines = formatRiskyBudgetLines(
    input.riskyBudgetImpacts,
    input.wishNamesByCategory,
  );

  const prompt = [
    `Wish aktif: ${input.activeCount}`,
    `Wishlist: ${names}`,
    `Estimasi wish: ${formatIdr(input.estimatedCost)}`,
    payPlanLine,
    `Saldo tersedia: ${formatIdr(input.availableBalance)}`,
    `Proyeksi sisa setelah wish dan PayPlan bulan ini: ${formatIdr(projectedBalance)}`,
    budgetLines.length > 0
      ? ["Dampak wish ke budget kategori (waspada/over):", ...budgetLines].join(
          "\n",
        )
      : "Dampak wish ke budget kategori: (tidak ada yang waspada/over)",
    "",
    "Tulis 1-2 kalimat Bahasa Indonesia: apakah oke spend estimasi wish ini dengan saldo tersedia setelah memperhitungkan tagihan PayPlan bulan ini, plus saran singkat.",
    input.upcomingPayPlanTotal > 0
      ? 'Sebut tagihan PayPlan bulan ini di insight jika relevan, misalnya: "Selain wish ini, ada tagihan PayPlan Rp1.900.000 bulan ini — proyeksi saldo akhir bulan kamu jadi Rp2.100.000."'
      : "",
    input.riskyBudgetImpacts.length > 0
      ? 'Sebut dampak budget kategori yang waspada/over jika relevan, misalnya: "Wish Sepatu (Belanja & Fashion) bakal bikin budget kategori itu kebobol Rp150.000 kalau jadi dibeli."'
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
        "Perhitungkan tagihan PayPlan bulan ini dan dampak wish ke budget kategori saat menilai apakah wish aman dibeli.",
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
