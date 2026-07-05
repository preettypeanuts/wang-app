import { Type } from "@google/genai";

import {
  TRANSACTION_CATEGORIES,
  buildGeminiCategoryInstruction,
  isTransactionCategory,
  normalizeCategory,
  resolveCategoryForType,
  type TransactionCategoryId,
} from "@/config/categories";
import {
  buildGeminiCategoryClassifierSystemInstruction,
  GEMINI_MONMON_APP_CONTEXT,
} from "@/config/gemini-locale";
import { GEMINI_MAX_OUTPUT_TOKENS, GEMINI_MODEL } from "@/config/gemini";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import type { TransactionType } from "@/types/transaction";

const SPECIFIC_CATEGORY_IDS = TRANSACTION_CATEGORIES.map(
  (category) => category.id,
).filter((id) => id !== "other") as TransactionCategoryId[];

const SYSTEM_INSTRUCTION = buildGeminiCategoryClassifierSystemInstruction(
  buildGeminiCategoryInstruction(),
);

function buildPrompt(description: string, type: TransactionType): string {
  return [
    GEMINI_MONMON_APP_CONTEXT,
    "",
    `Tipe transaksi: ${type}`,
    `Deskripsi user (Bahasa Indonesia): ${description}`,
    "",
    "Pilih category id paling spesifik. Pahami konteks Indonesia. Jika ragu, pilih yang paling masuk akal — bukan other.",
  ].join("\n");
}

export async function classifyTransactionCategoryWithGemini(
  description: string,
  type: TransactionType,
): Promise<TransactionCategoryId | null> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(description, type),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: [...SPECIFIC_CATEGORY_IDS] },
          confidence: {
            type: Type.STRING,
            enum: ["high", "medium", "low"],
          },
        },
        required: ["category", "confidence"],
      },
    },
  });

  const raw = response.text?.trim();
  if (!raw) {
    return null;
  }

  try {
    const payload = JSON.parse(raw) as { category?: string };
    const category = normalizeCategory(payload.category ?? "other");

    if (!isTransactionCategory(category) || category === "other") {
      return null;
    }

    return resolveCategoryForType(category, type);
  } catch {
    return null;
  }
}
