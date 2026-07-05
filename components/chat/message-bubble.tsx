import { CHAT_BUBBLE_STYLES } from "@/config/chat-bubbles";
import { SEPARATED_SURFACE } from "@/config/shape";
import { cn } from "@/lib/utils";
import type { MessageRole } from "@/types/chat";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  className?: string;
}

export function MessageBubble({
  role,
  content,
  className,
}: MessageBubbleProps) {
  const bubbleStyle = CHAT_BUBBLE_STYLES[role];

  return (
    <div
      className={cn(
        "max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
        SEPARATED_SURFACE,
        bubbleStyle.surface,
        bubbleStyle.text,
        className,
      )}
    >
      {content}
    </div>
  );
}
