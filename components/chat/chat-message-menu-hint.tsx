"use client";

import { Button } from "@/components/ui/button";
import { INBOX_EDIT_HINT_TEXT } from "@/config/inbox-edit-hint";
import { XIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ChatMessageMenuHintProps {
  onDismiss: () => void;
  className?: string;
}

export function ChatMessageMenuHint({
  onDismiss,
  className,
}: ChatMessageMenuHintProps) {
  return (
    <div
      role="status"
      className={cn(
        "relative mb-1.5 flex max-w-[min(85%,16rem)] items-start gap-2",
        "rounded-2xl bg-foreground px-3 py-2 text-xs text-background shadow-md",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className,
      )}
    >
      <p className="min-w-0 flex-1 leading-snug">{INBOX_EDIT_HINT_TEXT}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Tutup petunjuk"
        onClick={onDismiss}
        className="size-6 shrink-0 text-background/80 hover:bg-background/15 hover:text-background"
      >
        <XIcon className="size-3.5" aria-hidden />
      </Button>
      <span
        aria-hidden
        className="absolute -bottom-1.5 left-5 size-2.5 rotate-45 bg-foreground"
      />
    </div>
  );
}
