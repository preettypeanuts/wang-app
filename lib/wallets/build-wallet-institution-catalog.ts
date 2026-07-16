import {
  INTERNATIONAL_EWALLET_INSTITUTIONS,
  MORE_BANK_INSTITUTIONS,
  MORE_EWALLET_INSTITUTIONS,
  POPULAR_BANK_INSTITUTIONS,
  POPULAR_EWALLET_INSTITUTIONS,
  type WalletInstitutionEntry,
} from "@/config/wallet-institutions";
import {
  WALLET_INSTITUTION_ALL_BANKS,
  WALLET_INSTITUTION_ALL_EWALLETS,
  WALLET_INSTITUTION_INTERNATIONAL,
  WALLET_INSTITUTION_POPULAR_BANKS,
  WALLET_INSTITUTION_POPULAR_EWALLETS,
} from "@/config/wallet-labels";
import type { WalletType } from "@/types/wallet";

export type WalletInstitutionSectionId = "popular" | "international" | "all";

export interface WalletInstitutionOption extends WalletInstitutionEntry {
  section: WalletInstitutionSectionId;
}

export interface WalletInstitutionSection {
  id: WalletInstitutionSectionId;
  title: string;
  options: WalletInstitutionOption[];
}

function withSection(
  entries: WalletInstitutionEntry[],
  section: WalletInstitutionSectionId,
): WalletInstitutionOption[] {
  return entries.map((entry) => ({ ...entry, section }));
}

export function buildBankInstitutionSections(): WalletInstitutionSection[] {
  return [
    {
      id: "popular",
      title: WALLET_INSTITUTION_POPULAR_BANKS,
      options: withSection(POPULAR_BANK_INSTITUTIONS, "popular"),
    },
    {
      id: "all",
      title: WALLET_INSTITUTION_ALL_BANKS,
      options: withSection(MORE_BANK_INSTITUTIONS, "all"),
    },
  ];
}

export function buildEwalletInstitutionSections(): WalletInstitutionSection[] {
  return [
    {
      id: "popular",
      title: WALLET_INSTITUTION_POPULAR_EWALLETS,
      options: withSection(POPULAR_EWALLET_INSTITUTIONS, "popular"),
    },
    {
      id: "international",
      title: WALLET_INSTITUTION_INTERNATIONAL,
      options: withSection(INTERNATIONAL_EWALLET_INSTITUTIONS, "international"),
    },
    {
      id: "all",
      title: WALLET_INSTITUTION_ALL_EWALLETS,
      options: withSection(MORE_EWALLET_INSTITUTIONS, "all"),
    },
  ];
}

export function buildWalletInstitutionSections(
  type: WalletType,
): WalletInstitutionSection[] {
  if (type === "bank") {
    return buildBankInstitutionSections();
  }

  if (type === "ewallet") {
    return buildEwalletInstitutionSections();
  }

  return [];
}

export function findInstitutionOption(
  type: WalletType,
  slug: string | null,
  name: string,
): WalletInstitutionOption | null {
  const normalizedName = name.trim().toLowerCase();

  for (const section of buildWalletInstitutionSections(type)) {
    for (const option of section.options) {
      if (slug && option.slug === slug) {
        return option;
      }

      if (option.name.trim().toLowerCase() === normalizedName) {
        return option;
      }
    }
  }

  return null;
}
