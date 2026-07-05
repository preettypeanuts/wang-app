import type { ChatMessage } from "@/types/chat";

export function isPendingChatMessageId(id: string): boolean {
  return id.startsWith("pending-");
}

/** User chat messages that can be edited or undone (not PayPlan / pending). */
export function canManageSentUserMessage(message: ChatMessage): boolean {
  if (message.role !== "user") {
    return false;
  }

  if (isPendingChatMessageId(message.id)) {
    return false;
  }

  if (message.content.startsWith("Bayar ")) {
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
