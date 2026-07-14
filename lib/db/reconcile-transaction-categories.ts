import "server-only";

import { isTransactionCategory } from "@/config/categories";
import { revalidateAfterTransactionMutation } from "@/lib/cache/revalidate-user-data";
import { prisma } from "@/lib/db/prisma";
import { listUserCategoriesForUser } from "@/lib/db/user-categories";
import { resolveUserCategoryCatalog } from "@/lib/finance/resolve-user-categories";

function isStoredCategorySlug(value: string): boolean {
  const trimmed = value.trim();
  return isTransactionCategory(trimmed) || trimmed.startsWith("custom_");
}

/** Align legacy transaction.category values with the user's current category catalog. */
export async function reconcileStaleTransactionCategories(
  userId: string,
): Promise<number> {
  const [catalog, userRecords, keywordOverrides, transactions] =
    await Promise.all([
      resolveUserCategoryCatalog(userId),
      listUserCategoriesForUser(userId),
      prisma.userCategoryOverride.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: { in: ["income", "expense"] },
        },
        select: {
          id: true,
          category: true,
          type: true,
          description: true,
          rawInput: true,
        },
      }),
    ]);

  const labelToSlug = new Map<string, string>();
  for (const entry of catalog) {
    labelToSlug.set(entry.label.trim().toLowerCase(), entry.id);
  }
  for (const record of userRecords) {
    labelToSlug.set(record.label.trim().toLowerCase(), record.slug);
  }

  const updates = new Map<string, string>();

  for (const transaction of transactions) {
    const storedCategory = transaction.category.trim();

    if (isStoredCategorySlug(storedCategory)) {
      continue;
    }

    const mapped = labelToSlug.get(storedCategory.toLowerCase());
    if (mapped) {
      updates.set(transaction.id, mapped);
    }
  }

  for (const override of keywordOverrides) {
    const target = override.category.trim();
    if (!isStoredCategorySlug(target)) {
      continue;
    }

    const keyword = override.keyword.trim().toLowerCase();
    if (!keyword) {
      continue;
    }

    for (const transaction of transactions) {
      if (transaction.type !== override.type) {
        continue;
      }

      if (transaction.category.trim() !== "other") {
        continue;
      }

      const haystack = `${transaction.description} ${transaction.rawInput}`.toLowerCase();
      if (!haystack.includes(keyword)) {
        continue;
      }

      updates.set(transaction.id, target);
    }
  }

  if (updates.size === 0) {
    return 0;
  }

  await prisma.$transaction(
    [...updates.entries()].map(([id, category]) =>
      prisma.transaction.update({
        where: { id },
        data: { category },
      }),
    ),
  );

  revalidateAfterTransactionMutation(userId);
  return updates.size;
}
