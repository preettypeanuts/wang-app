import { GLASS_FILL, GLASS_TILE_BASE } from "@/config/glass";
import type { MessageRole } from "@/types/chat";

export interface ChatBubbleStyle {
  surface: string;
  text: string;
}

/** Base bubble shell — shape/padding in globals.css `.chat-bubble`. */
export const CHAT_BUBBLE_BASE = "chat-bubble box-border whitespace-pre-wrap";

/** iMessage-style tail pseudo-elements (standalone bubbles only). */
export const CHAT_BUBBLE_TAIL = "chat-bubble--tailed";

/** User/assistant bubble without context menu wrapper. */
export const CHAT_BUBBLE_LAYOUT_STANDALONE = "inline-block max-w-[85%]";

/** Inside ChatMessageMenu — parent already constrains width. */
export const CHAT_BUBBLE_LAYOUT_IN_MENU = "block w-full min-w-0";

/** Sync with `.chat-bubble-user` in globals.css — frosted primary fill + glass blur. */
export const CHAT_BUBBLE_USER = "chat-bubble-user";

/** Sync with `.chat-bubble-assistant` in globals.css — glass fill + tail. */
export const CHAT_BUBBLE_ASSISTANT = "chat-bubble-assistant";

export const CHAT_BUBBLE_STYLES: Record<MessageRole, ChatBubbleStyle> = {
  user: {
    surface: `${GLASS_TILE_BASE} ${CHAT_BUBBLE_USER}`,
    text: "text-primary-foreground font-semibold",
  },
  assistant: {
    surface: `${GLASS_TILE_BASE} border border-black/10 ${GLASS_FILL} dark:border-white/10 ${CHAT_BUBBLE_ASSISTANT}`,
    text: "text-foreground",
  },
};
