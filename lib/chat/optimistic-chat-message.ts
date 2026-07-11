import type { ChatMessage } from "@/types/chat";

export function createChatMountKey(): string {
  return crypto.randomUUID();
}

export function createPendingMessageId(prefix: "user" | "assistant"): string {
  return `pending-${prefix}-${crypto.randomUUID()}`;
}

export function createOptimisticUserMessage(
  content: string,
  mountKey = createChatMountKey(),
): ChatMessage {
  return {
    id: createPendingMessageId("user"),
    mountKey,
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };
}

export function createOptimisticAssistantMessage(
  content: string,
  mountKey = createChatMountKey(),
): ChatMessage {
  return {
    id: createPendingMessageId("assistant"),
    mountKey,
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };
}

export function preserveChatMountKey(
  message: ChatMessage,
  mountKey?: string,
): ChatMessage {
  return mountKey ? { ...message, mountKey } : message;
}

export function getChatMessageKey(message: ChatMessage): string {
  return message.mountKey ?? message.id;
}

export function isPendingChatMessage(message: ChatMessage): boolean {
  return message.id.startsWith("pending-");
}

export function createOptimisticMessagePair(
  userContent: string,
  assistantContent: string,
): {
  userMountKey: string;
  assistantMountKey: string;
  user: ChatMessage;
  assistant: ChatMessage;
} {
  const userMountKey = createChatMountKey();
  const assistantMountKey = createChatMountKey();

  return {
    userMountKey,
    assistantMountKey,
    user: createOptimisticUserMessage(userContent, userMountKey),
    assistant: createOptimisticAssistantMessage(
      assistantContent,
      assistantMountKey,
    ),
  };
}
