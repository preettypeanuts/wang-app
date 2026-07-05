import { GLASS_SURFACE, GLASS_TILE_BASE } from "@/config/glass";
import { formatChatTimestamp } from "@/lib/finance/format-datetime";
import { cn } from "@/lib/utils";
import type { MessageRole } from "@/types/chat";

interface MessageTimestampProps {
  createdAt: string;
  role: MessageRole;
  className?: string;
}

export function MessageTimestamp({
  createdAt,
  role,
  className,
}: MessageTimestampProps) {
  const isUser = role === "user";

  return (
    <time
      dateTime={createdAt}
      className={cn(
        "px-1 text-[11px] leading-none text-muted-foreground/80 rounded-full",
        isUser ? "text-right" : "text-left",
        GLASS_TILE_BASE + " " + GLASS_SURFACE,
        className,
      )}
    >
      {formatChatTimestamp(createdAt)}
    </time>
  );
}
