import {
  GENERATED_BANK_INSTITUTIONS,
  GENERATED_EWALLET_INSTITUTIONS,
  GENERATED_INTERNATIONAL_INSTITUTIONS,
} from "@/config/wallet-institution-catalog.generated";
import { GENERATED_WALLET_INSTITUTION_BRAND_COLORS } from "@/config/wallet-institution-brand-colors.generated";

export interface WalletInstitutionEntry {
  name: string;
  slug: string | null;
}

export interface WalletInstitutionBrandColor {
  primary: string;
  secondary?: string;
}

/** Curated order — shown first in picker. */
export const POPULAR_BANK_INSTITUTIONS: WalletInstitutionEntry[] = [
  { name: "BCA", slug: "bca" },
  { name: "Bank Mandiri", slug: "mandiri" },
  { name: "BRI", slug: "bri" },
  { name: "BNI", slug: "bni" },
  { name: "CIMB Niaga", slug: "cimb-niaga" },
  { name: "SeaBank", slug: "seabank" },
  { name: "Bank Jago", slug: "jago" },
  { name: "blu by BCA Digital", slug: "blu-bca" },
  { name: "Permata Bank", slug: "permata" },
  { name: "BTN", slug: "btn" },
];

export const POPULAR_EWALLET_INSTITUTIONS: WalletInstitutionEntry[] = [
  { name: "DANA", slug: "dana" },
  { name: "GoPay", slug: "gopay" },
  { name: "ShopeePay", slug: "shopee-pay" },
  { name: "OVO", slug: "ovo" },
  { name: "LinkAja", slug: "linkaja" },
  { name: "i.saku", slug: "i-saku" },
  { name: "AstraPay", slug: "astra-pay" },
  { name: "Sakuku", slug: null },
  { name: "DOKU", slug: "doku" },
  { name: "BYOND Pay", slug: "byond-bsi" },
];

export const INTERNATIONAL_EWALLET_INSTITUTIONS: WalletInstitutionEntry[] = [
  { name: "PayPal", slug: "paypal" },
  { name: "Wise", slug: "wise" },
  { name: "Alipay", slug: "alipay" },
  { name: "WeChat Pay", slug: "wechat-pay" },
  { name: "Revolut", slug: null },
  { name: "Apple Cash", slug: "apple-pay" },
  { name: "Cash App", slug: null },
  { name: "Venmo", slug: null },
  { name: "Google Wallet", slug: "google-pay" },
  { name: "Samsung Wallet", slug: "samsung-pay" },
  ...excludeInstitutionsBySlug(
    GENERATED_INTERNATIONAL_INSTITUTIONS,
    new Set([
      "paypal",
      "wise",
      "alipay",
      "wechat-pay",
      "apple-pay",
      "google-pay",
      "samsung-pay",
    ]),
  ),
];

function excludeInstitutionsBySlug(
  entries: WalletInstitutionEntry[],
  excludedSlugs: Set<string>,
): WalletInstitutionEntry[] {
  return entries.filter(
    (entry) => !entry.slug || !excludedSlugs.has(entry.slug),
  );
}

function buildMoreInstitutions(
  generated: WalletInstitutionEntry[],
  excludedSlugs: Set<string>,
): WalletInstitutionEntry[] {
  return excludeInstitutionsBySlug(generated, excludedSlugs);
}

function institutionSlugs(entries: WalletInstitutionEntry[]): Set<string> {
  return new Set(
    entries.flatMap((entry) => (entry.slug ? [entry.slug] : [])),
  );
}

const POPULAR_BANK_SLUGS = institutionSlugs(POPULAR_BANK_INSTITUTIONS);
const POPULAR_EWALLET_SLUGS = institutionSlugs(POPULAR_EWALLET_INSTITUTIONS);
const INTERNATIONAL_EWALLET_SLUGS = institutionSlugs(
  INTERNATIONAL_EWALLET_INSTITUTIONS,
);

/** Full bank catalog from local fintech logos (minus popular list). */
export const MORE_BANK_INSTITUTIONS = buildMoreInstitutions(
  GENERATED_BANK_INSTITUTIONS,
  POPULAR_BANK_SLUGS,
);

/** Full e-wallet catalog from local fintech logos (minus popular + international). */
export const MORE_EWALLET_INSTITUTIONS = buildMoreInstitutions(
  GENERATED_EWALLET_INSTITUTIONS,
  new Set([...POPULAR_EWALLET_SLUGS, ...INTERNATIONAL_EWALLET_SLUGS]),
);

export function getAllCuratedInstitutionEntries(): WalletInstitutionEntry[] {
  return [
    ...POPULAR_BANK_INSTITUTIONS,
    ...MORE_BANK_INSTITUTIONS,
    ...POPULAR_EWALLET_INSTITUTIONS,
    ...INTERNATIONAL_EWALLET_INSTITUTIONS,
    ...MORE_EWALLET_INSTITUTIONS,
  ];
}

export const WALLET_INSTITUTION_BRAND_COLORS = GENERATED_WALLET_INSTITUTION_BRAND_COLORS;

export function getWalletInstitutionBrandColor(
  slug: string | null | undefined,
): WalletInstitutionBrandColor | null {
  if (!slug) {
    return null;
  }

  return WALLET_INSTITUTION_BRAND_COLORS[slug] ?? null;
}
