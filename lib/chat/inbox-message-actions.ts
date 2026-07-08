import { isReceiptUserMessage } from "@/lib/receipt/receipt-message";
import type { ChatMessage } from "@/types/chat";

export function isPendingChatMessageId(id: string): boolean {
  return id.startsWith("pending-");
}

function isUndoBlockedUserMessage(content: string): boolean {
  return content.startsWith("Bayar ") || content.startsWith("Beli ");
}

/** User chat messages that can be undone (not PayPlan / pending). */
export function canUndoSentUserMessage(message: ChatMessage): boolean {
  if (message.role !== "user") {
    return false;
  }

  if (isPendingChatMessageId(message.id)) {
    return false;
  }

  if (isUndoBlockedUserMessage(message.content)) {
    return false;
  }

  return true;
}

/** User chat messages that can be edited or undone via the text menu (not PayPlan / pending / receipt). */
export function canManageSentUserMessage(message: ChatMessage): boolean {
  if (!canUndoSentUserMessage(message)) {
    return false;
  }

  if (isReceiptUserMessage(message.content)) {
    return false;
  }

  return true;
}

export function getAssistantReplyId(
  messages: ChatMessage[],
  userMessageIndex: number,
): string | null {
  const next = messages[userMessageIndex + 1];

  if (!next || next.role !== "assistant") {
    return null;
  }

  if (isPendingChatMessageId(next.id)) {
    return null;
  }

  return next.id;
}
