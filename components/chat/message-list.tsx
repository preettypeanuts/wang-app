"use client";

import { useEffect, useRef, useState } from "react";

import { ChatMessageMenu } from "@/components/chat/chat-message-menu";
import { ChatMessageRetryButton } from "@/components/chat/chat-message-retry-button";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageTimestamp } from "@/components/chat/message-timestamp";
import { TransactionPreview } from "@/components/chat/transaction-preview";
import { MobilePageTitle } from "@/components/shared/mobile-page-title";
import { useSyncMobileScrollChrome } from "@/components/shared/mobile-scroll-chrome-provider";
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
import { INBOX_MESSAGE_CONTENT_INSET } from "@/config/inbox-mobile";
import { MOBILE_CHROME_SCROLL_INSET_TOP } from "@/config/mobile-chrome";
import { STACK_GAP } from "@/config/spacing";
import { useMobileLargeTitleScroll } from "@/hooks/use-mobile-large-title-scroll";
import { getInboxRetryContext } from "@/lib/chat/inbox-error";
import { canManageSentUserMessage } from "@/lib/chat/inbox-message-actions";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface MessageListProps {
  messages: ChatMessage[];
  onRetry?: (assistantMessageId: string) => Promise<void>;
  onEditMessage?: (userMessageId: string) => Promise<void>;
  onUndoMessage?: (userMessageId: string) => Promise<void>;
  actionsDisabled?: boolean;
  fixedMobileTopBar?: boolean;
  className?: string;
}

const SCROLLBAR_IDLE_MS = 700;

export function MessageList({
  messages,
  onRetry,
  onEditMessage,
  onUndoMessage,
  actionsDisabled = false,
  fixedMobileTopBar = false,
  className,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const scrollIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { showBlur, showCompactTitle } = useMobileLargeTitleScroll(
    () => scrollRootRef.current,
    titleRef,
    { enabled: !fixedMobileTopBar },
  );

  useSyncMobileScrollChrome(
    fixedMobileTopBar ? undefined : "Inbox",
    showBlur,
    showCompactTitle,
  );

  useEffect(() => {
    const behavior = messages.at(-1)?.id.startsWith("pending-")
      ? "instant"
      : "smooth";
    bottomRef.current?.scrollIntoView({ behavior });
  }, [messages]);

  useEffect(() => {
    const element = scrollRootRef.current;
    if (!element) {
      return;
    }

    function handleScroll() {
      setIsScrolling(true);
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
  }, []);

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
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              const retryContext = getInboxRetryContext(messages, index);
              const canManage =
                canManageSentUserMessage(message) &&
                Boolean(onEditMessage) &&
                Boolean(onUndoMessage);

              const isPending = message.id.startsWith("pending-");

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
                  className={cn(
                    "flex flex-col gap-1",
                    isUser ? "items-end" : "items-start",
                  )}
                >
                  {canManage ? (
                    <ChatMessageMenu
                      disabled={actionsDisabled}
                      onEdit={() => void onEditMessage?.(message.id)}
                      onUndo={() => void onUndoMessage?.(message.id)}
                    >
                      {bubble}
                    </ChatMessageMenu>
                  ) : (
                    bubble
                  )}
                  <MessageTimestamp
                    createdAt={message.createdAt}
                    role={message.role}
                  />
                  {retryContext && onRetry ? (
                    <ChatMessageRetryButton
                      disabled={actionsDisabled}
                      onRetry={() => void onRetry(retryContext.assistantMessageId)}
                    />
                  ) : null}
                  {message.transaction ? (
                    <div className="mt-1 max-w-[85%]">
                      <TransactionPreview transaction={message.transaction} />
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
