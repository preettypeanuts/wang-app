import { INBOX_MESSAGE_CONTENT_INSET } from "@/config/inbox-mobile";
import { cn } from "@/lib/utils";

export function InboxChatSkeleton() {
  return (
    <div
      aria-hidden
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3",
        INBOX_MESSAGE_CONTENT_INSET,
      )}
    >
      <div className="ml-auto h-12 w-[68%] animate-pulse rounded-2xl bg-foreground/8" />
      <div className="mr-auto h-16 w-[74%] animate-pulse rounded-2xl bg-foreground/6" />
      <div className="ml-auto h-10 w-[52%] animate-pulse rounded-2xl bg-foreground/8" />
      <div className="mr-auto h-14 w-[80%] animate-pulse rounded-2xl bg-foreground/6" />
    </div>
  );
}
