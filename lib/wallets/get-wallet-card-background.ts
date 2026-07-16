import type { CSSProperties } from "react";

import {
  getWalletInstitutionBrandColor,
} from "@/config/wallet-institutions";
import { WALLET_GRADIENT_BY_TYPE } from "@/config/wallets-stack";
import { buildBrandGradient } from "@/lib/wallets/hex-color";
import type { WalletType } from "@/types/wallet";

export interface WalletCardBackground {
  className?: string;
  style?: CSSProperties;
}

export function getWalletCardBackground(
  slug: string | null,
  type: WalletType,
): WalletCardBackground {
  const brand = getWalletInstitutionBrandColor(slug);

  if (brand) {
    return {
      style: {
        background: buildBrandGradient(brand.primary, brand.secondary),
      },
    };
  }

  return {
    className: WALLET_GRADIENT_BY_TYPE[type],
  };
}
