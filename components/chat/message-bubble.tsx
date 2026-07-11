"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import {
  CHAT_BUBBLE_BASE,
  CHAT_BUBBLE_LAYOUT_IN_MENU,
  CHAT_BUBBLE_LAYOUT_STANDALONE,
  CHAT_BUBBLE_STYLES,
  SEPARATED_SURFACE,
} from "@/config/chat-bubbles";
import {
  CHAT_MESSAGE_ASSISTANT_ANIMATE,
  CHAT_MESSAGE_ASSISTANT_ENTER,
  CHAT_MESSAGE_ASSISTANT_TRANSITION,
  CHAT_MESSAGE_USER_ANIMATE,
  CHAT_MESSAGE_USER_ENTER,
  CHAT_MESSAGE_USER_TRANSITION,
} from "@/config/chat-message-enter";
import { cn } from "@/lib/utils";
import type { MessageRole } from "@/types/chat";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  className?: string;
  animateEnter?: boolean;
  inMenu?: boolean;
  onEnterComplete?: () => void;
}

/** iMessage-style pop + slide on the bubble element itself. */
export function MessageBubble({
  role,
  content,
  className,
  animateEnter = false,
  inMenu = false,
  onEnterComplete,
}: MessageBubbleProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animateEnter && !reduceMotion;
  const [isAnimating, setIsAnimating] = useState(shouldAnimate);

  useEffect(() => {
    if (shouldAnimate) {
      setIsAnimating(true);
    }
  }, [shouldAnimate]);

  const bubbleStyle = CHAT_BUBBLE_STYLES[role];
  const isUser = role === "user";

  const bubbleClassName = cn(
    CHAT_BUBBLE_BASE,
    inMenu ? CHAT_BUBBLE_LAYOUT_IN_MENU : CHAT_BUBBLE_LAYOUT_STANDALONE,
    SEPARATED_SURFACE,
    bubbleStyle.surface,
    bubbleStyle.text,
    className,
  );

  if (!shouldAnimate) {
    return <div className={bubbleClassName}>{content}</div>;
  }

  return (
    <motion.div
      className={bubbleClassName}
      style={{
        transformOrigin: isUser ? "right bottom" : "left bottom",
        willChange: isAnimating ? "transform, opacity" : undefined,
      }}
      initial={isUser ? CHAT_MESSAGE_USER_ENTER : CHAT_MESSAGE_ASSISTANT_ENTER}
      animate={isUser ? CHAT_MESSAGE_USER_ANIMATE : CHAT_MESSAGE_ASSISTANT_ANIMATE}
      transition={
        isUser ? CHAT_MESSAGE_USER_TRANSITION : CHAT_MESSAGE_ASSISTANT_TRANSITION
      }
      onAnimationComplete={() => {
        setIsAnimating(false);
        onEnterComplete?.();
      }}
    >
      {content}
    </motion.div>
  );
}
