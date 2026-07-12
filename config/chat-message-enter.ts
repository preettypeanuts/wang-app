import {
  CHAT_BUBBLE_EXIT_TRANSITION,
  CHAT_BUBBLE_SPRING,
} from "@/config/chat-animation";

/** Pop + slide enter — Motion tokens for inbox chat bubbles. */
export const CHAT_MESSAGE_ENTER_SPRING = CHAT_BUBBLE_SPRING;

export const CHAT_MESSAGE_LAYOUT_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.6,
};

/** Spring settle estimate for scroll easing after user bubble enter. */
export const CHAT_MESSAGE_SCROLL_ANIMATION_MS = 520;

export const CHAT_MESSAGE_EXIT = {
  opacity: 0,
  scale: 0.5,
};

export const CHAT_MESSAGE_EXIT_TRANSITION = CHAT_BUBBLE_EXIT_TRANSITION;

/** Optimistic bubble id prefixes. */
export const CHAT_PENDING_USER_ID_PREFIX = "pending-user";
export const CHAT_PENDING_ASSISTANT_ID_PREFIX = "pending-assistant";
