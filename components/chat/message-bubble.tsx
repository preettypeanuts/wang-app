"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

import {
  CHAT_BUBBLE_ASSISTANT_VARIANTS,
  CHAT_BUBBLE_USER_VARIANTS,
} from "@/config/chat-animation";
import {
  CHAT_BUBBLE_BASE,
  CHAT_BUBBLE_LAYOUT_IN_MENU,
  CHAT_BUBBLE_LAYOUT_STANDALONE,
  CHAT_BUBBLE_STYLES,
  CHAT_BUBBLE_TAIL,
} from "@/config/chat-bubbles";
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
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animateEnter && !reduceMotion;
  const bubbleStyle = CHAT_BUBBLE_STYLES[role];
  const isUser = role === "user";
  const variants = isUser
    ? CHAT_BUBBLE_USER_VARIANTS
    : CHAT_BUBBLE_ASSISTANT_VARIANTS;

  const bubbleClassName = cn(
    CHAT_BUBBLE_BASE,
    inMenu ? CHAT_BUBBLE_LAYOUT_IN_MENU : CHAT_BUBBLE_LAYOUT_STANDALONE,
    !inMenu && CHAT_BUBBLE_TAIL,
    bubbleStyle.surface,
    bubbleStyle.text,
    className,
  );

  if (!shouldAnimate) {
    return (
      <div ref={ref} className={bubbleClassName}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="initial"
      animate="animate"
      style={{
        transformOrigin: isUser ? "bottom right" : "bottom left",
        willChange: "transform, opacity",
      }}
      onAnimationComplete={() => {
        if (ref.current) {
          ref.current.style.willChange = "auto";
        }
        onEnterComplete?.();
      }}
      className={bubbleClassName}
    >
      {content}
    </motion.div>
  );
}
