"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { ChatMessageMenu } from "@/components/chat/chat-message-menu";
import { ChatMessageMenuHint } from "@/components/chat/chat-message-menu-hint";
import { ChatMessageRetryButton } from "@/components/chat/chat-message-retry-button";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageTimestamp } from "@/components/chat/message-timestamp";
import { TransactionPreview } from "@/components/chat/transaction-preview";
import { TransactionQuickCorrect } from "@/components/chat/transaction-quick-correct";
import { RecurringSuggestionPrompt } from "@/components/chat/recurring-suggestion-prompt";
import { MobilePageTitle } from "@/components/shared/mobile-page-title";
import { useSyncMobileScrollChrome } from "@/components/shared/mobile-scroll-chrome-provider";
import { useSyncMobileTopBlur } from "@/components/shared/mobile-top-blur-provider";
import { usePersistentTabActive } from "@/components/shared/persistent-tab-active-context";
import type { TransactionCategoryId } from "@/config/categories";
import {
  CHAT_MESSAGE_INSET_BOTTOM,
  CHAT_MESSAGE_INSET_TOP,
  CHAT_MESSAGE_INSET_X,
  INBOX_MESSAGE_SCROLL_AREA,
} from "@/config/chat-layout";
import {
  INBOX_DESKTOP_MESSAGE_PB,
  INBOX_DESKTOP_MESSAGE_PT,
  INBOX_DESKTOP_MESSAGE_SCROLL_PADDING,
} from "@/config/inbox-desktop";
import { INBOX_LOAD_OLDER_SCROLL_THRESHOLD } from "@/config/inbox-messages";
import { INBOX_MESSAGE_CONTENT_INSET } from "@/config/inbox-mobile";
import { MOBILE_CHROME_SCROLL_INSET_TOP } from "@/config/mobile-chrome";
import { STACK_GAP } from "@/config/spacing";
import { useMobileLargeTitleScroll } from "@/hooks/use-mobile-large-title-scroll";
import { findInboxEditHintTargetIndex } from "@/lib/chat/find-inbox-edit-hint-target";
import { getInboxRetryContext } from "@/lib/chat/inbox-error";
import { canManageSentUserMessage } from "@/lib/chat/inbox-message-actions";
import { isLowConfidenceTransaction } from "@/lib/chat/low-confidence-transaction";
import {
  hasSeenInboxEditHint,
  markInboxEditHintSeen,
} from "@/lib/inbox/inbox-edit-hint-storage";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import type { TransactionType } from "@/types/transaction";

interface MessageListProps {
  messages: ChatMessage[];
  onRetry?: (assistantMessageId: string) => Promise<void>;
  onEditMessage?: (userMessageId: string) => Promise<void>;
  onUndoMessage?: (userMessageId: string) => Promise<void>;
  onQuickCorrect?: (input: {
    assistantMessageId: string;
    transactionId: string;
    category: TransactionCategoryId;
    type: TransactionType;
  }) => Promise<void>;
  actionsDisabled?: boolean;
  fixedMobileTopBar?: boolean;
  className?: string;
  hasMoreOlder?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void;
  /** Scroll/highlight a loaded message (e.g. inbox search). */
  focusMessageId?: string | null;
  onFocusMessageHandled?: () => void;
}

const SCROLLBAR_IDLE_MS = 700;
const STICK_TO_BOTTOM_THRESHOLD = 96;

function isNearBottom(element: HTMLElement): boolean {
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <
    STICK_TO_BOTTOM_THRESHOLD
  );
}

export function MessageList({
  messages,
  onRetry,
  onEditMessage,
  onUndoMessage,
  onQuickCorrect,
  actionsDisabled = false,
  fixedMobileTopBar = false,
  className,
  hasMoreOlder = false,
  isLoadingOlder = false,
  onLoadOlder,
  focusMessageId = null,
  onFocusMessageHandled,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const scrollIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isActiveTab = usePersistentTabActive();
  const initialScrollDoneRef = useRef(false);
  const stickToBottomRef = useRef(true);
  const prevFirstIdRef = useRef<string | null>(null);
  const prevLastIdRef = useRef<string | null>(null);
  const prevLengthRef = useRef(0);
  const loadingOlderRef = useRef(false);
  const [editHintSeen, setEditHintSeen] = useState(true);

  const { showBlur: showLargeTitleBlur, showCompactTitle } =
    useMobileLargeTitleScroll(() => scrollRootRef.current, titleRef, {
      enabled: !fixedMobileTopBar,
    });
  const showBlur = fixedMobileTopBar ? true : showLargeTitleBlur;

  useSyncMobileScrollChrome(
    fixedMobileTopBar ? undefined : "Inbox",
    showBlur,
    showCompactTitle,
  );

  useSyncMobileTopBlur(showBlur, isActiveTab);

  useEffect(() => {
    loadingOlderRef.current = isLoadingOlder;
  }, [isLoadingOlder]);

  useEffect(() => {
    setEditHintSeen(hasSeenInboxEditHint());
  }, []);

  function dismissEditHint() {
    markInboxEditHintSeen();
    setEditHintSeen(true);
  }

  function handleMessageMenuOpenChange(open: boolean) {
    if (open) {
      dismissEditHint();
    }
  }

  const editHintTargetIndex = findInboxEditHintTargetIndex(messages);
  const showEditHint = !editHintSeen && editHintTargetIndex >= 0;

  useEffect(() => {
    if (!focusMessageId) {
      return;
    }

    const target = scrollRootRef.current?.querySelector(
      `[data-message-id="${CSS.escape(focusMessageId)}"]`,
    );

    if (!(target instanceof HTMLElement)) {
      return;
    }

    stickToBottomRef.current = false;
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    target.classList.add("inbox-search-highlight");
    const timer = window.setTimeout(() => {
      target.classList.remove("inbox-search-highlight");
    }, 1600);
    onFocusMessageHandled?.();

    return () => window.clearTimeout(timer);
  }, [focusMessageId, messages, onFocusMessageHandled]);

  useLayoutEffect(() => {
    const element = scrollRootRef.current;

    if (!element || messages.length === 0) {
      return;
    }

    const firstId = messages[0]?.id ?? null;
    const lastId = messages.at(-1)?.id ?? null;
    const prevLength = prevLengthRef.current;

    if (!initialScrollDoneRef.current) {
      element.scrollTop = element.scrollHeight;
      initialScrollDoneRef.current = true;
      prevFirstIdRef.current = firstId;
      prevLastIdRef.current = lastId;
      prevLengthRef.current = messages.length;
      return;
    }

    const prepended =
      messages.length > prevLength &&
      firstId !== prevFirstIdRef.current &&
      lastId === prevLastIdRef.current;
    const appended = lastId !== prevLastIdRef.current;
    const pendingTail = lastId?.startsWith("pending-") ?? false;
    const shrank = messages.length < prevLength;

    if (prepended) {
      const previousHeight = element.scrollHeight;
      requestAnimationFrame(() => {
        element.scrollTop =
          element.scrollHeight - previousHeight + element.scrollTop;
      });
    } else if (
      shrank ||
      (appended && (stickToBottomRef.current || pendingTail))
    ) {
      element.scrollTop = element.scrollHeight;
    }

    prevFirstIdRef.current = firstId;
    prevLastIdRef.current = lastId;
    prevLengthRef.current = messages.length;
  }, [fixedMobileTopBar, messages]);

  useEffect(() => {
    const element = scrollRootRef.current;
    if (!element) {
      return;
    }

    function handleScroll() {
      if (!element) {
        return;
      }

      setIsScrolling(true);
      stickToBottomRef.current = isNearBottom(element);

      if (
        hasMoreOlder &&
        onLoadOlder &&
        !loadingOlderRef.current &&
        element.scrollTop < INBOX_LOAD_OLDER_SCROLL_THRESHOLD
      ) {
        onLoadOlder();
      }

      if (scrollIdleRef.current) {
        clearTimeout(scrollIdleRef.current);
      }
      scrollIdleRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, SCROLLBAR_IDLE_MS);
    }

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
      if (scrollIdleRef.current) {
        clearTimeout(scrollIdleRef.current);
      }
    };
  }, [fixedMobileTopBar, hasMoreOlder, onLoadOlder]);

  const contentClassName = fixedMobileTopBar
    ? cn(
        INBOX_MESSAGE_CONTENT_INSET,
        INBOX_DESKTOP_MESSAGE_PT,
        INBOX_DESKTOP_MESSAGE_PB,
      )
    : cn(
        CHAT_MESSAGE_INSET_X,
        MOBILE_CHROME_SCROLL_INSET_TOP,
        CHAT_MESSAGE_INSET_TOP,
        CHAT_MESSAGE_INSET_BOTTOM,
      );

  return (
    <div
      ref={scrollRootRef}
      className={cn(
        INBOX_MESSAGE_SCROLL_AREA,
        "h-full min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
        INBOX_DESKTOP_MESSAGE_SCROLL_PADDING,
        isScrolling && "is-scrolling",
        className,
      )}
    >
      {messages.length === 0 ? (
        <div
          className={cn(
            "flex min-h-full flex-col text-center",
            contentClassName,
          )}
        >
          {!fixedMobileTopBar ? (
            <MobilePageTitle ref={titleRef}>Inbox</MobilePageTitle>
          ) : null}
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="max-w-sm text-muted-foreground">
              Catat keuangan lewat chat. Contoh:{" "}
              <span className="font-medium text-foreground">
                makan warteg 15K
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className={cn("flex flex-col", STACK_GAP, contentClassName)}>
          {!fixedMobileTopBar ? (
            <MobilePageTitle ref={titleRef}>Inbox</MobilePageTitle>
          ) : null}
          {hasMoreOlder ? (
            <div className="flex justify-center py-1">
              <p className="text-[11px] text-muted-foreground">
                {isLoadingOlder
                  ? "Memuat pesan lama..."
                  : "Gulir ke atas untuk muat lebih"}
              </p>
            </div>
          ) : null}
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const retryContext = getInboxRetryContext(messages, index);
            const canManage =
              canManageSentUserMessage(message) &&
              Boolean(onEditMessage) &&
              Boolean(onUndoMessage);

            const isPending = message.id.startsWith("pending-");
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const userInput =
              previousMessage?.role === "user" ? previousMessage.content : "";
            const batchTransactions = message.transactions?.length
              ? message.transactions
              : message.transaction
                ? [message.transaction]
                : [];
            const quickCorrectTransaction =
              (message.lowConfidenceTransactionId
                ? batchTransactions.find(
                    (item) => item.id === message.lowConfidenceTransactionId,
                  )
                : undefined) ??
              (message.transaction &&
              (message.lowConfidenceCategory ||
                (userInput
                  ? isLowConfidenceTransaction(userInput, message.transaction)
                  : false))
                ? message.transaction
                : batchTransactions.find((item) =>
                    userInput
                      ? isLowConfidenceTransaction(userInput, item)
                      : item.category === "other",
                  ));
            const showQuickCorrect =
              !isUser &&
              Boolean(quickCorrectTransaction?.id) &&
              !message.transactionDeleted &&
              Boolean(onQuickCorrect);

            const showEditHintHere =
              showEditHint && index === editHintTargetIndex;

            const bubble = (
              <MessageBubble
                role={message.role}
                content={message.content}
                className={cn(
                  canManage ? "max-w-full" : undefined,
                  isPending && "opacity-70",
                )}
              />
            );

            return (
              <div
                key={message.id}
                data-message-id={message.id}
                className={cn(
                  "flex flex-col gap-1 rounded-2xl transition-[box-shadow,background-color]",
                  isUser ? "items-end" : "items-start",
                )}
              >
                {showEditHintHere ? (
                  <ChatMessageMenuHint onDismiss={dismissEditHint} />
                ) : null}
                {canManage ? (
                  <ChatMessageMenu
                    disabled={actionsDisabled}
                    onEdit={() => void onEditMessage?.(message.id)}
                    onUndo={() => void onUndoMessage?.(message.id)}
                    onOpenChange={handleMessageMenuOpenChange}
                  >
                    {bubble}
                  </ChatMessageMenu>
                ) : (
                  bubble
                )}
                {showQuickCorrect && quickCorrectTransaction?.id ? (
                  <TransactionQuickCorrect
                    disabled={actionsDisabled}
                    transaction={quickCorrectTransaction}
                    userInput={quickCorrectTransaction.description || userInput}
                    onCorrect={({ category, type }) =>
                      void onQuickCorrect?.({
                        assistantMessageId: message.id,
                        transactionId: quickCorrectTransaction.id ?? "",
                        category,
                        type,
                      })
                    }
                  />
                ) : null}
                {!isUser &&
                message.recurringSuggestion &&
                !message.transactionDeleted ? (
                  <RecurringSuggestionPrompt
                    disabled={actionsDisabled}
                    suggestion={message.recurringSuggestion}
                    lastOccurredAt={
                      (message.transactions?.at(-1) ?? message.transaction)
                        ?.occurredAt ?? message.createdAt
                    }
                  />
                ) : null}
                <MessageTimestamp
                  createdAt={message.createdAt}
                  role={message.role}
                />
                {retryContext && onRetry ? (
                  <ChatMessageRetryButton
                    disabled={actionsDisabled}
                    onRetry={() =>
                      void onRetry(retryContext.assistantMessageId)
                    }
                  />
                ) : null}
                {batchTransactions.length > 0 ? (
                  <div className="mt-1 flex max-w-[85%] flex-col gap-1.5">
                    {batchTransactions.map((transaction) => (
                      <TransactionPreview
                        key={
                          transaction.id ??
                          `${transaction.description}-${transaction.amount}`
                        }
                        deleted={message.transactionDeleted}
                        transaction={transaction}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
