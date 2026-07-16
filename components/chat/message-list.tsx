"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

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
import {
  CHAT_MESSAGE_INSET_BOTTOM,
  CHAT_MESSAGE_INSET_TOP,
  CHAT_MESSAGE_INSET_X,
  INBOX_MESSAGE_SCROLL_AREA,
} from "@/config/chat-layout";
import {
  CHAT_MESSAGE_EXIT,
  CHAT_MESSAGE_EXIT_TRANSITION,
  CHAT_MESSAGE_LAYOUT_SPRING,
} from "@/config/chat-message-enter";
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
import {
  getChatMessageKey,
  isPendingChatMessage,
} from "@/lib/chat/optimistic-chat-message";
import { scrollMessageListToBottom } from "@/lib/chat/scroll-message-list-to-bottom";
import { getInboxRetryContext } from "@/lib/chat/inbox-error";
import { canManageSentUserMessage, canUndoSentUserMessage } from "@/lib/chat/inbox-message-actions";
import { isReceiptUserMessage } from "@/lib/receipt/receipt-message";
import { isLowConfidenceTransaction } from "@/lib/chat/low-confidence-transaction";
import {
  hasSeenInboxEditHint,
  markInboxEditHintSeen,
} from "@/lib/inbox/inbox-edit-hint-storage";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import type { FlowTransactionType } from "@/types/transaction";

interface MessageListProps {
  messages: ChatMessage[];
  onRetry?: (assistantMessageId: string) => Promise<void>;
  onEditMessage?: (userMessageId: string) => Promise<void>;
  onUndoMessage?: (userMessageId: string) => Promise<void>;
  onEditReceipt?: (userMessageId: string) => void;
  onQuickCorrect?: (input: {
    assistantMessageId: string;
    transactionId: string;
    category: string;
    type: FlowTransactionType;
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

interface MessageListSnapshot {
  initialized: boolean;
  firstId: string | null;
  lastId: string | null;
  length: number;
}

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
  onEditReceipt,
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
  const stickToBottomRef = useRef(true);
  const listSnapshotRef = useRef<MessageListSnapshot>({
    initialized: false,
    firstId: null,
    lastId: null,
    length: 0,
  });
  const [enteringMountKeys, setEnteringMountKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const loadingOlderRef = useRef(false);
  const [editHintSeen, setEditHintSeen] = useState(true);
  const reduceMotion = useReducedMotion();

  function clearEnteringMountKey(mountKey: string | undefined) {
    if (!mountKey) {
      return;
    }

    setEnteringMountKeys((current) => {
      if (!current.has(mountKey)) {
        return current;
      }

      const next = new Set(current);
      next.delete(mountKey);
      return next;
    });
  }

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
    const snapshot = listSnapshotRef.current;

    if (!snapshot.initialized) {
      element.scrollTop = element.scrollHeight;
      listSnapshotRef.current = {
        initialized: true,
        firstId,
        lastId,
        length: messages.length,
      };
      return;
    }

    const prepended =
      messages.length > snapshot.length &&
      firstId !== snapshot.firstId &&
      lastId === snapshot.lastId;
    const appended = lastId !== snapshot.lastId;
    const pendingTail = lastId?.startsWith("pending-") ?? false;
    const shrank = messages.length < snapshot.length;

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
      scrollMessageListToBottom(element);
    }

    if (appended && !prepended && snapshot.lastId !== null) {
      const previousLastIndex = messages.findIndex(
        (message) => message.id === snapshot.lastId,
      );
      const newlyAppended =
        previousLastIndex >= 0
          ? messages.slice(previousLastIndex + 1)
          : messages;
      const pendingMountKeys = newlyAppended
        .filter(
          (message) => message.mountKey && isPendingChatMessage(message),
        )
        .map((message) => message.mountKey as string);

      if (pendingMountKeys.length > 0) {
        setEnteringMountKeys((current) => {
          const next = new Set(current);
          for (const mountKey of pendingMountKeys) {
            next.add(mountKey);
          }
          return next;
        });
      }
    }

    listSnapshotRef.current = {
      initialized: true,
      firstId,
      lastId,
      length: messages.length,
    };
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
          <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const retryContext = getInboxRetryContext(messages, index);
            const canManage =
              canManageSentUserMessage(message) &&
              Boolean(onEditMessage) &&
              Boolean(onUndoMessage);
            const canUndo =
              canUndoSentUserMessage(message) && Boolean(onUndoMessage);
            const nextMessage = messages[index + 1];
            const canEditReceipt =
              isReceiptUserMessage(message.content) &&
              nextMessage?.role === "assistant" &&
              Boolean(nextMessage.transaction?.id) &&
              !nextMessage.transactionDeleted &&
              Boolean(onEditReceipt);

            const hasMessageMenu =
              canManage ||
              canEditReceipt ||
              (canUndo && isReceiptUserMessage(message.content));

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

            const messageKey = getChatMessageKey(message);
            const shouldAnimateEnter = message.mountKey
              ? enteringMountKeys.has(message.mountKey)
              : false;

            const bubble = (
              <MessageBubble
                role={message.role}
                content={message.content}
                inMenu={hasMessageMenu}
                animateEnter={shouldAnimateEnter}
                onEnterComplete={() => clearEnteringMountKey(message.mountKey)}
                className={cn(
                  isUser && !hasMessageMenu ? "ml-auto" : undefined,
                )}
              />
            );

            return (
              <motion.div
                key={messageKey}
                layout="position"
                initial={false}
                exit={reduceMotion ? undefined : CHAT_MESSAGE_EXIT}
                transition={{
                  layout: CHAT_MESSAGE_LAYOUT_SPRING,
                  ...CHAT_MESSAGE_EXIT_TRANSITION,
                }}
                data-message-id={message.id}
                className={cn(
                  "flex w-full flex-col gap-1 rounded-2xl",
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
                ) : canEditReceipt || (canUndo && isReceiptUserMessage(message.content)) ? (
                  <ChatMessageMenu
                    disabled={actionsDisabled}
                    receiptMenu={isReceiptUserMessage(message.content)}
                    showEdit={canEditReceipt}
                    onEdit={() => onEditReceipt?.(message.id)}
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
              </motion.div>
            );
          })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
