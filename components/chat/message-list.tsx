"use client";

import { useEffect, useRef } from "react";

import { ChatMessageMenu } from "@/components/chat/chat-message-menu";
import { ChatMessageRetryButton } from "@/components/chat/chat-message-retry-button";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageTimestamp } from "@/components/chat/message-timestamp";
import { TransactionPreview } from "@/components/chat/transaction-preview";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CHAT_MESSAGE_INSET_BOTTOM,
  CHAT_MESSAGE_INSET_TOP,
  CHAT_MESSAGE_INSET_X,
} from "@/config/chat-layout";
import { STACK_GAP } from "@/config/spacing";
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
}

export function MessageList({
  messages,
  onRetry,
  onEditMessage,
  onUndoMessage,
  actionsDisabled = false,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="h-full min-h-0">
      {messages.length === 0 ? (
        <div
          className={cn(
            "flex min-h-full flex-col items-center justify-center text-center",
            CHAT_MESSAGE_INSET_X,
            CHAT_MESSAGE_INSET_TOP,
            CHAT_MESSAGE_INSET_BOTTOM,
          )}
        >
          <p className="max-w-sm text-muted-foreground">
            Catat keuangan lewat chat. Contoh:{" "}
            <span className="font-medium text-foreground">
              makan warteg 15K
            </span>
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col",
            STACK_GAP,
            CHAT_MESSAGE_INSET_X,
            CHAT_MESSAGE_INSET_TOP,
            CHAT_MESSAGE_INSET_BOTTOM,
          )}
        >
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const retryContext = getInboxRetryContext(messages, index);
            const canManage =
              canManageSentUserMessage(message) &&
              Boolean(onEditMessage) &&
              Boolean(onUndoMessage);

            const bubble = (
              <MessageBubble
                role={message.role}
                content={message.content}
                className={canManage ? "max-w-full" : undefined}
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
    </ScrollArea>
  );
}
