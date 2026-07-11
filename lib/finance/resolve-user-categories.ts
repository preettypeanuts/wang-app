import "server-only";

import { unstable_cache } from "next/cache";

import { userDataTags } from "@/lib/cache/user-data-tags";
import { listUserCategoriesForUser } from "@/lib/db/user-categories";
import {
  mergeUserCategoryCatalog,
} from "@/lib/finance/user-category-catalog";
import type { ResolvedCategory, UserCategoryRecord } from "@/types/user-category";

export {
  buildCategoryMentionOptionsFromCatalog,
  getCategoryLabelFromCatalog,
  getExpenseCategoriesFromCatalog,
  isCategoryInCatalog,
  isExpenseCategoryId,
  mergeUserCategoryCatalog,
  parseCategoryIcon,
  resolveCategoryForTransaction,
} from "@/lib/finance/user-category-catalog";

function getCachedUserCategoryRecords(
  userId: string,
): Promise<UserCategoryRecord[]> {
  return unstable_cache(
    () => listUserCategoriesForUser(userId),
    [`user-category-records-${userId}`],
    {
      tags: [userDataTags.categories(userId)],
    },
  )();
}

export async function resolveUserCategoryCatalog(
  userId: string,
): Promise<ResolvedCategory[]> {
  const overrides = await getCachedUserCategoryRecords(userId);
  return mergeUserCategoryCatalog(overrides);
}

export function getCachedUserCategoryCatalog(userId: string) {
  return resolveUserCategoryCatalog(userId);
}
