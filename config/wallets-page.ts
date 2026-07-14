import {
  JOURNAL_MOBILE_SOLID_DIVIDER,
  JOURNAL_MOBILE_SOLID_SURFACE,
} from "@/config/journal-mobile";
import { OVERVIEW_CARD, OVERVIEW_CARD_PADDING } from "@/config/overview";
import { PLANS_MOBILE_SOLID_CARD } from "@/config/plans";

/** Wallet list shell — glass on desktop, solid muted on mobile (same as Wish/Journal). */
export const WALLETS_LIST_CARD = [
  OVERVIEW_CARD,
  JOURNAL_MOBILE_SOLID_SURFACE,
  PLANS_MOBILE_SOLID_CARD,
].join(" ");

export const WALLETS_LIST_PADDING = OVERVIEW_CARD_PADDING;

/** Hide inner hairlines inside solid mobile card. */
export const WALLETS_LIST_DIVIDER = JOURNAL_MOBILE_SOLID_DIVIDER;
