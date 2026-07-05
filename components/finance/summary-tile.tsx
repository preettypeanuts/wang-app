"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CarIcon,
  CoinsIcon,
  DotsThreeIcon,
  ForkKnifeIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  WalletIcon,
  type Icon,
} from "@phosphor-icons/react";

import type { SummaryTileIcon } from "@/config/summary-tiles";
import { SEPARATED_SURFACE } from "@/config/shape";
import { cn } from "@/lib/utils";

const TILE_ICONS: Record<SummaryTileIcon, Icon> = {
  "arrow-down": ArrowDownIcon,
  "arrow-up": ArrowUpIcon,
  wallet: WalletIcon,
  "fork-knife": ForkKnifeIcon,
  car: CarIcon,
  "shopping-bag": ShoppingBagIcon,
  receipt: ReceiptIcon,
  "dots-three": DotsThreeIcon,
  coins: CoinsIcon,
};

interface SummaryTileProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: SummaryTileIcon;
  surfaceClassName: string;
  iconClassName: string;
  labelClassName?: string;
  valueClassName?: string;
  subtitleClassName?: string;
  variant?: "default" | "compact";
  className?: string;
}

export function SummaryTile({
  label,
  value,
  subtitle,
  icon,
  surfaceClassName,
  iconClassName,
  labelClassName,
  valueClassName,
  subtitleClassName,
  variant = "default",
  className,
}: SummaryTileProps) {
  const IconComponent = TILE_ICONS[icon];
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        surfaceClassName,
        SEPARATED_SURFACE,
        isCompact
          ? "flex min-h-10 flex-row items-center gap-2.5 px-2.5 py-2"
          : "flex aspect-5/4 min-h-22 flex-col justify-between p-3",
        className,
      )}
    >
      <IconComponent
        className={cn(
          "shrink-0",
          iconClassName,
          isCompact ? "size-4" : "size-5",
        )}
        weight="duotone"
      />
      <div className={cn("min-w-0", isCompact && "flex-1")}>
        <p
          className={cn(
            "truncate font-semibold leading-tight",
            labelClassName ?? "text-foreground/90",
            isCompact ? "text-xs" : "text-sm",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 truncate font-medium",
            valueClassName ?? "text-foreground/75",
            isCompact ? "text-[11px]" : "text-xs",
          )}
        >
          {value}
        </p>
        {subtitle ? (
          <p
            className={cn(
              "mt-0.5 truncate text-[11px]",
              subtitleClassName ?? "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
