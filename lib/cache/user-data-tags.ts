/** Per-user cache tags for unstable_cache / revalidateTag. */
export const userDataTags = {
  transactions: (userId: string) => `user-${userId}-transactions`,
  plans: (userId: string) => `user-${userId}-plans`,
  savings: (userId: string) => `user-${userId}-savings`,
  plannedItems: (userId: string) => `user-${userId}-planned-items`,
  budgets: (userId: string) => `user-${userId}-budgets`,
  inbox: (userId: string) => `user-${userId}-inbox`,
  categories: (userId: string) => `user-${userId}-categories`,
  wallets: (userId: string) => `user-${userId}-wallets`,
} as const;
