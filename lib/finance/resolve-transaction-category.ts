import {
  normalizeCategory,
  resolveCategoryForType,
  type TransactionCategoryId,
} from "@/config/categories";
import { classifyTransactionCategoryWithGemini } from "@/lib/ai/classify-transaction-category-gemini";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { detectCategory } from "@/lib/finance/categories";
import { inferTransactionCategory, refineMisclassifiedCategory } from "@/lib/finance/infer-transaction-category";
import type { TransactionType } from "@/types/transaction";

function applyCategoryPipeline(
  rawCategory: string | undefined,
  type: TransactionType,
  description: string,
): TransactionCategoryId {
  let category = resolveCategoryForType(
    normalizeCategory(rawCategory ?? "other"),
    type,
  );

  if (category !== "other") {
    return category;
  }

  const detected = detectCategory(description);
  if (detected !== "other") {
    return resolveCategoryForType(detected, type);
  }

  const inferred = inferTransactionCategory(description, type);
  if (inferred && inferred !== "other") {
    return resolveCategoryForType(inferred, type);
  }

  if (type === "income") {
    return "side_income";
  }

  return "other";
}

export function resolveTransactionCategory(
  rawCategory: string | undefined,
  type: TransactionType,
  description: string,
): TransactionCategoryId {
  const category = applyCategoryPipeline(rawCategory, type, description);
  return refineMisclassifiedCategory(category, description);
}

export async function resolveTransactionCategoryAsync(
  rawCategory: string | undefined,
  type: TransactionType,
  description: string,
): Promise<TransactionCategoryId> {
  let category = applyCategoryPipeline(rawCategory, type, description);

  category = refineMisclassifiedCategory(category, description);

  if (category !== "other" || !isGeminiConfigured()) {
    return category;
  }

  try {
    const geminiCategory = await classifyTransactionCategoryWithGemini(
      description,
      type,
    );

    if (geminiCategory && geminiCategory !== "other") {
      return refineMisclassifiedCategory(geminiCategory, description);
    }
  } catch {
    // Keep pipeline result.
  }

  return category;
}
