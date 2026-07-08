import { InboxChatSkeleton } from "@/components/inbox/inbox-chat-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CHAT_INPUT_DOCK_INSET_X,
  INBOX_MESSAGE_BOTTOM_INSET,
} from "@/config/chat-input-mobile";
import {
  INBOX_CHAT_COLUMN,
  INBOX_CHAT_VIEW_ROOT,
  INBOX_DESKTOP_INPUT_DOCK_PB,
  INBOX_PAGE_ROW,
  INBOX_SUMMARY_ASIDE,
} from "@/config/inbox-desktop";
import {
  INBOX_MESSAGE_CONTENT_INSET,
  INBOX_MOBILE_PAGE,
  INBOX_MOBILE_TOP_BAR_ACTIONS,
  INBOX_MOBILE_TOP_BAR_ROW,
  INBOX_MOBILE_TOP_BAR_TITLE,
} from "@/config/inbox-mobile";
import { GLASS_SURFACE } from "@/config/glass";
import { GRID_GAP, SHELL_PADDING, STACK_GAP } from "@/config/spacing";
import { SEPARATED_SHELL } from "@/config/shape";
import { cn } from "@/lib/utils";

function InboxSummaryAsideSkeleton() {
  return (
    <aside className={INBOX_SUMMARY_ASIDE}>
      <div
        aria-hidden
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden",
          SEPARATED_SHELL,
          GLASS_SURFACE,
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto",
            SHELL_PADDING,
            STACK_GAP,
          )}
        >
          <div className="space-y-2">
            <Skeleton className="h-3 w-14" />
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className={cn("grid grid-cols-2", GRID_GAP)}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-2xl" />
            ))}
          </div>

          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </aside>
  );
}

export function InboxPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat inbox"
      className={INBOX_PAGE_ROW}
    >
      <section className={INBOX_CHAT_COLUMN}>
        <div className={cn(INBOX_MOBILE_PAGE, INBOX_CHAT_VIEW_ROOT)}>
          <div className={cn("relative shrink-0 md:hidden", INBOX_MOBILE_TOP_BAR_ROW)}>
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className={cn("mx-auto h-5 w-16", INBOX_MOBILE_TOP_BAR_TITLE)} />
            <div className={INBOX_MOBILE_TOP_BAR_ACTIONS}>
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="size-9 rounded-full" />
            </div>
          </div>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden",
              INBOX_MESSAGE_BOTTOM_INSET,
            )}
          >
            <InboxChatSkeleton />
          </div>

          <div
            className={cn(
              "shrink-0 px-3 pb-3 md:px-3",
              CHAT_INPUT_DOCK_INSET_X,
              INBOX_DESKTOP_INPUT_DOCK_PB,
            )}
          >
            <Skeleton
              className={cn(
                "h-10 w-full rounded-2xl md:min-h-9",
                INBOX_MESSAGE_CONTENT_INSET,
              )}
            />
          </div>
        </div>
      </section>

      <InboxSummaryAsideSkeleton />
    </div>
  );
}
