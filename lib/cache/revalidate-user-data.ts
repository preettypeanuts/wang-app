import { revalidateTag } from "next/cache";

import { userDataTags } from "@/lib/cache/user-data-tags";

/** Immediate purge for user-scoped data cache tags (Next.js 16 cache profile). */
const IMMEDIATE_TAG_PROFILE = { expire: 0 } as const;

function purgeTag(tag: string) {
  revalidateTag(tag, IMMEDIATE_TAG_PROFILE);
}

export function revalidateUserTransactions(userId: string) {
  purgeTag(userDataTags.transactions(userId));
}

export function revalidateUserPlans(userId: string) {
  purgeTag(userDataTags.plans(userId));
}

export function revalidateUserSavings(userId: string) {
  purgeTag(userDataTags.savings(userId));
}

export function revalidateUserPlannedItems(userId: string) {
  purgeTag(userDataTags.plannedItems(userId));
}

export function revalidateUserBudgets(userId: string) {
  purgeTag(userDataTags.budgets(userId));
}

export function revalidateUserInbox(userId: string) {
  purgeTag(userDataTags.inbox(userId));
}

/** Transaction writes also affect balance, journal, overview, inbox summary, budget spent. */
export function revalidateAfterTransactionMutation(userId: string) {
  revalidateUserTransactions(userId);
  revalidateUserInbox(userId);
  revalidateUserBudgets(userId);
}
