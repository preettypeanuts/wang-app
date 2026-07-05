"use client";

import { ArrowClockwiseIcon } from "@/lib/icons";

import { Button } from "@/components/ui/button";
import { SEPARATED_CONTROL } from "@/config/shape";
import { cn } from "@/lib/utils";
import { GLASS_BACKDROP, GLASS_TILE_BASE, GLASS_BORDER } from "@/config/glass";

interface ChatMessageRetryButtonProps {
  onRetry: () => void;
  disabled?: boolean;
  className?: string;
}

export function ChatMessageRetryButton({
  onRetry,
  disabled = false,
  className,
}: ChatMessageRetryButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onRetry}
      className={cn(SEPARATED_CONTROL, GLASS_TILE_BASE, GLASS_BACKDROP, GLASS_BORDER, "gap-1.5", className)}
    >
      <ArrowClockwiseIcon className="size-3.5" />
      Kirim ulang
    </Button>
  );
}
