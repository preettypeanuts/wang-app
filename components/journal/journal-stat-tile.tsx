"use client";

import type { Icon } from "@phosphor-icons/react";

import { SEPARATED_SURFACE } from "@/config/shape";
import { cn } from "@/lib/utils";

interface JournalStatTileProps {
  icon: Icon;
  label: string;
  value: string;
  subtitle?: string;
  delta?: string;
  surfaceClassName: string;
  iconClassName?: string;
  labelClassName?: string;
  subtitleClassName?: string;
  deltaClassName?: string;
  valueClassName?: string;
  className?: string;
}

export function JournalStatTile({
  icon: IconComponent,
  label,
  value,
  subtitle,
  delta,
  surfaceClassName,
  iconClassName,
  labelClassName,
  subtitleClassName,
  deltaClassName,
  valueClassName,
  className,
}: JournalStatTileProps) {
  return (
    <div
      className={cn(
        surfaceClassName,
        SEPARATED_SURFACE,
        "flex min-h-22 min-w-0 flex-1 flex-col justify-between p-3",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <IconComponent
          className={cn("size-4 shrink-0", iconClassName ?? "text-foreground/70")}
          weight="duotone"
        />
        <p className={cn("text-xs font-medium", labelClassName ?? "text-foreground/75")}>
          {label}
        </p>
      </div>
      <div>
        {subtitle ? (
          <p className={cn("text-[10px]", subtitleClassName ?? "text-muted-foreground")}>
            {subtitle}
          </p>
        ) : null}
        <p
          className={cn(
            "font-semibold tabular-nums leading-tight",
            subtitle ? "mt-0.5 text-base" : "mt-1 text-base",
            valueClassName ?? "text-foreground/90",
          )}
        >
          {value}
        </p>
        {delta ? (
          <p
            className={cn(
              "mt-0.5 text-[10px] tabular-nums",
              deltaClassName ?? subtitleClassName ?? "text-muted-foreground",
            )}
          >
            {delta} vs kemarin
          </p>
        ) : null}
      </div>
    </div>
  );
}
