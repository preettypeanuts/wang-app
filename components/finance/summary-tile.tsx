"use client";

import { CATEGORY_ICON_COMPONENTS } from "@/components/shared/category-icon-map";
import type { CategoryIconId } from "@/config/category-icons";
import type { SummaryTileIcon } from "@/config/summary-tiles";
import { SEPARATED_SURFACE } from "@/config/shape";
import { cn } from "@/lib/utils";

interface SummaryTileProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: SummaryTileIcon | CategoryIconId;
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
  const IconComponent = CATEGORY_ICON_COMPONENTS[icon];
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
