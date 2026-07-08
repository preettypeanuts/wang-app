import { canManageSentUserMessage } from "@/lib/chat/inbox-message-actions";
import type { ChatMessage } from "@/types/chat";

/** First assistant reply with a recorded transaction and a manageable user message. */
export function findInboxEditHintTargetIndex(
  messages: ChatMessage[],
): number {
  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];

    if (
      message.role !== "assistant" ||
      !message.transaction ||
      message.transactionDeleted ||
      message.id.startsWith("pending-")
    ) {
      continue;
    }

    const userMessage = messages[index - 1];
    if (
      userMessage &&
      canManageSentUserMessage(userMessage)
    ) {
      return index;
    }
  }

  return -1;
}
