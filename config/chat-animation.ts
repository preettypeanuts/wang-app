import type { Transition, Variants } from "motion/react";

/** iOS-style message bubble spring — stiffness/damping tuned for pop. */
export const CHAT_BUBBLE_SPRING: Transition = {
  type: "spring",
  stiffness: 460,
  damping: 32,
  mass: 0.65,
};

export const CHAT_BUBBLE_EXIT_TRANSITION: Transition = {
  duration: 0.15,
  ease: "easeIn",
};

/** User sent bubble — dramatic pop + slide (iMessage-style). */
export const CHAT_BUBBLE_USER_VARIANTS: Variants = {
  initial: { scale: 0.3, y: 48, opacity: 0 },
  animate: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: CHAT_BUBBLE_SPRING,
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    transition: CHAT_BUBBLE_EXIT_TRANSITION,
  },
};

/** Assistant — softer fade + slide (streaming-safe, no dramatic pop). */
export const CHAT_BUBBLE_ASSISTANT_VARIANTS: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...CHAT_BUBBLE_SPRING,
      delay: 0.08,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: CHAT_BUBBLE_EXIT_TRANSITION,
  },
};
