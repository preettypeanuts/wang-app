"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  checkSavingsGoalFromInboxAction,
  markPlanDoneFromInboxAction,
  payPayPlanFromInboxAction,
  retryInboxMessageAction,
  submitInboxMessage,
  undoInboxMessageAction,
} from "@/app/actions/inbox";
import {
  parseReceiptFromImageAction,
  submitInboxMessageFromReceipt,
} from "@/app/actions/receipt";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatReceiptDropOverlay } from "@/components/chat/chat-receipt-drop-overlay";
import { ChatReceiptProcessingOverlay } from "@/components/chat/chat-receipt-processing-overlay";
import { MessageList } from "@/components/chat/message-list";
import { ReceiptConfirmDialog } from "@/components/chat/receipt-confirm-dialog";
import { FixedViewportPortal } from "@/components/shared/fixed-viewport-portal";
import type { TransactionCategoryId } from "@/config/categories";
import { CHAT_INPUT_DOCK } from "@/config/chat-layout";
import { INBOX_CHAT_VIEW_ROOT } from "@/config/inbox-desktop";
import { INBOX_CHAT_INPUT_DOCK } from "@/config/inbox-mobile";
import { buildReceiptManualFallbackNotice } from "@/lib/ai/format-gemini-api-error";
import { patchInboxBootstrapMessages } from "@/lib/inbox/inbox-bootstrap-cache";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import {
  getReceiptImageFromDataTransfer,
  hasReceiptImageInDataTransfer,
} from "@/lib/receipt/image-file";
import { createEmptyReceiptDraft } from "@/lib/receipt/create-empty-receipt-draft";
import {
  processReceiptImageFile,
  ReceiptImageError,
} from "@/lib/receipt/process-receipt-image";
import type {
  ActivePlanChatItem,
  ActiveSavingsChatItem,
  ChatMessage,
  UnpaidPayPlanChatItem,
} from "@/types/chat";
import type { ReceiptDraft } from "@/types/receipt";
import type { TransactionType } from "@/types/transaction";

interface InboxViewProps {
  initialMessages: ChatMessage[];
  unpaidPayPlanItems: UnpaidPayPlanChatItem[];
  activePlanItems: ActivePlanChatItem[];
  activeSavingsItems: ActiveSavingsChatItem[];
  fixedMobileTopBar?: boolean;
  onSlashMenuOpenChange?: (open: boolean) => void;
}

function createPendingId(): string {
  return `pending-${crypto.randomUUID()}`;
}

export function InboxView({
  initialMessages,
  unpaidPayPlanItems,
  activePlanItems,
  activeSavingsItems,
  fixedMobileTopBar = false,
  onSlashMenuOpenChange,
}: InboxViewProps) {
  const router = useRouter();
  const isMobileViewport = useIsMobileViewport();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftText, setDraftText] = useState<string | null>(null);
  const [receiptDraft, setReceiptDraft] = useState<ReceiptDraft | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(
    null,
  );
  const [isReceiptConfirmOpen, setIsReceiptConfirmOpen] = useState(false);
  const [isParsingReceipt, setIsParsingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receiptParseNotice, setReceiptParseNotice] = useState<string | null>(
    null,
  );
  const [isDraggingReceipt, setIsDraggingReceipt] = useState(false);
  const dragDepthRef = useRef(0);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    patchInboxBootstrapMessages(messages);
  }, [messages]);

  const handleDraftTextApplied = useCallback(() => {
    setDraftText(null);
  }, []);

  function clearReceiptPreview() {
    setReceiptPreviewUrl(null);
  }

  function closeReceiptConfirm() {
    setIsReceiptConfirmOpen(false);
    setReceiptDraft(null);
    setReceiptParseNotice(null);
    clearReceiptPreview();
  }

  async function handleReceiptFile(file: File) {
    setReceiptError(null);
    setIsParsingReceipt(true);

    try {
      const processed = await processReceiptImageFile(file);
      setReceiptPreviewUrl(processed.previewUrl);

      const result = await parseReceiptFromImageAction(
        processed.base64,
        processed.mimeType,
      );

      if (!result.ok) {
        setReceiptDraft(createEmptyReceiptDraft());
        setReceiptParseNotice(buildReceiptManualFallbackNotice(result.error));
        setIsReceiptConfirmOpen(true);
        return;
      }

      setReceiptParseNotice(null);
      setReceiptDraft(result.draft);
      setIsReceiptConfirmOpen(true);
    } catch (error) {
      clearReceiptPreview();
      setReceiptError(
        error instanceof ReceiptImageError
          ? error.message
          : "Gagal memproses struk. Coba lagi.",
      );
    } finally {
      setIsParsingReceipt(false);
    }
  }

  async function handleReceiptConfirm(input: {
    type: TransactionType;
    amount: string;
    category: TransactionCategoryId;
    description: string;
    merchant: string;
    occurredAt: string;
  }) {
    const pendingId = createPendingId();
    const optimisticUser: ChatMessage = {
      id: pendingId,
      role: "user",
      content: `📄 Struk ${input.merchant.trim() || "Struk"} · ${input.description.trim()}`,
      createdAt: new Date().toISOString(),
    };

    closeReceiptConfirm();
    setMessages((current) => [...current, optimisticUser]);
    setIsProcessing(true);

    try {
      const result = await submitInboxMessageFromReceipt(input);

      setMessages((current) => [
        ...current.filter((message) => message.id !== pendingId),
        result.userMessage,
        result.assistantMessage,
      ]);

      if (result.ok) {
        router.refresh();
      }
    } catch (error) {
      setMessages((current) =>
        current.filter((message) => message.id !== pendingId),
      );
      setReceiptError(
        error instanceof Error ? error.message : "Gagal mencatat struk.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDragEnter(event: React.DragEvent<HTMLElement>) {
    if (!hasReceiptImageInDataTransfer(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDraggingReceipt(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLElement>) {
    if (!hasReceiptImageInDataTransfer(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDraggingReceipt(false);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLElement>) {
    if (!hasReceiptImageInDataTransfer(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  async function handleDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDraggingReceipt(false);

    if (isProcessing || isParsingReceipt) {
      return;
    }

    const file = getReceiptImageFromDataTransfer(event.dataTransfer);
    if (!file) {
      return;
    }

    await handleReceiptFile(file);
  }

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
          ? {
              ...message,
              content: "Memproses ulang...",
              transaction: undefined,
            }
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

    setMessages((current) => [...current, optimisticUser, optimisticAssistant]);
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

  async function handleMarkPlanDone(item: ActivePlanChatItem) {
    const pendingUserId = createPendingId();
    const pendingAssistantId = createPendingId();
    const optimisticUser: ChatMessage = {
      id: pendingUserId,
      role: "user",
      content: `Beli ${item.name}`,
      createdAt: new Date().toISOString(),
    };
    const optimisticAssistant: ChatMessage = {
      id: pendingAssistantId,
      role: "assistant",
      content: "Menandai wish selesai...",
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticUser, optimisticAssistant]);
    setIsProcessing(true);

    try {
      const result = await markPlanDoneFromInboxAction(item.id);

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

  async function handleCheckSavings(item: ActiveSavingsChatItem) {
    const pendingUserId = createPendingId();
    const pendingAssistantId = createPendingId();
    const optimisticUser: ChatMessage = {
      id: pendingUserId,
      role: "user",
      content: `cek tabungan ${item.name}`,
      createdAt: new Date().toISOString(),
    };
    const optimisticAssistant: ChatMessage = {
      id: pendingAssistantId,
      role: "assistant",
      content: "Memuat tabungan...",
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticUser, optimisticAssistant]);
    setIsProcessing(true);

    try {
      const result = await checkSavingsGoalFromInboxAction(item.id);

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

  const chatInputDockClass = fixedMobileTopBar
    ? INBOX_CHAT_INPUT_DOCK
    : CHAT_INPUT_DOCK;
  const pinInputToViewport = fixedMobileTopBar && isMobileViewport;

  const chatInputDock = (
    <div className={chatInputDockClass}>
      {receiptError ? (
        <p className="mb-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {receiptError}
        </p>
      ) : null}
      <ChatInput
        onSubmit={handleSubmit}
        onReceiptFile={handleReceiptFile}
        onPayPlan={handlePayPlan}
        onMarkPlanDone={handleMarkPlanDone}
        onCheckSavings={handleCheckSavings}
        unpaidPayPlanItems={unpaidPayPlanItems}
        activePlanItems={activePlanItems}
        activeSavingsItems={activeSavingsItems}
        disabled={isProcessing || isParsingReceipt}
        draftText={draftText}
        onDraftTextApplied={handleDraftTextApplied}
        onSlashMenuOpenChange={onSlashMenuOpenChange}
      />
    </div>
  );

  return (
    <section
      aria-label="Inbox chat"
      className={INBOX_CHAT_VIEW_ROOT}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={(event) => void handleDrop(event)}
    >
      <MessageList
        className="min-h-0 flex-1"
        fixedMobileTopBar={fixedMobileTopBar}
        messages={messages}
        onRetry={handleRetry}
        onEditMessage={handleEditMessage}
        onUndoMessage={handleUndoMessage}
        actionsDisabled={isProcessing}
      />
      <ChatReceiptDropOverlay visible={isDraggingReceipt} />
      <ChatReceiptProcessingOverlay visible={isParsingReceipt} />
      {pinInputToViewport ? (
        <FixedViewportPortal>{chatInputDock}</FixedViewportPortal>
      ) : (
        chatInputDock
      )}

      <ReceiptConfirmDialog
        open={isReceiptConfirmOpen}
        draft={receiptDraft}
        previewUrl={receiptPreviewUrl}
        notice={receiptParseNotice}
        onOpenChange={(open) => {
          if (!open) {
            closeReceiptConfirm();
            return;
          }

          setIsReceiptConfirmOpen(true);
        }}
        onConfirm={handleReceiptConfirm}
      />
    </section>
  );
}
