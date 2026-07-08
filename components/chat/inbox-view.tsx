"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkSavingsGoalFromInboxAction,
  loadOlderInboxMessagesAction,
  markPlanDoneFromInboxAction,
  payPayPlanFromInboxAction,
  retryInboxMessageAction,
  submitInboxMessage,
  undoInboxMessageAction,
} from "@/app/actions/inbox";
import { updateTransactionCategoryAction } from "@/app/actions/journal";
import {
  parseReceiptFromImageAction,
  submitInboxMessageFromReceipt,
  updateInboxMessageFromReceipt,
} from "@/app/actions/receipt";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatReceiptDropOverlay } from "@/components/chat/chat-receipt-drop-overlay";
import { MessageList } from "@/components/chat/message-list";
import { ReceiptConfirmDialog } from "@/components/chat/receipt-confirm-dialog";
import { FixedViewportPortal } from "@/components/shared/fixed-viewport-portal";
import { usePersistentTabActive } from "@/components/shared/persistent-tab-active-context";
import type { TransactionCategoryId } from "@/config/categories";
import { resolveCategoryForType } from "@/config/categories";
import { CHAT_INPUT_DOCK } from "@/config/chat-layout";
import { INBOX_CHAT_VIEW_ROOT } from "@/config/inbox-desktop";
import { INBOX_CHAT_INPUT_DOCK } from "@/config/inbox-mobile";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { buildWarmTransactionReply } from "@/lib/ai/build-warm-transaction-reply";
import { buildReceiptManualFallbackNotice } from "@/lib/ai/format-gemini-api-error";
import { patchInboxBootstrapMessages } from "@/lib/inbox/inbox-bootstrap-cache";
import {
  mergeInboxMessageTail,
  prependOlderInboxMessages,
} from "@/lib/inbox/merge-inbox-messages";
import {
  buildReceiptDraftFromTransaction,
  parseReceiptUserMessageContent,
} from "@/lib/receipt/receipt-message";
import { createEmptyReceiptDraft } from "@/lib/receipt/create-empty-receipt-draft";
import {
  getReceiptImageFromDataTransfer,
  hasReceiptImageInDataTransfer,
} from "@/lib/receipt/image-file";
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
import type { ParsedTransaction, TransactionType } from "@/types/transaction";

interface ReceiptEditContext {
  userMessageId: string;
  assistantMessageId: string;
  transactionId: string;
}

interface ReceiptConfirmInput {
  type: TransactionType;
  amount: string;
  category: TransactionCategoryId;
  description: string;
  merchant: string;
  occurredAt: string;
}

interface InboxViewProps {
  initialMessages: ChatMessage[];
  initialHasMoreMessages?: boolean;
  unpaidPayPlanItems: UnpaidPayPlanChatItem[];
  activePlanItems: ActivePlanChatItem[];
  activeSavingsItems: ActiveSavingsChatItem[];
  fixedMobileTopBar?: boolean;
  onSlashMenuOpenChange?: (open: boolean) => void;
  onTransactionRecorded?: (
    transaction: ParsedTransaction | ParsedTransaction[],
  ) => void;
  onMessagesChange?: (
    messages: ChatMessage[],
    hasMoreMessages?: boolean,
  ) => void;
  focusMessageId?: string | null;
  onFocusMessageHandled?: () => void;
}

function createPendingId(prefix: "user" | "assistant"): string {
  return `pending-${prefix}-${crypto.randomUUID()}`;
}

function isPendingMessageId(id: string): boolean {
  return id.startsWith("pending-");
}

const RECEIPT_READING_MESSAGE = "Membaca Struk";

export function InboxView({
  initialMessages,
  initialHasMoreMessages = false,
  unpaidPayPlanItems,
  activePlanItems,
  activeSavingsItems,
  fixedMobileTopBar = false,
  onSlashMenuOpenChange,
  onTransactionRecorded,
  onMessagesChange,
  focusMessageId = null,
  onFocusMessageHandled,
}: InboxViewProps) {
  const isActiveTab = usePersistentTabActive();
  const isMobileViewport = useIsMobileViewport();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [hasMoreOlder, setHasMoreOlder] = useState(initialHasMoreMessages);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [inFlightCount, setInFlightCount] = useState(0);
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
  const [receiptEditContext, setReceiptEditContext] =
    useState<ReceiptEditContext | null>(null);
  const [isDraggingReceipt, setIsDraggingReceipt] = useState(false);
  const dragDepthRef = useRef(0);

  useEffect(() => {
    setMessages((current) => {
      const merged = mergeInboxMessageTail(current, initialMessages);

      if (
        merged.length === current.length &&
        merged.every((message, index) => message.id === current[index]?.id)
      ) {
        return current;
      }

      return merged;
    });
  }, [initialMessages]);

  useEffect(() => {
    setHasMoreOlder((current) => {
      if (messages.length > initialMessages.length) {
        return current;
      }

      return initialHasMoreMessages;
    });
  }, [initialHasMoreMessages, initialMessages.length, messages.length]);

  const isProcessing = inFlightCount > 0;

  function beginInFlight() {
    setInFlightCount((count) => count + 1);
  }

  function endInFlight() {
    setInFlightCount((count) => Math.max(0, count - 1));
  }

  useEffect(() => {
    if (!isActiveTab) {
      return;
    }

    patchInboxBootstrapMessages(messages);
  }, [isActiveTab, messages]);

  const handleLoadOlder = useCallback(async () => {
    if (isLoadingOlder || !hasMoreOlder) {
      return;
    }

    const oldest = messages[0];
    if (!oldest || isPendingMessageId(oldest.id)) {
      return;
    }

    setIsLoadingOlder(true);

    try {
      const page = await loadOlderInboxMessagesAction({
        createdAt: oldest.createdAt,
        id: oldest.id,
      });

      setMessages((current) => {
        const next = prependOlderInboxMessages(current, page.messages);
        onMessagesChange?.(next, page.hasMore);
        return next;
      });
      setHasMoreOlder(page.hasMore);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [hasMoreOlder, isLoadingOlder, messages, onMessagesChange]);

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
    setReceiptEditContext(null);
    clearReceiptPreview();
  }

  function openReceiptEdit(userMessageId: string) {
    const userIndex = messages.findIndex((message) => message.id === userMessageId);
    const userMessage = messages[userIndex];
    const assistantMessage = messages[userIndex + 1];

    if (
      !userMessage ||
      assistantMessage?.role !== "assistant" ||
      !assistantMessage.transaction?.id ||
      assistantMessage.transactionDeleted
    ) {
      return;
    }

    const { merchant } = parseReceiptUserMessageContent(userMessage.content);

    setReceiptEditContext({
      userMessageId,
      assistantMessageId: assistantMessage.id,
      transactionId: assistantMessage.transaction.id,
    });
    setReceiptDraft(
      buildReceiptDraftFromTransaction(assistantMessage.transaction, merchant),
    );
    setReceiptPreviewUrl(null);
    setReceiptParseNotice(null);
    setIsReceiptConfirmOpen(true);
  }

  async function recordReceiptToInbox(input: ReceiptConfirmInput) {
    const pendingId = createPendingId("user");
    const optimisticUser: ChatMessage = {
      id: pendingId,
      role: "user",
      content: `📄 Struk ${input.merchant.trim() || "Struk"} · ${input.description.trim()}`,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticUser]);
    beginInFlight();

    try {
      const result = await submitInboxMessageFromReceipt(input);

      setMessages((current) => [
        ...current.filter((message) => message.id !== pendingId),
        result.userMessage,
        result.assistantMessage,
      ]);

      if (result.ok && result.transaction) {
        onTransactionRecorded?.(
          "transactions" in result && result.transactions?.length
            ? result.transactions
            : result.transaction,
        );
      }
    } catch (error) {
      setMessages((current) =>
        current.filter((message) => message.id !== pendingId),
      );
      setReceiptError(
        error instanceof Error ? error.message : "Gagal mencatat struk.",
      );
    } finally {
      endInFlight();
    }
  }

  async function handleReceiptFile(file: File) {
    setReceiptError(null);
    const readingMessageId = createPendingId("assistant");
    const readingMessage: ChatMessage = {
      id: readingMessageId,
      role: "assistant",
      content: RECEIPT_READING_MESSAGE,
      createdAt: new Date().toISOString(),
    };

    function removeReadingMessage() {
      setMessages((current) =>
        current.filter((message) => message.id !== readingMessageId),
      );
    }

    setMessages((current) => [...current, readingMessage]);
    setIsParsingReceipt(true);

    try {
      const processed = await processReceiptImageFile(file);
      setReceiptPreviewUrl(processed.previewUrl);

      const result = await parseReceiptFromImageAction(
        processed.base64,
        processed.mimeType,
      );

      if (!result.ok) {
        removeReadingMessage();
        setReceiptEditContext(null);
        setReceiptDraft(createEmptyReceiptDraft());
        setReceiptParseNotice(buildReceiptManualFallbackNotice(result.error));
        setIsReceiptConfirmOpen(true);
        return;
      }

      removeReadingMessage();
      clearReceiptPreview();
      await recordReceiptToInbox({
        type: result.draft.type,
        amount: String(result.draft.amount),
        category: result.draft.category,
        description: result.draft.description,
        merchant: result.draft.merchant,
        occurredAt: result.draft.occurredAt,
      });
    } catch (error) {
      removeReadingMessage();
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

  async function handleReceiptConfirm(input: ReceiptConfirmInput) {
    if (receiptEditContext) {
      const editContext = receiptEditContext;
      closeReceiptConfirm();
      beginInFlight();

      try {
        const result = await updateInboxMessageFromReceipt({
          ...input,
          ...editContext,
        });

        if (!result.ok) {
          setReceiptError(result.error);
          return;
        }

        setMessages((current) =>
          current.map((message) => {
            if (message.id === result.userMessage.id) {
              return result.userMessage;
            }

            if (message.id === result.assistantMessage.id) {
              return result.assistantMessage;
            }

            return message;
          }),
        );

        onTransactionRecorded?.(result.transaction);
      } catch (error) {
        setReceiptError(
          error instanceof Error ? error.message : "Gagal memperbarui struk.",
        );
      } finally {
        endInFlight();
      }

      return;
    }

    closeReceiptConfirm();
    await recordReceiptToInbox(input);
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

    const pendingUserId = createPendingId("user");
    const pendingAssistantId = createPendingId("assistant");
    const optimisticUser: ChatMessage = {
      id: pendingUserId,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const optimisticAssistant: ChatMessage = {
      id: pendingAssistantId,
      role: "assistant",
      content: "Mencatat...",
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticUser, optimisticAssistant]);
    beginInFlight();

    try {
      const result = await submitInboxMessage(trimmed);

      setMessages((current) => [
        ...current.filter(
          (message) =>
            message.id !== pendingUserId && message.id !== pendingAssistantId,
        ),
        result.userMessage,
        result.assistantMessage,
      ]);

      if (result.ok && result.transaction) {
        onTransactionRecorded?.(
          result.transactions?.length
            ? result.transactions
            : result.transaction,
        );
      }
    } catch {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== pendingUserId && message.id !== pendingAssistantId,
        ),
      );
    } finally {
      endInFlight();
    }
  }

  async function handleRetry(assistantMessageId: string) {
    beginInFlight();
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

      if (result.ok && result.transaction) {
        onTransactionRecorded?.(
          result.transactions?.length
            ? result.transactions
            : result.transaction,
        );
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
      endInFlight();
    }
  }

  async function deleteMessagePair(userMessageId: string) {
    const result = await undoInboxMessageAction(userMessageId);

    setMessages((current) => {
      const next = current.filter(
        (message) => !result.removedIds.includes(message.id),
      );
      onMessagesChange?.(next, hasMoreOlder);
      return next;
    });

    return result;
  }

  async function handleUndoMessage(userMessageId: string) {
    beginInFlight();

    try {
      await deleteMessagePair(userMessageId);
    } finally {
      endInFlight();
    }
  }

  async function handleEditMessage(userMessageId: string) {
    beginInFlight();

    try {
      const result = await deleteMessagePair(userMessageId);
      setDraftText(result.content);
    } finally {
      endInFlight();
    }
  }

  async function handleQuickCorrect(input: {
    assistantMessageId: string;
    transactionId: string;
    category: TransactionCategoryId;
    type: TransactionType;
  }) {
    beginInFlight();

    setMessages((current) =>
      current.map((message) => {
        if (message.id !== input.assistantMessageId) {
          return message;
        }

        const batch = message.transactions?.length
          ? message.transactions
          : message.transaction
            ? [message.transaction]
            : [];
        if (batch.length === 0) {
          return message;
        }

        const nextCategory = resolveCategoryForType(input.category, input.type);
        const nextBatch = batch.map((item) =>
          item.id === input.transactionId
            ? {
                ...item,
                id: input.transactionId,
                type: input.type,
                category: nextCategory,
              }
            : item,
        );
        const nextPrimary =
          nextBatch.find((item) => item.id === message.transaction?.id) ??
          nextBatch[0];

        return {
          ...message,
          lowConfidenceCategory: false,
          lowConfidenceTransactionId: undefined,
          content: buildWarmTransactionReply(nextPrimary, null),
          transaction: nextPrimary,
          transactions: nextBatch,
        };
      }),
    );

    try {
      const result = await updateTransactionCategoryAction({
        transactionId: input.transactionId,
        category: input.category,
        type: input.type,
        assistantMessageId: input.assistantMessageId,
      });

      if (!result.ok) {
        return;
      }

      setMessages((current) =>
        current.map((message) => {
          if (message.id !== input.assistantMessageId) {
            return message;
          }

          const batch = message.transactions?.length
            ? message.transactions
            : message.transaction
              ? [message.transaction]
              : [];
          const nextBatch = batch.map((item) =>
            item.id === result.transaction.id ? result.transaction : item,
          );

          return {
            ...message,
            content: result.assistantContent,
            transaction:
              nextBatch.find((item) => item.id === message.transaction?.id) ??
              result.transaction,
            transactions:
              nextBatch.length > 0 ? nextBatch : [result.transaction],
            lowConfidenceCategory: false,
            lowConfidenceTransactionId: undefined,
          };
        }),
      );
    } finally {
      endInFlight();
    }
  }

  async function handlePayPlan(item: UnpaidPayPlanChatItem) {
    const pendingUserId = createPendingId("user");
    const pendingAssistantId = createPendingId("assistant");
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
    beginInFlight();

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
    } catch {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== pendingUserId && message.id !== pendingAssistantId,
        ),
      );
    } finally {
      endInFlight();
    }
  }

  async function handleMarkPlanDone(item: ActivePlanChatItem) {
    const pendingUserId = createPendingId("user");
    const pendingAssistantId = createPendingId("assistant");
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
    beginInFlight();

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
    } catch {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== pendingUserId && message.id !== pendingAssistantId,
        ),
      );
    } finally {
      endInFlight();
    }
  }

  async function handleCheckSavings(item: ActiveSavingsChatItem) {
    const pendingUserId = createPendingId("user");
    const pendingAssistantId = createPendingId("assistant");
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
    beginInFlight();

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
    } catch {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== pendingUserId && message.id !== pendingAssistantId,
        ),
      );
    } finally {
      endInFlight();
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
        disabled={isParsingReceipt}
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
        focusMessageId={focusMessageId}
        hasMoreOlder={hasMoreOlder}
        isLoadingOlder={isLoadingOlder}
        messages={messages}
        onFocusMessageHandled={onFocusMessageHandled}
        onLoadOlder={() => void handleLoadOlder()}
        onRetry={handleRetry}
        onEditMessage={handleEditMessage}
        onUndoMessage={handleUndoMessage}
        onEditReceipt={openReceiptEdit}
        onQuickCorrect={handleQuickCorrect}
        actionsDisabled={isProcessing}
      />
      <ChatReceiptDropOverlay visible={isDraggingReceipt} />
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
        mode={receiptEditContext ? "edit" : "create"}
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
