import { getAllCuratedInstitutionEntries } from "@/config/wallet-institutions";
import type { WalletType } from "@/types/wallet";

let slugByName: Map<string, string> | null = null;

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "");
}

function ensureSlugIndex(): Map<string, string> {
  if (slugByName) {
    return slugByName;
  }

  slugByName = new Map<string, string>();

  for (const entry of getAllCuratedInstitutionEntries()) {
    if (!entry.slug) {
      continue;
    }

    slugByName.set(normalizeName(entry.name), entry.slug);
    slugByName.set(normalizeName(entry.slug), entry.slug);
  }

  return slugByName;
}

function lookupByName(name: string): string | null {
  const index = ensureSlugIndex();
  const normalized = normalizeName(name);

  if (index.has(normalized)) {
    return index.get(normalized) ?? null;
  }

  for (const [label, slug] of index.entries()) {
    if (normalized.includes(label) || label.includes(normalized)) {
      return slug;
    }
  }

  return null;
}

/** Stored icon wins; otherwise match curated bank/e-wallet names. */
export function resolveWalletIconSlug(
  name: string,
  type: WalletType,
  storedIcon?: string | null,
): string | null {
  if (storedIcon) {
    return storedIcon;
  }

  if (type !== "bank" && type !== "ewallet") {
    return null;
  }

  return lookupByName(name);
}
