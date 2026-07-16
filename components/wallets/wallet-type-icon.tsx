"use client";

import { WalletInstitutionLogo } from "@/components/wallets/wallet-institution-logo";
import { OverviewIconShell } from "@/components/overview/overview-icon-shell";
import type { OverviewIconVariant } from "@/config/overview";
import {
  BuildingIcon,
  CurrencyCircleDollarIcon,
  type Icon,
  SmartphoneIcon,
  WalletIcon,
} from "@/lib/icons";
import { resolveWalletIconSlug } from "@/lib/wallets/resolve-wallet-icon-slug";
import type { WalletType } from "@/types/wallet";

const WALLET_TYPE_ICONS: Record<WalletType, Icon> = {
  cash: CurrencyCircleDollarIcon,
  bank: BuildingIcon,
  ewallet: SmartphoneIcon,
  other: WalletIcon,
};

const WALLET_TYPE_VARIANTS: Record<WalletType, OverviewIconVariant> = {
  cash: "green",
  bank: "blue",
  ewallet: "purple",
  other: "neutral",
};

interface WalletTypeIconProps {
  type: WalletType;
  name?: string;
  iconSlug?: string | null;
  size?: "md" | "lg";
}

export function WalletTypeIcon({
  type,
  name = "",
  iconSlug = null,
  size = "md",
}: WalletTypeIconProps) {
  const logoSize = size === "lg" ? 28 : 22;
  const resolvedSlug = resolveWalletIconSlug(name, type, iconSlug);

  if (resolvedSlug) {
    return (
      <OverviewIconShell variant={WALLET_TYPE_VARIANTS[type]} size={size}>
        <WalletInstitutionLogo
          slug={resolvedSlug}
          name={name}
          size={logoSize}
        />
      </OverviewIconShell>
    );
  }

  const IconComponent = WALLET_TYPE_ICONS[type];

  return (
    <OverviewIconShell variant={WALLET_TYPE_VARIANTS[type]} size={size}>
      <IconComponent />
    </OverviewIconShell>
  );
}
