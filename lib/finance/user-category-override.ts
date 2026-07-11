import {
  isTransactionCategory,
  normalizeCategory,
  type TransactionCategoryId,
} from "@/config/categories";
import { extractCategoryKeyword } from "@/lib/finance/extract-category-keyword";
import { prisma } from "@/lib/db/prisma";
import type { TransactionType } from "@/types/transaction";

export async function saveUserCategoryOverride(
  userId: string,
  description: string,
  type: TransactionType,
  category: string,
): Promise<void> {
  const keyword = extractCategoryKeyword(description);
  if (!keyword) {
    return;
  }

  await prisma.userCategoryOverride.upsert({
    where: {
      userId_keyword_type: {
        userId,
        keyword,
        type,
      },
    },
    create: {
      userId,
      keyword,
      type,
      category,
    },
    update: {
      category,
    },
  });
}

export async function findUserCategoryOverride(
  userId: string,
  description: string,
  type: TransactionType,
): Promise<TransactionCategoryId | null> {
  const overrides = await prisma.userCategoryOverride.findMany({
    where: { userId, type },
  });

  const lowerDescription = description.toLowerCase();
  let best: { keyword: string; category: TransactionCategoryId } | null = null;

  for (const row of overrides) {
    if (!lowerDescription.includes(row.keyword.toLowerCase())) {
      continue;
    }

    const category = normalizeCategory(row.category);
    if (!isTransactionCategory(category)) {
      continue;
    }

    if (!best || row.keyword.length > best.keyword.length) {
      best = { keyword: row.keyword, category };
    }
  }

  return best?.category ?? null;
}
