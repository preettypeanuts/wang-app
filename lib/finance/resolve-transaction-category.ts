import {
  normalizeCategory,
  resolveCategoryForType,
  type TransactionCategoryId,
} from "@/config/categories";
import { classifyTransactionCategoryWithGemini } from "@/lib/ai/classify-transaction-category-gemini";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { detectCategory } from "@/lib/finance/categories";
import {
  inferTransactionCategory,
  refineMisclassifiedCategory,
} from "@/lib/finance/infer-transaction-category";
import { findUserCategoryOverride } from "@/lib/finance/user-category-override";
import type { FlowTransactionType } from "@/types/transaction";

async function applyCategoryPipeline(
  userId: string | undefined,
  rawCategory: string | undefined,
  type: FlowTransactionType,
  description: string,
): Promise<string> {
  if (userId) {
    const override = await findUserCategoryOverride(userId, description, type);
    if (override) {
      if (override.startsWith("custom_")) {
        return override;
      }

      return resolveCategoryForType(
        override as TransactionCategoryId,
        type,
      );
    }
  }

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

export async function resolveTransactionCategory(
  rawCategory: string | undefined,
  type: FlowTransactionType,
  description: string,
  userId?: string,
): Promise<string> {
  const category = await applyCategoryPipeline(
    userId,
    rawCategory,
    type,
    description,
  );

  if (category.startsWith("custom_")) {
    return category;
  }

  return refineMisclassifiedCategory(
    category as TransactionCategoryId,
    description,
  );
}

export async function resolveTransactionCategoryAsync(
  rawCategory: string | undefined,
  type: FlowTransactionType,
  description: string,
  userId?: string,
): Promise<string> {
  let category = await applyCategoryPipeline(
    userId,
    rawCategory,
    type,
    description,
  );

  if (!category.startsWith("custom_")) {
    category = refineMisclassifiedCategory(
      category as TransactionCategoryId,
      description,
    );
  }

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
