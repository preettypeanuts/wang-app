/** Pop + slide enter — Motion tokens for inbox chat bubbles. */
export const CHAT_MESSAGE_ENTER_SPRING = {
  type: "spring" as const,
  stiffness: 460,
  damping: 32,
  mass: 0.65,
};

export const CHAT_MESSAGE_LAYOUT_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.6,
};

export const CHAT_MESSAGE_ASSISTANT_ENTER_DELAY_S = 0.08;

export const CHAT_MESSAGE_USER_OPACITY_DURATION_S = 0.14;
export const CHAT_MESSAGE_USER_SCALE_DURATION_S = 0.34;

export const CHAT_MESSAGE_ASSISTANT_OPACITY_DURATION_S = 0.18;
export const CHAT_MESSAGE_ASSISTANT_MOTION_DURATION_S = 0.22;

/** Longest user enter path — drives scroll easing duration. */
export const CHAT_MESSAGE_SCROLL_ANIMATION_MS = Math.ceil(
  CHAT_MESSAGE_USER_SCALE_DURATION_S * 1000,
);

/** Mount state — small slide, strong scale headroom for overshoot keyframes. */
export const CHAT_MESSAGE_USER_ENTER = {
  opacity: 0,
  y: 8,
  scale: 0.72,
};

/** Pop overshoot: 0.72 → 1.07 → 1 */
export const CHAT_MESSAGE_USER_ANIMATE = {
  opacity: 1,
  y: 0,
  scale: [0.72, 1.07, 1],
};

export const CHAT_MESSAGE_USER_TRANSITION = {
  opacity: {
    duration: CHAT_MESSAGE_USER_OPACITY_DURATION_S,
    ease: "easeOut" as const,
  },
  y: CHAT_MESSAGE_ENTER_SPRING,
  scale: {
    duration: CHAT_MESSAGE_USER_SCALE_DURATION_S,
    times: [0, 0.58, 1],
    ease: "easeOut" as const,
  },
};

/** Assistant — fade + slide, no scale pop (streaming-safe). */
export const CHAT_MESSAGE_ASSISTANT_ENTER = {
  opacity: 0,
  y: 6,
  scale: 0.98,
};

export const CHAT_MESSAGE_ASSISTANT_ANIMATE = {
  opacity: 1,
  y: 0,
  scale: 1,
};

export const CHAT_MESSAGE_ASSISTANT_TRANSITION = {
  opacity: {
    duration: CHAT_MESSAGE_ASSISTANT_OPACITY_DURATION_S,
    ease: "easeOut" as const,
    delay: CHAT_MESSAGE_ASSISTANT_ENTER_DELAY_S,
  },
  y: {
    ...CHAT_MESSAGE_ENTER_SPRING,
    delay: CHAT_MESSAGE_ASSISTANT_ENTER_DELAY_S,
  },
  scale: {
    duration: CHAT_MESSAGE_ASSISTANT_MOTION_DURATION_S,
    ease: "easeOut" as const,
    delay: CHAT_MESSAGE_ASSISTANT_ENTER_DELAY_S,
  },
};

export const CHAT_MESSAGE_EXIT = {
  opacity: 0,
  scale: 0.96,
  y: 8,
};

export const CHAT_MESSAGE_EXIT_TRANSITION = {
  duration: 0.18,
  ease: "easeIn" as const,
};

/** Optimistic bubble id prefixes. */
export const CHAT_PENDING_USER_ID_PREFIX = "pending-user";
export const CHAT_PENDING_ASSISTANT_ID_PREFIX = "pending-assistant";
