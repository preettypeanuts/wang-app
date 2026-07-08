"use client";

import { PencilSimpleIcon } from "@/lib/icons";

import { Button } from "@/components/ui/button";
import { SEPARATED_CONTROL } from "@/config/shape";
import { cn } from "@/lib/utils";

interface ChatReceiptEditButtonProps {
  disabled?: boolean;
  onEdit: () => void;
}

export function ChatReceiptEditButton({
  disabled = false,
  onEdit,
}: ChatReceiptEditButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label="Perbaiki struk"
      disabled={disabled}
      onClick={onEdit}
      className={cn(
        SEPARATED_CONTROL,
        "size-7 shrink-0 bg-background/90 text-foreground shadow-sm ring-1 ring-border/60",
      )}
    >
      <PencilSimpleIcon className="size-4" />
    </Button>
  );
}
