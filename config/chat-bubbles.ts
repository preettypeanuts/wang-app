import { GLASS_FILL, GLASS_TILE_BASE } from "@/config/glass";
import { SEPARATED_SURFACE } from "@/config/shape";
import type { MessageRole } from "@/types/chat";

export interface ChatBubbleStyle {
  surface: string;
  text: string;
}

/** Typography + inner padding — keep horizontal > vertical for short words. */
export const CHAT_BUBBLE_BASE =
  "box-border px-3.5 py-1.75 text-[14px] leading-[1.35] whitespace-pre-wrap";

/** User/assistant bubble without context menu wrapper. */
export const CHAT_BUBBLE_LAYOUT_STANDALONE = "inline-block max-w-[85%]";

/** Inside ChatMessageMenu — parent already constrains width. */
export const CHAT_BUBBLE_LAYOUT_IN_MENU = "block w-full min-w-0";

/** Sync with `.chat-bubble-user` in globals.css — frosted primary fill + glass blur. */
export const CHAT_BUBBLE_USER = "chat-bubble-user";

export const CHAT_BUBBLE_STYLES: Record<MessageRole, ChatBubbleStyle> = {
  user: {
    surface: `${GLASS_TILE_BASE} ${CHAT_BUBBLE_USER}`,
    text: "text-primary-foreground font-semibold",
  },
  assistant: {
    surface: `${GLASS_TILE_BASE} border border-black/10 ${GLASS_FILL} dark:border-white/10`,
    text: "text-foreground",
  },
};

export { SEPARATED_SURFACE };
