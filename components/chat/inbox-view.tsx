"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  payPayPlanFromInboxAction,
  retryInboxMessageAction,
  submitInboxMessage,
  undoInboxMessageAction,
} from "@/app/actions/inbox";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { CHAT_INPUT_DOCK } from "@/config/chat-layout";
import type { ChatMessage, UnpaidPayPlanChatItem } from "@/types/chat";

interface InboxViewProps {
  initialMessages: ChatMessage[];
  unpaidPayPlanItems: UnpaidPayPlanChatItem[];
}

function createPendingId(): string {
  return `pending-${crypto.randomUUID()}`;
}

export function InboxView({
  initialMessages,
  unpaidPayPlanItems,
}: InboxViewProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftText, setDraftText] = useState<string | null>(null);

  const handleDraftTextApplied = useCallback(() => {
    setDraftText(null);
  }, []);

  async function handleSubmit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const pendingId = createPendingId();
    const optimisticUser: ChatMessage = {
      id: pendingId,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticUser]);
    setIsProcessing(true);

    try {
      const result = await submitInboxMessage(trimmed);

      setMessages((current) => [
        ...current.filter((message) => message.id !== pendingId),
        result.userMessage,
        result.assistantMessage,
      ]);

      if (result.ok) {
        router.refresh();
      }
    } catch {
      setMessages((current) =>
        current.filter((message) => message.id !== pendingId),
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRetry(assistantMessageId: string) {
    setIsProcessing(true);
    setMessages((current) =>
      current.map((message) =>
        message.id === assistantMessageId
          ? { ...message, content: "Memproses ulang...", transaction: undefined }
          : message,
      ),
    );

    try {
      const result = await retryInboxMessageAction(assistantMessageId);

      setMessages((current) =>
        current.map((message) => {
          if (message.id === assistantMessageId) {
            return result.assistantMessage;
          }

          if (message.id === result.userMessage.id) {
            return result.userMessage;
          }

          return message;
        }),
      );

      if (result.ok) {
        router.refresh();
      }
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: "Gagal memproses pesan. Coba lagi.",
                transaction: undefined,
              }
            : message,
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function removeMessagePair(userMessageId: string) {
    const result = await undoInboxMessageAction(userMessageId);

    setMessages((current) =>
      current.filter((message) => !result.removedIds.includes(message.id)),
    );

    router.refresh();

    return result;
  }

  async function handleUndoMessage(userMessageId: string) {
    setIsProcessing(true);

    try {
      await removeMessagePair(userMessageId);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleEditMessage(userMessageId: string) {
    setIsProcessing(true);

    try {
      const result = await removeMessagePair(userMessageId);
      setDraftText(result.content);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handlePayPlan(item: UnpaidPayPlanChatItem) {
    const pendingUserId = createPendingId();
    const pendingAssistantId = createPendingId();
    const optimisticUser: ChatMessage = {
      id: pendingUserId,
      role: "user",
      content: `Bayar ${item.name}`,
      createdAt: new Date().toISOString(),
    };
    const optimisticAssistant: ChatMessage = {
      id: pendingAssistantId,
      role: "assistant",
      content: "Menandai pembayaran...",
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [
      ...current,
      optimisticUser,
      optimisticAssistant,
    ]);
    setIsProcessing(true);

    try {
      const result = await payPayPlanFromInboxAction(
        item.id,
        item.installmentIndex,
      );

      setMessages((current) => [
        ...current.filter(
          (message) =>
            message.id !== pendingUserId && message.id !== pendingAssistantId,
        ),
        result.userMessage,
        result.assistantMessage,
      ]);

      router.refresh();
    } catch {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== pendingUserId && message.id !== pendingAssistantId,
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden">
      <MessageList
        messages={messages}
        onRetry={handleRetry}
        onEditMessage={handleEditMessage}
        onUndoMessage={handleUndoMessage}
        actionsDisabled={isProcessing}
      />
      <ChatHeader />
      <div className={CHAT_INPUT_DOCK}>
        <ChatInput
          onSubmit={handleSubmit}
          onPayPlan={handlePayPlan}
          unpaidPayPlanItems={unpaidPayPlanItems}
          disabled={isProcessing}
          draftText={draftText}
          onDraftTextApplied={handleDraftTextApplied}
        />
      </div>
    </div>
  );
}
